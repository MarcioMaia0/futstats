---
title: Table Spec players
status: Draft
version: 3.0.0
owner: Product Architecture
last_update: 2026-07-10
related_documents:
  - Table_Spec_persons.md
  - Table_Spec_team_players.md
  - Table_Spec_match_players.md
  - Table_Spec_player_modalities.md
  - Table_Spec_player_positions.md
  - ../../Domain/Players.md
  - ../../Domain/Identity.md
  - ../../API/Players_API.md
---

# Table Spec players

## Objetivo

Documentar `identidade esportiva (players)` em nível técnico.

## Finalidade

`players` representa que uma `pessoa canônica (persons)` também possui identidade esportiva dentro do FUTSTATS.

Essa tabela existe para sustentar:

- perfil esportivo do atleta;
- vínculo oficial com times;
- participação em partidas;
- histórico estatístico;
- avulsos;
- claims e merges de atleta operacional para atleta canônico.

## O que `players` é

- identidade esportiva da pessoa;
- ponto de entrada para o ecossistema estatístico e esportivo;
- ponte entre pessoa e fatos esportivos.

## O que `players` não é

- não é conta;
- não é presença autenticada na plataforma;
- não é vínculo oficial com time;
- não é participação específica em partida;
- não é papel de gestão.

## Responsabilidade no fluxo geral

No fluxo com conta:

- `players` pode nem existir no primeiro acesso;
- passa a existir quando a pessoa entra no universo esportivo de fato.

No fluxo sem conta:

- `players` pode nascer a partir de uma `person` operacional;
- isso permite elenco, avulso, histórico bruto e posterior reivindicação.

## Quando nasce

`players` pode nascer em contextos válidos como:

1. aprovação de entrada em time com função esportiva;
2. criação operacional de atleta pelo time;
3. cadastro rápido de atleta avulso na partida;
4. fluxo futuro de criação manual de atleta fora de partida;
5. reivindicação de pessoa real sobre histórico operacional, quando ainda não existir `player` canônico.

## Quem grava

`players` é gravada pela aplicação.

Casos de uso relevantes:

- `ApproveTeamJoinRequest`
- `CreateOperationalPlayer`
- `RegisterGuestPlayer`
- `PatchPlayerProfile`
- `ClaimPlayerProfile`

## Estrutura física sugerida

- schema: `public`
- nome da tabela: `players`

## Colunas

### `id`

- tipo físico: `uuid`
- nulidade: `not null`
- default sugerido: `gen_random_uuid()`
- PK: sim
- finalidade:
  - identificador esportivo canônico do atleta;
  - base para vínculos de elenco, partida, estatística e projeções derivadas.

### `person_id`

- tipo físico: `uuid`
- nulidade: `not null`
- FK: `persons.id`
- unicidade: `unique`
- `on update`: `cascade`
- `on delete`: `restrict`
- finalidade:
  - ligar o atleta à pessoa canônica.

### `dominant_foot`

- tipo físico: `dominant_foot`
- nulidade: `nullable`
- default sugerido: `null`
- finalidade:
  - registrar a perna dominante declarada do atleta.

### `birth_date`

- tipo físico: `date`
- nulidade: `nullable`
- default: sem default
- finalidade:
  - data de nascimento do atleta;
  - apoio a leitura esportiva, filtros e categorias etárias futuras.

### `height_cm`

- tipo físico: `integer`
- nulidade: `nullable`
- default: sem default
- finalidade:
  - altura declarada do atleta em centímetros.

### `weight_kg`

- tipo físico: `numeric(5,2)` ou equivalente
- nulidade: `nullable`
- default: sem default
- finalidade:
  - peso declarado do atleta em quilogramas.

### `profile_completeness_status`

- tipo físico: `player_profile_completeness_status`
- nulidade: `not null`
- default sugerido: `'INCOMPLETE'`
- finalidade:
  - resumir o grau de completude esportiva do perfil.

### `created_at`

- tipo físico: `timestamptz`
- nulidade: `not null`
- default sugerido: `now()`
- finalidade:
  - trilha de criação da identidade esportiva.

### `updated_at`

- tipo físico: `timestamptz`
- nulidade: `not null`
- default sugerido: `now()`
- manutenção sugerida:
  - trigger de atualização automática no update
- finalidade:
  - trilha da última alteração da identidade esportiva.

## Enums físicos

### `dominant_foot`

- `RIGHT`
- `LEFT`
- `AMBIDEXTROUS`

### `player_profile_completeness_status`

- `INCOMPLETE`
- `BASIC_COMPLETE`
- `ENRICHED`

## Regras dos enums

### `player_profile_completeness_status`

- `INCOMPLETE`
  - ainda não possui perfil esportivo mínimo suficiente.

- `BASIC_COMPLETE`
  - já possui ao menos uma modalidade declarada e ao menos uma posição válida para uma de suas modalidades.

- `ENRICHED`
  - além do básico, possui parte relevante dos dados complementares, como:
    - perna dominante;
    - data de nascimento;
    - altura;
    - peso.

## Constraints sugeridas

## Primary key

- `pk_players`
  - colunas: `id`

## Foreign key

- `fk_players_person`
  - coluna: `person_id`
  - referência: `persons.id`
  - `on update cascade`
  - `on delete restrict`

## Unique constraints

- `uq_players_person_id`
  - colunas: `person_id`

## Check constraints sugeridas

- `ck_players_height_cm_positive`
  - se `height_cm is not null`, então `height_cm > 0`

- `ck_players_weight_kg_positive`
  - se `weight_kg is not null`, então `weight_kg > 0`

- `ck_players_birth_date_not_future`
  - se `birth_date is not null`, então `birth_date <= current_date`

## Índices sugeridos

- `idx_players_person_id`
  - colunas: `person_id`
  - finalidade:
    - navegação rápida entre pessoa e atleta;
    - claims e merges.

- `idx_players_profile_completeness_status`
  - colunas: `profile_completeness_status`
  - finalidade:
    - CTAs de completar perfil;
    - filtros operacionais.

- `idx_players_birth_date`
  - colunas: `birth_date`
  - finalidade:
    - filtros por idade e categoria futura.

## Regras de preenchimento

### Regra mínima para existência do atleta

Para existir `players`, basta:

- `person_id`

Ou seja:

- o atleta pode nascer com perfil esportivo muito simples;
- a riqueza do perfil vem depois.

### Regra de completude

`profile_completeness_status` não deve ser confiado ao cliente.

Ele deve ser recalculado pelo backend com base em:

- `players`
- `player_modalities`
- `player_positions`

### Regra de avatar e nome

`players` não guarda:

- nome;
- apelido;
- avatar canônico.

Esses dados vêm de:

- `persons.full_name`
- `persons.nickname`
- `persons.avatar_media_id`

## Relações com outras tabelas

## Relação com `persons`

- tipo: `1 -> 0..1` do ponto de vista da pessoa
- chave: `players.person_id -> persons.id`
- regra:
  - uma pessoa pode não ser atleta;
  - um atleta sempre precisa de uma pessoa.

## Relação com `player_modalities`

- tipo: `1 -> N`
- chave dependente: `player_modalities.player_id`
- regra:
  - modalidades declaradas do atleta ficam em tabela filha.

## Relação com `player_positions`

- tipo: `1 -> N`
- chave dependente: `player_positions.player_id`
- regra:
  - posições declaradas do atleta ficam em tabela filha;
  - posição histórica real continua vindo de partida.

## Relação com `team_players`

- tipo: `1 -> N`
- chave dependente: `team_players.player_id`
- regra:
  - um atleta pode pertencer a vários times;
  - o vínculo oficial com time não fica em `players`.

## Relação com `match_players`

- tipo: `1 -> N`
- chave dependente: `match_players.player_id`
- regra:
  - um atleta pode aparecer em muitas partidas;
  - avulso também usa `players`.

## Relação com tabelas derivadas e estatísticas

`players.id` é base para:

- `player_profile_summary`
- `player_statistics_summary`
- `player_statistics_by_modality`
- `player_statistics_by_team_modality`
- `player_performance_series`
- `player_style_inference`
- `player_gallery_items`
- `player_timeline_items`

## Regras de negócio centrais

1. `players` é opcional em relação à pessoa.
2. Uma `person` pode ter no máximo um `player`.
3. O atleta pode existir sem conta.
4. O atleta pode existir sem vínculo com time.
5. O atleta pode participar de partida como avulso sem virar `team_player`.
6. O fato de existir `player` não obriga projeções avançadas imediatas.

## Atleta operacional sem conta

O sistema permite `player` operacional para:

- elenco;
- escalação;
- gols;
- substituições;
- histórico bruto da partida.

Isso é válido mesmo quando:

- não existe `public.users`;
- não existe pessoa autenticada usando o app.

## Regra de projeções avançadas

Nem todo `player` precisa gerar automaticamente todas as leituras ricas.

Se o atleta for apenas operacional e nunca for reivindicado por pessoa real, o sistema não é obrigado a manter continuamente:

- `player_profile_summary`
- `player_statistics_summary`
- `player_statistics_by_modality`
- `player_statistics_by_team_modality`
- `player_performance_series`
- outras projeções equivalentes

## Regra de claim e merge

Quando um usuário real reivindica histórico esportivo já criado operacionalmente:

- o `player` do usuário é o destino canônico;
- o `player` operacional é a origem temporária;
- os fatos históricos devem ser reatribuídos ao destino;
- as projeções derivadas devem ser reconstruídas;
- não se deve somar manualmente tabelas derivadas como verdade final.

## Regras de atualização

Atualizações em `players` podem vir de:

- tela de completar dados do atleta;
- edição do próprio perfil;
- claim com consolidação;
- backend recalculando completude.

## O que não deve ficar em `players`

Não devem ficar aqui:

- `full_name`
  - pertence a `persons`
- `nickname`
  - pertence a `persons`
- `username`
  - pertence a `users`
- `display_name`
  - pertence a `users`
- time atual do atleta
  - pertence a `team_players`
- presença em jogo
  - pertence a `match_attendance_responses`
- posição jogada em partida
  - pertence a `match_players_positions`

## Dependências diretas desta tabela

Esta tabela conversa diretamente com:

- `persons`
- `player_modalities`
- `player_positions`
- `team_players`
- `match_players`
- APIs de players
- perfil do atleta
- claim de atleta
- relatórios esportivos

## Riscos de alteração futura

Mudanças em:

- unicidade de `person_id`;
- semântica de `profile_completeness_status`;
- separação entre `players` e `team_players`;
- uso de `players` para avulsos;
- estratégia de claim/merge

impactam em cascata:

- criação de elenco;
- cadastro rápido de avulso;
- escalação;
- histórico bruto de partida;
- projeções estatísticas;
- perfil do atleta;
- fluxos de consolidação entre atleta operacional e atleta canônico.

## Resumo estrutural

Se `persons` é a pessoa de verdade e `users` é a presença dela no app, `players` é a identidade esportiva que permite que essa pessoa exista como atleta no ecossistema FUTSTATS.
