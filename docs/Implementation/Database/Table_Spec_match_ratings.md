---
title: Table Spec match_ratings
status: Draft
version: 2.0.0
owner: Product Architecture
last_update: 2026-07-10
related_documents:
  - Table_Spec_match_players.md
  - Table_Spec_match_staff.md
  - Table_Spec_follows.md
  - Table_Spec_referee_reviews.md
  - ../../Domain/Matches.md
  - ../../API/Players_API.md
  - ../../API/Teams_API.md
---

# Table Spec match_ratings

## Objetivo

Documentar `notas da partida (match_ratings)` em nível técnico.

## Finalidade

`match_ratings` representa as notas dadas aos participantes de uma partida, separando claramente:

- nota de companheiros (`PEER`);
- nota da torcida/geral (`GENERAL`).

Ela existe para sustentar:

- percepção social sobre o desempenho;
- percepção interna do elenco;
- leitura separada entre avaliação técnica dos pares e avaliação da geral;
- histórico por atleta e por técnico.

## O que `match_ratings` é

- avaliação contextual por partida;
- opinião persistida de um usuário autenticado;
- camada social derivada do jogo.

## O que `match_ratings` não é

- não é estatística factual;
- não é nota do árbitro;
- não é inferência automática de performance;
- não é ranking final consolidado do atleta.

## Responsabilidade na cadeia do domínio

No fluxo correto:

1. a partida existe;
2. seus participantes reais existem em `match_players` e `match_staff`;
3. usuários elegíveis avaliam alguém daquele contexto;
4. cada nota nasce em `match_ratings`;
5. leituras analíticas futuras agregam isso sem misturar com scout factual.

Logo:

- fato esportivo pertence às tabelas operacionais da partida;
- opinião humana sobre esse desempenho pertence a `match_ratings`.

## Quando nasce

`match_ratings` pode nascer quando:

1. após a partida, um companheiro avalia um jogador;
2. após a partida, a torcida avalia um jogador;
3. após a partida, alguém avalia o técnico efetivo;
4. a UI social do jogo abre o fluxo de notas.

## Quem grava

`match_ratings` é gravada pela aplicação.

Casos de uso relevantes:

- `RateMatchPlayerAsPeer`
- `RateMatchPlayerAsGeneral`
- `RateMatchCoach`
- `UpdateMatchRating`

## Estrutura física sugerida

- schema: `public`
- nome da tabela: `match_ratings`

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
  - apontar a qual partida a nota pertence.

### `rater_user_id`

- tipo físico: `uuid`
- nulidade: `not null`
- FK: `users.id`
- `on update`: `cascade`
- `on delete`: `restrict`
- finalidade:
  - identificar quem deu a nota.

### `target_type`

- tipo físico: `rating_target`
- nulidade: `not null`
- finalidade:
  - indicar se o alvo é jogador ou técnico.

### `target_match_player_id`

- tipo físico: `uuid`
- nulidade: `nullable`
- FK: `match_players.id`
- `on update`: `cascade`
- `on delete`: `restrict`
- finalidade:
  - apontar a atuação do atleta naquela partida, quando o alvo for jogador.

### `target_player_id`

- tipo físico: `uuid`
- nulidade: `nullable`
- FK: `players.id`
- `on update`: `cascade`
- `on delete`: `restrict`
- finalidade:
  - facilitar agregações por atleta e leituras futuras de perfil, quando o alvo for jogador.

### `target_match_staff_id`

- tipo físico: `uuid`
- nulidade: `nullable`
- FK: `match_staff.id`
- `on update`: `cascade`
- `on delete`: `restrict`
- finalidade:
  - apontar o técnico efetivo daquela partida, quando o alvo for técnico.

### `rating_type`

- tipo físico: `rating_type`
- nulidade: `not null`
- finalidade:
  - separar nota de companheiro e nota da geral.

### `score`

- tipo físico: `numeric(4,2)`
- nulidade: `not null`
- finalidade:
  - nota atribuída ao alvo.

### `description`

- tipo físico: `text`
- nulidade: `nullable`
- finalidade:
  - justificativa opcional, comentário curto ou resenha adicional.

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

### `rating_type`

- `PEER`
- `GENERAL`

### `rating_target`

- `PLAYER`
- `COACH`

## Regras dos enums

### `PEER`

- nota dada por alguém do próprio contexto esportivo da partida.

### `GENERAL`

- “nota da geral”, dada por seguidor elegível do time.

### `PLAYER`

- alvo é um atleta relacionado àquela partida.

### `COACH`

- alvo é o técnico efetivo registrado em `match_staff`.

## Constraints sugeridas

## Primary key

- `pk_match_ratings`
  - colunas: `id`

## Foreign keys

- `fk_match_ratings_match`
  - coluna: `match_id`
  - referência: `matches.id`
  - `on update cascade`
  - `on delete restrict`

- `fk_match_ratings_rater_user`
  - coluna: `rater_user_id`
  - referência: `users.id`
  - `on update cascade`
  - `on delete restrict`

- `fk_match_ratings_target_match_player`
  - coluna: `target_match_player_id`
  - referência: `match_players.id`
  - `on update cascade`
  - `on delete restrict`

- `fk_match_ratings_target_player`
  - coluna: `target_player_id`
  - referência: `players.id`
  - `on update cascade`
  - `on delete restrict`

- `fk_match_ratings_target_match_staff`
  - coluna: `target_match_staff_id`
  - referência: `match_staff.id`
  - `on update cascade`
  - `on delete restrict`

## Check constraints sugeridas

- `ck_match_ratings_score_range`
  - `score >= 0 and score <= 10`

- `ck_match_ratings_description_not_blank_when_present`
  - se `description is not null`, então `btrim(description) <> ''`

- `ck_match_ratings_target_shape_player`
  - se `target_type = 'PLAYER'`, então:
    - `target_match_player_id is not null`
    - `target_player_id is not null`
    - `target_match_staff_id is null`

- `ck_match_ratings_target_shape_coach`
  - se `target_type = 'COACH'`, então:
    - `target_match_staff_id is not null`
    - `target_match_player_id is null`
    - `target_player_id is null`

## Unicidade

Deve existir no máximo uma nota por:

- `match_id + rater_user_id + rating_type + target_type + target_match_player_id + target_match_staff_id`

Nome sugerido:

- `uq_match_ratings_match_rater_target`

## Índices sugeridos

- `idx_match_ratings_match_id`
  - colunas: `match_id`
  - finalidade:
    - listar notas da partida.

- `idx_match_ratings_target_player_id`
  - colunas: `target_player_id`
  - finalidade:
    - agregações por atleta.

- `idx_match_ratings_target_match_staff_id`
  - colunas: `target_match_staff_id`
  - finalidade:
    - agregações por técnico efetivo.

- `idx_match_ratings_rating_type`
  - colunas: `rating_type`
  - finalidade:
    - separar `PEER` e `GENERAL`.

- `idx_match_ratings_target_type`
  - colunas: `target_type`
  - finalidade:
    - separar jogador e técnico.

## Regras de negócio centrais

1. As médias `PEER` e `GENERAL` nunca devem ser misturadas.
2. A nota existe apenas após a partida.
3. `PEER` exige elegibilidade esportiva contextual.
4. `GENERAL` exige elegibilidade de torcida via `follows`.
5. Árbitro não é avaliado aqui; isso pertence a `referee_reviews`.

## Regras de consistência contextual

### Coerência com o alvo jogador

Se `target_type = PLAYER`:

- `target_match_player_id` deve pertencer ao mesmo `match_id`;
- `target_player_id` deve ser igual ao `player_id` daquela linha de `match_players`.

### Coerência com o alvo técnico

Se `target_type = COACH`:

- `target_match_staff_id` deve pertencer ao mesmo `match_id`;
- `target_match_staff_id` deve apontar para `staff_role = HEAD_COACH` no recorte atual.

### Coerência da nota `PEER`

Para `rating_type = PEER`, o backend deve validar que:

- o `rater_user_id` representa uma pessoa com `player` válido;
- esse `player` foi relacionado naquela partida em `match_players`.

### Coerência da nota `GENERAL`

Para `rating_type = GENERAL`, o backend deve validar que:

- o `rater_user_id` segue o time da partida em `follows`;
- seguir o time não significa ser integrante dele.

### Autoavaliação

No estado atual do produto, recomenda-se impedir:

- jogador dar nota `PEER` para si mesmo;
- técnico avaliar a si mesmo.

## Relações com outras tabelas

## Relação com `matches`

- tipo: `N -> 1`
- chave: `match_ratings.match_id -> matches.id`
- regra:
  - toda nota pertence a uma partida específica.

## Relação com `match_players`

- tipo: `N -> 0..1`
- chave: `match_ratings.target_match_player_id -> match_players.id`
- regra:
  - usada quando o alvo é jogador.

## Relação com `players`

- tipo: `N -> 0..1`
- chave: `match_ratings.target_player_id -> players.id`
- regra:
  - usada para agregações futuras por atleta e perfil.

## Relação com `match_staff`

- tipo: `N -> 0..1`
- chave: `match_ratings.target_match_staff_id -> match_staff.id`
- regra:
  - usada quando o alvo é o técnico efetivo da partida.

## Relação com `follows`

- relação indireta
- regra:
  - governa elegibilidade da nota `GENERAL`.

## Regras operacionais por fluxo

### Nota de companheiro

Fluxo:

- a pessoa participou da partida como atleta;
- pode avaliar outro jogador relacionado;
- a média entra em `PEER`.

### Nota da geral

Fluxo:

- a pessoa segue o time;
- pode avaliar os nomes daquele lado;
- a média entra em `GENERAL`.

### Nota para o técnico

Fluxo:

- a partida possui `match_staff` com `HEAD_COACH`;
- o usuário elegível avalia esse técnico;
- o alvo da nota é `target_match_staff_id`.

## O que não deve ficar em `match_ratings`

Não devem ficar aqui:

- scout factual;
- nota do árbitro;
- competência derivada do árbitro;
- inferência automática de estilo de jogo.

Esses dados pertencem, respectivamente, a:

- tabelas operacionais da partida
- `referee_reviews`
- `referee_reviews` e camadas derivadas
- camadas analíticas futuras

## Dependências diretas desta tabela

Esta tabela conversa diretamente com:

- `matches`
- `match_players`
- `players`
- `match_staff`
- `follows`
- `Players_API`
- `Teams_API`

## Riscos de alteração futura

Mudanças em:

- semântica de `PEER` e `GENERAL`;
- política de elegibilidade;
- nota para técnico;
- modelo de alvo por jogador

impactam em cascata:

- perfil do atleta;
- leituras sociais do jogo;
- ranking interno;
- dashboard de desempenho percebido;
- comparação entre percepção e scout factual.

## Resumo estrutural

`match_ratings` é a camada de percepção humana sobre o jogo. Ela não mede o que aconteceu de fato; ela mede como atletas, torcida e contexto leram o desempenho de jogadores e técnico naquela partida, mantendo `PEER` e `GENERAL` sempre separados.
