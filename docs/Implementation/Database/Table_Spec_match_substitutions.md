---
title: Table Spec match_substitutions
status: Draft
version: 2.0.0
owner: Product Architecture
last_update: 2026-07-10
related_documents:
  - Table_Spec_match_players.md
  - Table_Spec_match_opponent_players.md
  - Table_Spec_match_events.md
  - Table_Spec_matches.md
  - ../../Domain/Matches.md
  - ../../API/Matches_API.md
---

# Table Spec match_substitutions

## Objetivo

Documentar `substituições da partida (match_substitutions)` em nível técnico.

## Finalidade

`match_substitutions` representa a troca explícita de atores durante a partida, registrando quem entrou no lugar de quem e em qual momento.

Ela existe para sustentar:

- leitura temporal de quem estava em quadra ou campo;
- cálculo futuro de presença efetiva em quadra;
- análises como plus/minus;
- prancheta eletrônica e revisão por vídeo.

## O que `match_substitutions` é

- fato operacional de troca;
- entidade temporal da dinâmica do jogo;
- vínculo entre elenco relacionado e presença efetiva em quadra em cada momento.

## O que `match_substitutions` não é

- não é escalação inicial;
- não é evento tático genérico;
- não é gol;
- não é scout fino;
- não cria nem remove relacionado da partida.

## Responsabilidade na cadeia do domínio

No fluxo correto:

1. a escalação do quadro cria `match_players`;
2. o jogo começa;
3. quando alguém entra no lugar de outro, nasce uma linha em `match_substitutions`;
4. os eventos posteriores podem ser interpretados considerando quem estava em quadra naquele segundo.

Logo:

- relacionados pertencem a `match_players`;
- trocas pertencem a `match_substitutions`;
- lances e acontecimentos pertencem a `match_events`.

## Quando nasce

`match_substitutions` nasce quando ocorre uma troca explícita durante a partida.

## Quem grava

`match_substitutions` é gravada pela aplicação.

Casos de uso relevantes:

- `RegisterHomeSubstitution`
- `RegisterOpponentSubstitution`
- `ReconcileSubstitutionAfterReview`

## Estrutura física sugerida

- schema: `public`
- nome da tabela: `match_substitutions`

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
  - apontar a qual partida operacional a troca pertence.

### `participant_side`

- tipo físico: `participant_side`
- nulidade: `not null`
- finalidade:
  - indicar se a troca é do próprio time ou do adversário.

### `team_id`

- tipo físico: `uuid`
- nulidade: `nullable`
- FK: `teams.id`
- `on update`: `cascade`
- `on delete`: `restrict`
- finalidade:
  - identificar o lado do próprio time quando `participant_side = HOME`.

### `local_opponent_id`

- tipo físico: `uuid`
- nulidade: `nullable`
- FK: `local_opponents.id`
- `on update`: `cascade`
- `on delete`: `restrict`
- finalidade:
  - identificar o lado adversário local quando `participant_side = OPPONENT` e houver memória privada do adversário.

### `player_in_match_player_id`

- tipo físico: `uuid`
- nulidade: `nullable`
- FK: `match_players.id`
- `on update`: `cascade`
- `on delete`: `restrict`
- finalidade:
  - atleta do próprio time que entrou.

### `player_out_match_player_id`

- tipo físico: `uuid`
- nulidade: `nullable`
- FK: `match_players.id`
- `on update`: `cascade`
- `on delete`: `restrict`
- finalidade:
  - atleta do próprio time que saiu.

### `opponent_player_in_match_opponent_player_id`

- tipo físico: `uuid`
- nulidade: `nullable`
- FK: `match_opponent_players.id`
- `on update`: `cascade`
- `on delete`: `restrict`
- finalidade:
  - ator adversário que entrou.

### `opponent_player_out_match_opponent_player_id`

- tipo físico: `uuid`
- nulidade: `nullable`
- FK: `match_opponent_players.id`
- `on update`: `cascade`
- `on delete`: `restrict`
- finalidade:
  - ator adversário que saiu.

### `clock_second`

- tipo físico: `integer`
- nulidade: `nullable`
- finalidade:
  - segundo canônico do cronômetro em que a troca foi registrada ou consolidada.

### `created_at`

- tipo físico: `timestamptz`
- nulidade: `not null`
- default sugerido: `now()`

## Enums físicos

### `participant_side`

- `HOME`
- `OPPONENT`

## Regras dos enums

- `HOME`
  - usa `player_in_match_player_id` e `player_out_match_player_id`.

- `OPPONENT`
  - usa `opponent_player_in_match_opponent_player_id` e `opponent_player_out_match_opponent_player_id`.

## Constraints sugeridas

## Primary key

- `pk_match_substitutions`
  - colunas: `id`

## Foreign keys

- `fk_match_substitutions_match`
  - coluna: `match_id`
  - referência: `matches.id`
  - `on update cascade`
  - `on delete restrict`

- `fk_match_substitutions_team`
  - coluna: `team_id`
  - referência: `teams.id`
  - `on update cascade`
  - `on delete restrict`

- `fk_match_substitutions_local_opponent`
  - coluna: `local_opponent_id`
  - referência: `local_opponents.id`
  - `on update cascade`
  - `on delete restrict`

- `fk_match_substitutions_player_in_match_player`
  - coluna: `player_in_match_player_id`
  - referência: `match_players.id`
  - `on update cascade`
  - `on delete restrict`

- `fk_match_substitutions_player_out_match_player`
  - coluna: `player_out_match_player_id`
  - referência: `match_players.id`
  - `on update cascade`
  - `on delete restrict`

- `fk_match_substitutions_opponent_player_in`
  - coluna: `opponent_player_in_match_opponent_player_id`
  - referência: `match_opponent_players.id`
  - `on update cascade`
  - `on delete restrict`

- `fk_match_substitutions_opponent_player_out`
  - coluna: `opponent_player_out_match_opponent_player_id`
  - referência: `match_opponent_players.id`
  - `on update cascade`
  - `on delete restrict`

## Check constraints sugeridas

- `ck_match_substitutions_clock_second_non_negative_when_present`
  - se `clock_second is not null`, então `clock_second >= 0`

- `ck_match_substitutions_home_side_consistency`
  - se `participant_side = 'HOME'`, então:
    - `player_in_match_player_id is not null`
    - `player_out_match_player_id is not null`
    - `opponent_player_in_match_opponent_player_id is null`
    - `opponent_player_out_match_opponent_player_id is null`

- `ck_match_substitutions_opponent_side_consistency`
  - se `participant_side = 'OPPONENT'`, então:
    - `opponent_player_in_match_opponent_player_id is not null`
    - `opponent_player_out_match_opponent_player_id is not null`
    - `player_in_match_player_id is null`
    - `player_out_match_player_id is null`

## Índices sugeridos

- `idx_match_substitutions_match_id`
  - colunas: `match_id`
  - finalidade:
    - listar trocas da partida.

- `idx_match_substitutions_match_id_clock_second`
  - colunas: (`match_id`, `clock_second`)
  - finalidade:
    - montar timeline de trocas.

- `idx_match_substitutions_participant_side`
  - colunas: `participant_side`
  - finalidade:
    - separar trocas do próprio time e do adversário.

- `idx_match_substitutions_player_in_match_player_id`
  - colunas: `player_in_match_player_id`
  - finalidade:
    - rastrear entradas do atleta do próprio time.

- `idx_match_substitutions_player_out_match_player_id`
  - colunas: `player_out_match_player_id`
  - finalidade:
    - rastrear saídas do atleta do próprio time.

## Regras de negócio centrais

1. Cada linha representa uma substituição explícita.
2. A substituição não altera o fato de ambos já estarem relacionados em `match_players` ou `match_opponent_players`.
3. Esta tabela não substitui eventos de gol, cartão ou scout.
4. Ela representa a dinâmica de troca de atores durante o jogo.
5. Não pode existir substituição entre partidas diferentes.
6. Não pode existir substituição entre quadros diferentes.

## Regras de consistência contextual

### Coerência com `match_id`

Entradas e saídas devem pertencer ao mesmo `match_id`.

Isso vale para:

- `player_in_match_player_id`
- `player_out_match_player_id`
- `opponent_player_in_match_opponent_player_id`
- `opponent_player_out_match_opponent_player_id`

### Coerência com quadro

Como `match_players` e `match_opponent_players` já pertencem a um quadro específico:

- a substituição herda naturalmente o quadro da `match`;
- o backend deve impedir troca entre atores de quadros diferentes.

### Coerência com o mesmo lado

Quando `participant_side = HOME`:

- entrada e saída devem ser do próprio time.

Quando `participant_side = OPPONENT`:

- entrada e saída devem ser do lado adversário.

## Relações com outras tabelas

## Relação com `matches`

- tipo: `N -> 1`
- chave: `match_substitutions.match_id -> matches.id`
- regra:
  - toda substituição pertence a uma partida operacional específica.

## Relação com `match_players`

- tipo: `N -> 0..2`
- regra:
  - usada quando a troca é do próprio time.

## Relação com `match_opponent_players`

- tipo: `N -> 0..2`
- regra:
  - usada quando a troca é do adversário.

## Relação com `match_events`

- `match_substitutions` não substitui `match_events`;
- `match_events` registra lances;
- `match_substitutions` registra trocas de atores.

## Regras operacionais por fluxo

### Substituição do adversário exige ator identificado

Regra:

- diferente do gol adversário, `substituições da partida (match_substitutions)` do lado adversário não podem existir sem atores identificados;
- se `participant_side = OPPONENT`, a troca deve apontar:
  - quem entrou;
  - quem saiu;
- portanto, para registrar substituição do adversário, o operador precisa ter criado antes ou no mesmo fluxo os `jogadores adversários da partida (match_opponent_players)` envolvidos.

### Fluxo mínimo do próprio time

Exemplo:

- `participant_side = HOME`
- atleta A sai
- atleta B entra

Nesse caso:

- `player_out_match_player_id` é obrigatório;
- `player_in_match_player_id` é obrigatório;
- a troca não cria novos relacionados.

### Fluxo mínimo do adversário

Exemplo:

- `participant_side = OPPONENT`
- adversário camisa 7 sai
- adversário camisa 14 entra

Nesse caso:

- `opponent_player_out_match_opponent_player_id` é obrigatório;
- `opponent_player_in_match_opponent_player_id` é obrigatório;
- ambos precisam já existir em `match_opponent_players`.

### Substituição do próprio time

Fluxo:

- operador arrasta quem sai;
- escolhe quem entra;
- o sistema registra:
  - `participant_side = HOME`
  - `player_out_match_player_id`
  - `player_in_match_player_id`
  - `clock_second`

### Substituição do adversário

Fluxo:

- se o produto estiver registrando o lado adversário naquele jogo;
- o sistema registra a troca usando `match_opponent_players`.

### Revisão posterior

Fluxo:

- substituições podem ser incluídas ou corrigidas depois do jogo;
- o horário canônico deve refletir o melhor entendimento factual possível.

## O que não deve ficar em `match_substitutions`

Não devem ficar aqui:

- criação de relacionado;
- remoção de relacionado;
- posição jogada;
- gol;
- falta;
- telemetria bruta do cronômetro.

Esses dados pertencem, respectivamente, a:

- `match_players`
- `match_players`
- `match_players_positions`
- `match_goals`
- `match_events`
- camada operacional transitória

## Dependências diretas desta tabela

Esta tabela conversa diretamente com:

- `matches`
- `match_players`
- `match_opponent_players`
- `match_events`
- `Matches_API`
- cronologia da partida

## Riscos de alteração futura

Mudanças em:

- semântica de entrada e saída;
- suporte ao lado adversário;
- uso de `clock_second`;
- regra de quadro

impactam em cascata:

- timeline da partida;
- leitura de quem estava em quadra;
- estatísticas temporais;
- plus/minus;
- revisão de vídeo.

## Resumo estrutural

`match_substitutions` é a memória das trocas do jogo. Ela não diz quem era do elenco nem quem confirmou presença; ela diz, com contexto temporal, quem entrou no lugar de quem dentro de um quadro real da partida.
