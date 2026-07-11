---
title: Table Spec match_cards
status: Draft
version: 2.0.0
owner: Product Architecture
last_update: 2026-07-10
related_documents:
  - Table_Spec_matches.md
  - Table_Spec_players.md
  - Table_Spec_media_assets.md
  - ../../Implementation/Core_Flows/Share_Card_Implementation.md
  - ../../Frontend/Screens/Share_Card.md
  - ../../Frontend/Card_Templates.md
  - ../../Backend/Card_Generation_Service.md
---

# Table Spec match_cards

## Objetivo

Documentar `cards compartilháveis da partida (match_cards)` em nível técnico.

## Finalidade

`match_cards` representa os artefatos visuais gerados a partir de uma partida para compartilhamento, exportação e leitura social.

Ela existe para sustentar:

- card de resultado final;
- card de artilheiro da partida;
- card de destaque da partida;
- card individual de atleta derivado da partida;
- histórico de cards gerados;
- reuso de um card já pronto sem precisar renderizar tudo de novo toda vez.

## O que `match_cards` é

- artefato derivado de uma partida;
- snapshot visual compartilhável;
- saída social do domínio esportivo.

## O que `match_cards` não é

- não é o resultado factual da partida;
- não é o post social em si;
- não é o template mestre do design;
- não é o arquivo de mídia canônico do time ou do atleta;
- não é card de “próximo jogo” genérico fora do contexto da partida.

## Responsabilidade na cadeia do domínio

No fluxo correto:

1. a partida existe e fornece dados factuais;
2. o sistema ou usuário solicita um card;
3. o serviço de geração monta um snapshot visual;
4. o arquivo final e seu contexto são persistidos em `match_cards`;
5. o card pode ser compartilhado, distribuído ou reaproveitado depois.

Logo:

- fato esportivo pertence a `matches`, `match_goals`, `match_events` e correlatas;
- arquivo visual derivado pertence a `match_cards`;
- publicação social ampla pertence a outras camadas, como `posts`, quando aplicável.

## Quando nasce

`match_cards` pode nascer quando:

1. a partida é finalizada e o usuário gera card de resultado;
2. o sistema gera um card derivado de artilheiro ou destaque;
3. um usuário solicita novamente uma variante visual da mesma partida;
4. um fluxo social decide preparar um card para compartilhamento posterior.

## Quem grava

`match_cards` é gravada pela aplicação.

Casos de uso relevantes:

- `GenerateMatchResultCard`
- `GenerateMatchTopScorerCard`
- `GenerateMatchStandoutCard`
- `GenerateMatchPlayerSpotlightCard`
- `RegenerateMatchCardVariant`

## Estrutura física sugerida

- schema: `public`
- nome da tabela: `match_cards`

## Colunas

### `id`

- tipo físico: `uuid`
- nulidade: `not null`
- default sugerido: `gen_random_uuid()`
- PK: sim

### `match_id`

- tipo físico: `uuid`
- nulidade: `not null`
- FK: `matches.id`
- `on update`: `cascade`
- `on delete`: `restrict`
- finalidade:
  - apontar de qual partida o card foi derivado.

### `team_id`

- tipo físico: `uuid`
- nulidade: `not null`
- FK: `teams.id`
- `on update`: `cascade`
- `on delete`: `restrict`
- finalidade:
  - identificar de qual lado/time a peça visual foi gerada.

### `card_type`

- tipo físico: `match_card_type`
- nulidade: `not null`
- finalidade:
  - indicar qual tipo de card compartilhável foi gerado.

### `target_player_id`

- tipo físico: `uuid`
- nulidade: `nullable`
- FK: `players.id`
- `on update`: `cascade`
- `on delete`: `set null`
- finalidade:
  - apontar o atleta-alvo quando o card destacar um jogador específico.

### `theme_team_id`

- tipo físico: `uuid`
- nulidade: `nullable`
- FK: `teams.id`
- `on update`: `cascade`
- `on delete`: `set null`
- finalidade:
  - registrar qual time forneceu o tema visual principal do card, quando isso variar do time da partida por regra futura.

### `render_status`

- tipo físico: `match_card_render_status`
- nulidade: `not null`
- default sugerido: `READY`
- finalidade:
  - indicar o estado da geração do card.

### `media_asset_id`

- tipo físico: `uuid`
- nulidade: `nullable`
- FK: `media_assets.id`
- `on update`: `cascade`
- `on delete`: `set null`
- finalidade:
  - apontar o arquivo final gerado para imagem compartilhável, quando já existir.

### `payload_snapshot`

- tipo físico: `jsonb`
- nulidade: `not null`
- default sugerido: `'{}'::jsonb`
- finalidade:
  - congelar os dados usados para compor o card naquele momento.

### `template_snapshot`

- tipo físico: `jsonb`
- nulidade: `nullable`
- finalidade:
  - congelar a variante visual, proporção e decisões de layout usadas na renderização.

### `share_url`

- tipo físico: `text`
- nulidade: `nullable`
- finalidade:
  - link público ou controlado para abertura do card, quando existir.

### `generated_by_user_id`

- tipo físico: `uuid`
- nulidade: `nullable`
- FK: `users.id`
- `on update`: `cascade`
- `on delete`: `set null`
- finalidade:
  - registrar qual usuário disparou a geração do card.

### `created_at`

- tipo físico: `timestamptz`
- nulidade: `not null`
- default sugerido: `now()`

### `updated_at`

- tipo físico: `timestamptz`
- nulidade: `not null`
- default sugerido: `now()`
- manutenção sugerida:
  - trigger de atualização automática no update

## Enums físicos

### `match_card_type`

- `MATCH_RESULT`
- `MATCH_TOP_SCORER`
- `MATCH_STANDOUT`
- `MATCH_PLAYER_SPOTLIGHT`

### `match_card_render_status`

- `PENDING`
- `READY`
- `FAILED`

## Regras dos enums

### `MATCH_RESULT`

- card principal do resultado da partida.

### `MATCH_TOP_SCORER`

- card destacando o artilheiro daquela partida.

### `MATCH_STANDOUT`

- card destacando o principal nome do jogo segundo a regra de destaque vigente.

### `MATCH_PLAYER_SPOTLIGHT`

- card individual de um atleta com contexto daquela partida.

### `PENDING`

- geração solicitada, ainda sem arte final pronta.

### `READY`

- arte final pronta para leitura e compartilhamento.

### `FAILED`

- geração falhou e pode exigir nova tentativa.

## Constraints sugeridas

## Primary key

- `pk_match_cards`
  - colunas: `id`

## Foreign keys

- `fk_match_cards_match`
  - coluna: `match_id`
  - referência: `matches.id`
  - `on update cascade`
  - `on delete restrict`

- `fk_match_cards_team`
  - coluna: `team_id`
  - referência: `teams.id`
  - `on update cascade`
  - `on delete restrict`

- `fk_match_cards_target_player`
  - coluna: `target_player_id`
  - referência: `players.id`
  - `on update cascade`
  - `on delete set null`

- `fk_match_cards_theme_team`
  - coluna: `theme_team_id`
  - referência: `teams.id`
  - `on update cascade`
  - `on delete set null`

- `fk_match_cards_media_asset`
  - coluna: `media_asset_id`
  - referência: `media_assets.id`
  - `on update cascade`
  - `on delete set null`

- `fk_match_cards_generated_by_user`
  - coluna: `generated_by_user_id`
  - referência: `users.id`
  - `on update cascade`
  - `on delete set null`

## Check constraints sugeridas

- `ck_match_cards_share_url_not_blank_when_present`
  - se `share_url is not null`, então `btrim(share_url) <> ''`

- `ck_match_cards_player_target_required_by_type`
  - se `card_type in ('MATCH_TOP_SCORER', 'MATCH_STANDOUT', 'MATCH_PLAYER_SPOTLIGHT')`, então `target_player_id is not null`

- `ck_match_cards_player_target_forbidden_for_result`
  - se `card_type = 'MATCH_RESULT'`, então `target_player_id is null`

## Índices sugeridos

- `idx_match_cards_match_id`
  - colunas: `match_id`
  - finalidade:
    - listar cards derivados da partida.

- `idx_match_cards_team_id`
  - colunas: `team_id`
  - finalidade:
    - leitura por time.

- `idx_match_cards_target_player_id`
  - colunas: `target_player_id`
  - finalidade:
    - leitura por atleta destacado.

- `idx_match_cards_card_type`
  - colunas: `card_type`
  - finalidade:
    - filtrar variantes.

- `idx_match_cards_render_status`
  - colunas: `render_status`
  - finalidade:
    - filas e reprocessamento.

## Regras de negócio centrais

1. `match_cards` é derivado da partida, não fonte factual do placar.
2. O card deve usar tema do time quando disponível.
3. Se faltar escudo, foto ou algum dado visual, a geração deve usar fallback.
4. Card precisa poder ser exportado como imagem.
5. Card precisa respeitar privacidade e não expor dado privado sem permissão.
6. O produto atual prioriza cards realmente derivados de `match`.

## Regras de consistência contextual

### Coerência com a partida

O backend deve validar que:

- `match_cards.team_id = matches.team_id`

em todos os cards centrados no próprio time.

### Coerência com o atleta-alvo

Se `target_player_id` existir:

- ele deve ser coerente com a narrativa do card;
- idealmente deve existir relação factual com aquela partida.

No estado atual:

- o backend deve validar isso semanticamente contra leitura da partida e seus derivados.

### Coerência com geração

Se `render_status = READY`:

- espera-se que `media_asset_id` exista ou que o card tenha payload suficiente para leitura reaproveitável imediata.

Se `render_status = FAILED`:

- a linha deve preservar contexto para retry posterior.

## Relações com outras tabelas

## Relação com `matches`

- tipo: `N -> 1`
- chave: `match_cards.match_id -> matches.id`
- regra:
  - todo card desta tabela deriva de uma partida específica.

## Relação com `players`

- tipo: `N -> 0..1`
- chave: `match_cards.target_player_id -> players.id`
- regra:
  - existe quando o card destaca um atleta.

## Relação com `media_assets`

- tipo: `N -> 0..1`
- chave: `match_cards.media_asset_id -> media_assets.id`
- regra:
  - guarda o arquivo final renderizado, quando houver persistência da arte.

## Regras operacionais por fluxo

### Card de resultado

Fluxo:

- partida finaliza;
- usuário solicita compartilhamento;
- sistema gera `MATCH_RESULT`.

### Card de artilheiro ou destaque

Fluxo:

- o sistema identifica o atleta alvo;
- gera variante visual focada nesse jogador;
- `target_player_id` é persistido.

### Reprocessamento

Fluxo:

- falha de geração, mudança de template ou novo share;
- a aplicação pode gerar nova linha ou nova versão, conforme política futura.

## O que não deve ficar em `match_cards`

Não devem ficar aqui:

- verdade canônica do placar;
- eventos detalhados da partida;
- publicação social multi-rede;
- cards de agenda futura não derivados de partida.

Esses dados pertencem, respectivamente, a:

- `matches` e `match_goals`
- `match_events`
- camadas de `posts` e distribuição
- outro agregado futuro mais genérico, se o produto quiser ampliar além de `match`

## Dependências diretas desta tabela

Esta tabela conversa diretamente com:

- `matches`
- `players`
- `media_assets`
- `Share_Card_Implementation`
- `Share_Card` screen
- `Card_Generation_Service`

## Riscos de alteração futura

Mudanças em:

- escopo de `match_card_type`;
- política de persistir imagem vs. regenerar sob demanda;
- vínculo com atleta;
- expansão para cards de agenda ou ranking

impactam em cascata:

- compartilhamento social;
- cache de cards;
- feed e reutilização visual;
- consistência entre social e domínio esportivo.

## Resumo estrutural

`match_cards` é a memória persistida dos cards compartilháveis gerados a partir da partida. Ele existe para viralização, resenha e reutilização visual, mas sem misturar a arte compartilhada com a verdade factual do jogo.
