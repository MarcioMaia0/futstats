---
title: Table Spec match_goals
status: Draft
version: 2.1.0
owner: Product Architecture
last_update: 2026-07-10
related_documents:
  - Table_Spec_matches.md
  - Table_Spec_players.md
  - Table_Spec_match_players.md
  - Table_Spec_match_events.md
  - ../../Domain/Matches.md
  - ../../API/Matches_API.md
---

# Table Spec match_goals

## Objetivo

Documentar `gols da partida (match_goals)` em nível técnico.

## Finalidade

`match_goals` representa o registro operacional e estatístico de cada gol da partida.

Ela existe para sustentar:

- placar oficial;
- autoria do gol quando conhecida;
- assistência quando registrada;
- gol contra;
- leitura rápida para fluxo casual;
- base confiável para estatísticas diretas de gols e assistências.

## O que `match_goals` é

- registro de gol efetivamente contado no placar;
- entidade operacional sensível para leitura do resultado;
- base factual simples para estatísticas diretas.

## O que `match_goals` não é

- não é a malha completa do scout fino;
- não é substituição;
- não é evento genérico;
- não é timeline completa de lances.

## Responsabilidade na cadeia do domínio

No fluxo correto:

1. o gol é registrado rapidamente ou por fluxo detalhado;
2. nasce uma linha em `match_goals`;
3. o placar da `match` é recalculado;
4. o scout fino pode ou não também manter evento correspondente em `match_events`, conforme o fluxo usado.

Logo:

- `match_goals` segura a camada simples e sensível do placar;
- `match_events` segura a camada rica e progressiva do scout;
- os dois podem coexistir, mas não são a mesma coisa.

## Quando nasce

`match_goals` nasce quando um gol válido é registrado para o placar da partida.

Ele pode nascer:

1. pelo fluxo casual rápido;
2. por um fluxo detalhado de scout;
3. por revisão posterior.

## Quem grava

`match_goals` é gravada pela aplicação.

Casos de uso relevantes:

- `RegisterQuickGoal`
- `RegisterDetailedGoal`
- `EditGoalAttribution`
- `ReconcileGoalAfterReview`

## Estrutura física sugerida

- schema: `public`
- nome da tabela: `match_goals`

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
  - apontar a qual partida o gol pertence.

### `match_player_id`

- tipo físico: `uuid`
- nulidade: `nullable`
- FK: `match_players.id`
- `on update`: `cascade`
- `on delete`: `restrict`
- finalidade:
  - referência factual preferencial ao autor do gol quando ele estiver identificado no contexto completo da partida.

### `player_id`

- tipo físico: `uuid`
- nulidade: `nullable`
- FK: `players.id`
- `on update`: `cascade`
- `on delete`: `restrict`
- finalidade:
  - autor do gol em nível de identidade esportiva, quando conhecido.

### `assist_player_id`

- tipo físico: `uuid`
- nulidade: `nullable`
- FK: `players.id`
- `on update`: `cascade`
- `on delete`: `restrict`
- finalidade:
  - atleta que deu a assistência, quando registrada.

### `clock_second`

- tipo físico: `integer`
- nulidade: `nullable`
- finalidade:
  - segundo canônico do quadro em que o gol aconteceu.

### `minute`

- tipo físico: `integer`
- nulidade: `nullable`
- finalidade:
  - leitura simplificada de minuto do gol, quando o produto quiser exibir resumo mais humano.

### `participant_side`

- tipo físico: `participant_side`
- nulidade: `not null`
- finalidade:
  - indicar se o gol foi do próprio time ou do adversário, do ponto de vista da operação.

### `own_goal`

- tipo físico: `boolean`
- nulidade: `not null`
- default sugerido: `false`
- finalidade:
  - marcar se foi gol contra.

### `linked_match_event_id`

- tipo físico: `uuid`
- nulidade: `nullable`
- FK: `match_events.id`
- `on update`: `cascade`
- `on delete`: `set null`
- finalidade:
  - ligar o gol a um evento fino correspondente quando o fluxo rico existir.

### `created_at`

- tipo físico: `timestamptz`
- nulidade: `not null`
- default sugerido: `now()`

## Enums físicos

### `participant_side`

- `HOME`
- `OPPONENT`

## Constraints sugeridas

## Primary key

- `pk_match_goals`
  - colunas: `id`

## Foreign keys

- `fk_match_goals_match`
  - coluna: `match_id`
  - referência: `matches.id`
  - `on update cascade`
  - `on delete restrict`

- `fk_match_goals_match_player`
  - coluna: `match_player_id`
  - referência: `match_players.id`
  - `on update cascade`
  - `on delete restrict`

- `fk_match_goals_player`
  - coluna: `player_id`
  - referência: `players.id`
  - `on update cascade`
  - `on delete restrict`

- `fk_match_goals_assist_player`
  - coluna: `assist_player_id`
  - referência: `players.id`
  - `on update cascade`
  - `on delete restrict`

- `fk_match_goals_linked_match_event`
  - coluna: `linked_match_event_id`
  - referência: `match_events.id`
  - `on update cascade`
  - `on delete set null`

## Check constraints sugeridas

- `ck_match_goals_clock_second_non_negative_when_present`
  - se `clock_second is not null`, então `clock_second >= 0`

- `ck_match_goals_minute_non_negative_when_present`
  - se `minute is not null`, então `minute >= 0`

- `ck_match_goals_own_goal_assist_consistency`
  - se `own_goal = true`, `assist_player_id` deve permanecer `null` no estado atual do produto

## Índices sugeridos

- `idx_match_goals_match_id`
  - colunas: `match_id`
  - finalidade:
    - listar gols da partida.

- `idx_match_goals_match_player_id`
  - colunas: `match_player_id`
  - finalidade:
    - histórico factual por autor contextual.

- `idx_match_goals_player_id`
  - colunas: `player_id`
  - finalidade:
    - estatísticas diretas do atleta.

- `idx_match_goals_assist_player_id`
  - colunas: `assist_player_id`
  - finalidade:
    - estatísticas diretas de assistência.

- `idx_match_goals_match_id_clock_second`
  - colunas: (`match_id`, `clock_second`)
  - finalidade:
    - timeline de gols da partida.

## Regras de negócio centrais

1. Gol pode existir sem autor.
2. Como `matches` já representa um quadro específico, o gol herda esse contexto pelo próprio `match_id`.
3. Quando o autor estiver identificado no contexto completo da partida, `match_player_id` deve ser preferido como referência factual do quadro.
4. `player_id` existe para leitura direta de estatística e histórico do atleta.
5. `assist_player_id` depende apenas do que foi realmente registrado; assistência não deve ser inferida automaticamente sem regra futura explícita.
6. Editar gols deve recalcular o placar.
7. Um gol contra continua sendo gol para o placar, mas deve marcar `own_goal = true`.
8. Se `participant_side = OPPONENT`, o gol adversário pode continuar sem autor mesmo quando existirem `jogadores adversários da partida (match_opponent_players)` cadastrados para aquele jogo.
9. O cadastro de `jogadores adversários da partida (match_opponent_players)` nunca é pré-requisito para existir gol adversário no placar.

## Regras de consistência contextual

### Coerência com a partida

O backend deve validar que:

- se `match_player_id` existir, ele pertence ao mesmo `match_id`
- se `linked_match_event_id` existir, ele pertence ao mesmo `match_id`

### Coerência entre `match_player_id` e `player_id`

Se `match_player_id` existir:

- `player_id` deve ser coerente com `match_players.player_id`

Essa redundância é útil para leitura e estatística, mas precisa continuar consistente.

### Coerência de lado

Se `participant_side = HOME`:

- o gol conta para o próprio time no placar da `match`

Se `participant_side = OPPONENT`:

- o gol conta para o adversário no placar da `match`
- a autoria pode permanecer indefinida;
- o backend não deve exigir `match_opponent_player` para validar o gol.

## Relações com outras tabelas

## Relação com `matches`

- tipo: `N -> 1`
- chave: `match_goals.match_id -> matches.id`
- regra:
  - todo gol pertence a uma partida operacional específica.

## Relação com `match_players`

- tipo: `N -> 0..1`
- regra:
  - preferencial para autoria contextual do próprio time.

## Relação com `players`

- tipo: `N -> 0..2`
- regra:
  - permite registrar autor e assistente em nível de identidade esportiva.

## Relação com `match_events`

- opcional, via `linked_match_event_id`
- regra:
  - fluxo casual pode registrar gol sem evento fino correspondente;
  - fluxo rico pode ligar o gol a um evento detalhado.

## Regras operacionais por fluxo

### Fluxo casual rápido

Exemplo:

- toque no escudo;
- escolhe autor rapidamente por avatar ou número;
- salva gol.

Nesse caso:

- o gol pode nascer com `match_player_id`
- `player_id` pode acompanhar
- `linked_match_event_id` pode permanecer nulo

### Fluxo com autoria incompleta

Exemplo:

- operador só sabe que saiu gol, mas não sabe quem fez

Nesse caso:

- `match_player_id` pode ser nulo
- `player_id` pode ser nulo
- o placar continua válido

### Fluxo de gol adversário sem cadastro do adversário

Exemplo:

- o operador marca apenas que o adversário fez gol;
- nenhum jogador adversário foi cadastrado na partida.

Nesse caso:

- o gol continua válido no placar;
- `participant_side = OPPONENT` resolve o lado do gol;
- nenhuma linha em `match_opponent_players` é obrigatória.

### Fluxo de gol adversário com cadastro opcional de autoria

Exemplo:

- existem jogadores adversários cadastrados na partida;
- o operador quer marcar de quem foi o gol ou prefere não marcar.

Nesse caso:

- a autoria do gol adversário continua opcional;
- o cadastro prévio do adversário não obriga identificar o autor do gol;
- o produto pode oferecer seleção por número quando isso ajudar a operação, mas nunca como obrigatoriedade do registro do gol.

### Revisão posterior

Fluxo:

- trocar autor do gol;
- remover autor do gol;
- acrescentar assistência;
- remover assistência;
- marcar ou desmarcar gol contra;
- corrigir lado do gol quando lançado errado;
- corrigir tempo do gol;
- religar a evento fino quando houver.

Regra:

- a edição posterior deve continuar respeitando a autoria opcional;
- um gol adversário pode voltar a ficar sem autor mesmo depois de ter tido autoria preenchida;
- a existência de `match_opponent_players` cadastrados nunca obriga manter autoria preenchida no gol adversário.

## O que não deve ficar em `match_goals`

Não devem ficar aqui:

- malha completa do lance;
- substituição;
- posição jogada;
- telemetria do cronômetro.

Esses dados pertencem, respectivamente, a:

- `match_events`
- `match_substitutions`
- `match_players_positions`
- camada operacional transitória

## Dependências diretas desta tabela

Esta tabela conversa diretamente com:

- `matches`
- `match_players`
- `players`
- `match_events`
- `Matches_API`
- cálculo de placar
- `Statistics_API`

## Riscos de alteração futura

Mudanças em:

- regra de autoria opcional;
- relação entre `match_goals` e `match_events`;
- semântica de `own_goal`;
- consistência entre `match_player_id` e `player_id`

impactam em cascata:

- placar;
- fluxo casual de gol;
- estatísticas diretas de gols e assistências;
- perfil do atleta;
- revisão por vídeo.

## Resumo estrutural

`match_goals` é a camada mais simples e sensível do placar. Ela precisa ser rápida o bastante para registrar gol sem atrito, mas consistente o bastante para sustentar autoria, assistência, gol contra e estatística sem depender obrigatoriamente do scout rico.
