---
title: Endpoint Detail Players
status: Draft
version: 1.1.0
owner: Product Architecture
last_update: 2026-07-10
related_documents:
  - ../../API/Players_API.md
  - ../../API/Statistics_API.md
  - ../../Implementation/Database/Table_Spec_players.md
  - ../../Implementation/Database/Table_Spec_person_social_connections.md
  - ../../Implementation/Database/Table_Spec_player_match_statistics.md
  - ../../Implementation/Database/Table_Spec_player_gallery_items.md
  - ../../Implementation/UX/Flows/Player_Claim_Flow.md
---

# Endpoint Detail Players

## Objetivo

Detalhar endpoints de atletas com foco em perfil declarado, leitura pública e preservação do histórico factual.

## Endpoints

```http
POST /api/v1/players
GET /api/v1/players/{playerId}
PATCH /api/v1/players/{playerId}
POST /api/v1/players/{playerId}/claim
GET /api/v1/players/{playerId}/statistics
GET /api/v1/players/{playerId}/timeline
GET /api/v1/players/{playerId}/gallery
PATCH /api/v1/players/{playerId}/social-connections
```

## Regras

- Player pode existir sem user.
- Claim deve preservar histórico.
- Claim com merge deve tratar o `player` do usuário como destino canônico.
- Perfil mínimo deve ser permitido.
- `GET /players/{playerId}` deve separar:
  - dados de `person`;
  - dados de `player`;
  - redes sociais de `person`;
  - posições/modalidades declaradas;
  - histórico factual consolidado.
- `PATCH /players/{playerId}` não pode alterar histórico factual de partida.
- Estatísticas e timeline são leitura derivada, não edição direta.

## GET /api/v1/players/{playerId}

### Deve retornar blocos separados

- `person`
- `player`
- `declared_profile`
- `active_teams`
- `statistics_overview`
- `historical_positions_by_modality`
- `recent_matches`
- `permissions`

### Regra de leitura do avatar

- `person.avatar_url` pode ser exposto como URL já resolvida para a UI;
- a origem canônica persistida do avatar da pessoa continua sendo `persons.avatar_media_id`.
- `person.social_connections` vem de `person_social_connections` e deve respeitar `is_visible` na leitura pública.
- a leitura pública não precisa expor `connection_status`; ela pode expor apenas os links já visíveis.

### Formato público recomendado de `person.social_connections`

Cada item deve expor:

- `platform`
- `handle`
- `channel_url`
- `display_order`

Regras:

- a coleção já deve vir filtrada para `is_visible = true`;
- a coleção já deve vir ordenada para consumo direto da UI;
- `is_visible` não precisa ser devolvido quando a própria resposta já respeita esse filtro;
- `connection_status` não pertence ao payload público do perfil do atleta.

## GET /api/v1/players/{playerId}/statistics

### Deve retornar

- `overview`
- `by_modality`
- `by_team`
- `coverage`
- `limitations`

### Métricas mínimas do estado atual do produto

- `matches_played`
- `starter_matches`
- `bench_matches`
- `official_team_matches`
- `guest_matches`
- `wins`
- `draws`
- `losses`
- `goals_scored`
- `recorded_assists`
- `own_goals`

### Regras

- `matches_played` vem de `match_players`;
- `goals_scored` vem de `match_goals.player_id` com `own_goal = false`;
- `own_goals` vem de `match_goals.player_id` com `own_goal = true`;
- `recorded_assists` vem apenas de `match_goals.assist_player_id`;
- métricas de resultado devem considerar apenas partidas finalizadas;
- o endpoint deve expor limitações de cobertura em vez de fingir completude.

### Fontes de dados

- `persons`
- `players`
- `player_modalities`
- `player_positions`
- `modality_positions`
- `team_players`
- leituras consolidadas de partidas

### Regra de geração

- projeções estatísticas ricas podem ser adiadas para atletas puramente operacionais, sem reivindicação por usuário real;
- quando houver merge de um `player` operacional para um `player` canônico, as estatísticas devem ser recalculadas a partir dos fatos brutos.

## GET /api/v1/players/{playerId}/timeline

### Deve retornar

- `items`
- `pagination`

### Tipos iniciais do estado atual do produto

- `TEAM_JOINED`
- `PLAYER_WELCOME_POST`
- `MATCH_APPEARANCE`
- `PROFILE_CLAIMED`

### Fontes de dados

- `team_players`
- `posts`
- `match_players`
- eventos de claim do perfil, quando existirem como leitura derivada

### Regras

- ordenação por `occurred_at desc`;
- cada item deve conter resumo renderizável para UI;
- cada item deve conter referências técnicas para navegação, como `team_id`, `post_id`, `match_id` ou `match_player_id`;
- `MATCH_APPEARANCE` é um fato narrativo de participação, não substitui o endpoint de estatísticas;
- posts sociais do tipo `PLAYER_WELCOME` podem compor a timeline quando estiverem ligados ao atleta;
- o endpoint deve suportar paginação por cursor.

## GET /api/v1/players/{playerId}/gallery

### Deve retornar

- `scope`
- `items`
- `pagination`

### Filtros principais

- `scope = GENERAL`
- `scope = MODALITY`
- `scope = TEAM`
- `modality`
- `team_id`

### Fontes de dados

- `player_gallery_items`
- `player_gallery_group_counters`

### Regras

- a galeria geral deve misturar todas as modalidades e times por recência;
- a galeria por modalidade deve limitar itens e filtros aos times daquela modalidade;
- itens devem carregar plataforma, contexto esportivo e disponibilidade de embed;
- o endpoint deve ser paginado por cursor.

## PATCH /api/v1/players/{playerId}

### Pode atualizar

- `persons.full_name`
- `persons.nickname`
- `persons.avatar_media_id` via token temporário
- perna dominante;
- nascimento;
- altura;
- peso;
- modalidades declaradas;
- posições declaradas.

### Não pode atualizar

- partidas jogadas;
- posições históricas;
- estatísticas agregadas;
- vínculos em times.

### Comportamento esperado

- `declared_profile.modalities` deve ser tratado como conjunto final enviado pela tela;
- cada item de `declared_profile.modalities[].positions` deve ser validado contra `modality_positions`;
- o patch deve persistir em transação coerente entre `persons`, `players`, `player_modalities` e `player_positions`;
- `profile_completeness_status` deve ser recalculado pelo backend, e não confiado ao cliente.

## PATCH /api/v1/players/{playerId}/social-connections

### Pode atualizar

- `person_social_connections.handle`
- `person_social_connections.channel_url`
- `person_social_connections.is_visible`
- `person_social_connections.display_order`

### Não pode atualizar

- dados estatísticos do atleta;
- galeria social do atleta;
- posts publicados por time;
- tokens ou credenciais externas.

### Comportamento esperado

- a operação deve agir sobre a `person` vinculada ao `player`;
- o conjunto enviado pela tela pode ser tratado como estado final suportado;
- o backend deve validar unicidade por `platform` dentro da mesma pessoa;
- o backend deve validar domínio compatível com a plataforma quando `channel_url` existir;
- o backend pode manter `connection_status = PENDING` quando não houver conexão real com a plataforma;
- a tabela canônica de persistência é `person_social_connections`.

## POST /api/v1/players/{playerId}/claim

### Pode operar em dois modos

- `CLAIM_ONLY`
- `MERGE_OPERATIONAL_PLAYER`

### Regra canônica

- o `player` do usuário autenticado é o destino canônico da operação;
- um `player` criado apenas para uso operacional do time pode ser origem de merge;
- o sistema deve mover a referência histórica para o destino, e não copiar estatísticas derivadas manualmente.
- quando a origem vier de um time, o merge também deve consolidar a camada contextual daquele time.

### Tabelas operacionais mínimas para reatribuição

- `team_members`, quando houver contexto de time na origem
- `team_players`
- `match_players`
- `match_goals.player_id`
- `match_goals.assist_player_id`
- `match_attendance_responses`, quando a origem contextual ainda apontar para `team_member` operacional
- `match_ratings.target_match_player_id`, quando a nota depender da atuacao contextual da partida
- `match_ratings.target_player_id`
- `player_modalities`
- `player_positions`

### Conflitos esperados

- Se já existir `team_member` ativo para a mesma `person` no mesmo `team`, a origem não pode sobreviver como integrante ativo duplicado.
- Se já existir `team_players` ativo para `team_id + target_player_id`, a origem não pode gerar segundo vínculo ativo redundante.
- Se já existir `match_players` para `match_id + team_id + target_player_id`, o backend deve consolidar as linhas de contexto da partida antes de remover a origem.
- Se `match_players` precisar ser consolidado, o backend também deve reapontar dependências por `match_player_id`, como:
  - `match_players_positions`
  - `match_events`
  - `match_substitutions`

### Regra de consolidação contextual do time

- se a origem operacional existir dentro de um time:
  - o backend deve localizar o `source_team_member_id`;
  - deve localizar ou criar o `target_team_member_id` da pessoa real no mesmo time;
  - deve consolidar `team_players` em favor do `target_team_member_id`;
  - deve reapontar histórico contextual que pertença ao integrante do time, como presença em compromissos;
  - e só depois pode remover ou inutilizar a origem contextual redundante, sem mantê-la como registro ativo útil separado.

### Pós-condição obrigatória

- leituras derivadas do atleta devem ser reconstruídas depois do merge.

## Critérios de qualidade

- O fluxo deve funcionar para usuário casual sem exigir cadastro excessivo.
- Recursos avançados devem ser progressivos e opcionais.
- O comportamento deve preservar consistência entre frontend, backend, API e banco.
- Todas as entidades técnicas, payloads, enums e nomes internos devem usar inglês.
- Textos exibidos ao usuário devem passar por camada de linguagem/configuração.

## Regras para IA

Ao usar este documento como contexto para implementação, a IA deve:

1. preservar o princípio de uso casual simples;
2. não criar campos obrigatórios que bloqueiem o primeiro valor operacional;
3. respeitar separação entre dado canônico e texto de interface;
4. manter compatibilidade com evolução futura;
5. sugerir migrations, testes e endpoints quando alterar domínio.
