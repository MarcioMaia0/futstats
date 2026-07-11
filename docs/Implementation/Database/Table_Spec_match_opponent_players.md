---
title: Table Spec match_opponent_players
status: Draft
version: 2.0.0
owner: Product Architecture
last_update: 2026-07-10
related_documents:
  - Table_Spec_matches.md
  - Table_Spec_local_opponent_players.md
  - Table_Spec_match_events.md
  - Table_Spec_match_substitutions.md
  - ../../Domain/Matches.md
  - ../../API/Matches_API.md
---

# Table Spec match_opponent_players

## Objetivo

Documentar `jogadores adversários da partida (match_opponent_players)` em nível técnico.

## Finalidade

`match_opponent_players` representa os atores do lado adversário dentro da operação daquela partida específica.

Ela existe para sustentar:

- identificação operacional mínima do adversário por camisa;
- memória contextual do adversário dentro do jogo;
- autoria de gols do adversário;
- eventos do lado adversário;
- substituições do adversário;
- enriquecimento privado do histórico de confrontos.

## O que `match_opponent_players` é

- elenco adversário contextual daquela partida;
- memória operacional privada do confronto;
- ator adversário identificável para scout e resenha.

## O que `match_opponent_players` não é

- não é cadastro global de pessoa do app;
- não é `person`;
- não é `player` do domínio canônico do produto;
- não é time oficial do app;
- não é vínculo esportivo do próprio time.

## Responsabilidade na cadeia do domínio

No fluxo correto:

1. a partida operacional existe em `matches`;
2. o lado adversário pode ou não estar previamente preparado;
3. cada ator adversário usado na operação nasce em `match_opponent_players`;
4. eventos, gols e substituições do lado adversário podem apontar para essas linhas.

Logo:

- memória privada anterior do adversário pertence a `local_opponent_players`;
- memória operacional daquela partida pertence a `match_opponent_players`;
- isso não entra no domínio global de `persons/players`.

## Quando nasce

`match_opponent_players` pode nascer quando:

1. o operador prepara o adversário antes do jogo;
2. o operador quer atribuir um gol adversário por número;
3. um evento do adversário precisa de ator identificado;
4. uma substituição do adversário é registrada;
5. o operador adiciona dados mínimos em tempo real.

## Quem grava

`match_opponent_players` é gravada pela aplicação.

Casos de uso relevantes:

- `AddOpponentPlayerToMatch`
- `BindMatchOpponentPlayerToLocalMemory`
- `UpdateMatchOpponentPlayer`
- `UseOpponentPlayerInEventOrGoal`

## Estrutura física sugerida

- schema: `public`
- nome da tabela: `match_opponent_players`

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
  - apontar a qual partida operacional o ator adversário pertence.

### `local_opponent_id`

- tipo físico: `uuid`
- nulidade: `nullable`
- FK: `local_opponents.id`
- `on update`: `cascade`
- `on delete`: `restrict`
- finalidade:
  - apontar o adversário local ligado ao confronto, quando existir memória privada do time sobre ele.

### `local_opponent_player_id`

- tipo físico: `uuid`
- nulidade: `nullable`
- FK: `local_opponent_players.id`
- `on update`: `cascade`
- `on delete`: `restrict`
- finalidade:
  - reaproveitar memória privada prévia de um jogador adversário já conhecido.

### `shirt_number`

- tipo físico: `integer`
- nulidade: `not null`
- finalidade:
  - identificador mínimo obrigatório do jogador adversário na partida.

### `display_name_snapshot`

- tipo físico: `text`
- nulidade: `nullable`
- finalidade:
  - nome ou apelido contextual visto naquele jogo, quando conhecido.

### `photo_media_asset_id`

- tipo físico: `uuid`
- nulidade: `nullable`
- FK: `media_assets.id`
- `on update`: `cascade`
- `on delete`: `set null`
- finalidade:
  - foto opcional contextual do jogador adversário.

### `is_starter`

- tipo físico: `boolean`
- nulidade: `not null`
- default sugerido: `false`
- finalidade:
  - indicar se começou jogando naquele quadro.

### `removed_at`

- tipo físico: `timestamptz`
- nulidade: `nullable`
- finalidade:
  - marcar remoção lógica do `jogador adversário da partida (match_opponent_player)` quando já existir dependência factual na partida.

### `removed_by_user_id`

- tipo físico: `uuid`
- nulidade: `nullable`
- FK: `users.id`
- `on update`: `cascade`
- `on delete`: `set null`
- finalidade:
  - guardar quem executou a remoção lógica.

### `removal_reason`

- tipo físico: `text`
- nulidade: `nullable`
- finalidade:
  - guardar o motivo operacional da remoção lógica.

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

## Constraints sugeridas

## Primary key

- `pk_match_opponent_players`
  - colunas: `id`

## Foreign keys

- `fk_match_opponent_players_match`
  - coluna: `match_id`
  - referência: `matches.id`
  - `on update cascade`
  - `on delete restrict`

- `fk_match_opponent_players_local_opponent`
  - coluna: `local_opponent_id`
  - referência: `local_opponents.id`
  - `on update cascade`
  - `on delete restrict`

- `fk_match_opponent_players_local_opponent_player`
  - coluna: `local_opponent_player_id`
  - referência: `local_opponent_players.id`
  - `on update cascade`
  - `on delete restrict`

- `fk_match_opponent_players_photo_media_asset`
  - coluna: `photo_media_asset_id`
  - referência: `media_assets.id`
  - `on update cascade`
  - `on delete set null`

- `fk_match_opponent_players_removed_by_user`
  - coluna: `removed_by_user_id`
  - referência: `users.id`
  - `on update cascade`
  - `on delete set null`

## Check constraints sugeridas

- `ck_match_opponent_players_shirt_number_positive`
  - `shirt_number > 0`

- `ck_match_opponent_players_display_name_not_blank_when_present`
  - se `display_name_snapshot is not null`, então `btrim(display_name_snapshot) <> ''`

- `ck_match_opponent_players_removal_reason_not_blank_when_present`
  - se `removal_reason is not null`, então `btrim(removal_reason) <> ''`

## Unicidade

Deve existir no máximo um registro por:

- `match_id + shirt_number`

Nome sugerido:

- `uq_match_opponent_players_match_shirt_number`

Regra de implementação:

- a unicidade deve considerar apenas linhas ativas;
- condição: `removed_at is null`

## Índices sugeridos

- `idx_match_opponent_players_match_id`
  - colunas: `match_id`
  - finalidade:
    - listar o elenco adversário da partida.

- `idx_match_opponent_players_local_opponent_id`
  - colunas: `local_opponent_id`
  - finalidade:
    - histórico operacional por adversário local.

- `idx_match_opponent_players_local_opponent_player_id`
  - colunas: `local_opponent_player_id`
  - finalidade:
    - reaproveitar memória privada do mesmo jogador adversário.

- `idx_match_opponent_players_removed_at`
  - colunas: `removed_at`
  - finalidade:
    - separar rapidamente atores ativos de removidos logicamente.

## Regras de negócio centrais

1. A tabela representa o lado adversário daquela `match`.
2. O registro pode nascer:
   - vinculado a `local_opponent_player_id`;
   - ou apenas com `shirt_number` e snapshot mínimo.
3. Isso permite operação mesmo quando o adversário não foi preparado antes do jogo.
4. `is_starter = true` representa adversário que começou jogando.
5. `is_starter = false` representa banco ou reposição posterior.
6. O mínimo obrigatório é a camisa.
7. Se o ator adversário ainda não possuir fatos dependentes na partida, `REMOVE` pode apagar fisicamente a linha.
8. Se já existirem fatos dependentes, `REMOVE` deve virar remoção lógica via `removed_at`.

### O que conta como fato dependente para bloquear exclusão física

Bloqueiam exclusão física de `match_opponent_players` e exigem remoção lógica:

- `eventos da partida (match_events)` quando o `match_opponent_player_id` aparecer em:
  - `primary_match_opponent_player_id`
  - `secondary_match_opponent_player_id`
- `substituições da partida (match_substitutions)` quando o `match_opponent_player_id` aparecer em:
  - `opponent_player_in_match_opponent_player_id`
  - `opponent_player_out_match_opponent_player_id`

Regra operacional:

- se existir qualquer referência factual acima, o backend não pode apagar fisicamente a linha e deve usar `removed_at`, `removed_by_user_id` e `removal_reason`;
- listas operacionais padrão devem considerar apenas jogadores adversários com `removed_at is null`.

## Regras de consistência contextual

### Coerência com a partida

O backend deve validar que:

- `match_opponent_players.match_id` pertence à partida correta
- se `local_opponent_id` existir, ele é coerente com o adversário contextual da `match`

### Coerência com memória local

Se `local_opponent_player_id` existir:

- ele deve ser coerente com `local_opponent_id`
- `shirt_number` da partida pode coincidir com a memória local, mas o registro da partida continua sendo contextual e independente

Em outras palavras:

- a partida pode reaproveitar memória local;
- mas a memória local não substitui o snapshot factual da partida.

## Relações com outras tabelas

## Relação com `matches`

- tipo: `N -> 1`
- chave: `match_opponent_players.match_id -> matches.id`
- regra:
  - cada ator adversário pertence a uma partida específica.

## Relação com `local_opponents`

- tipo: `N -> 0..1`
- chave: `match_opponent_players.local_opponent_id -> local_opponents.id`
- regra:
  - só existe quando o confronto está ligado a um adversário privado/local conhecido.

## Relação com `local_opponent_players`

- tipo: `N -> 0..1`
- chave: `match_opponent_players.local_opponent_player_id -> local_opponent_players.id`
- regra:
  - reaproveita memória privada anterior, mas sem transformar esse ator em entidade global do app.

## Relação com `match_events`

- eventos do lado adversário podem apontar para `primary_match_opponent_player_id` e `secondary_match_opponent_player_id`.

## Relação com `match_substitutions`

- substituições do adversário usam `opponent_player_in_match_opponent_player_id` e `opponent_player_out_match_opponent_player_id`.

## Regras operacionais por fluxo

### Cadastro mínimo no jogo

Fluxo:

- operador informa somente a camisa;
- opcionalmente adiciona nome ou foto;
- o jogador adversário já pode ser usado em gol, evento ou substituição.

### Reaproveitamento de memória local

Fluxo:

- o time já conhecia aquele jogador adversário;
- a partida cria um snapshot contextual ligado a `local_opponent_player_id`;
- o operador continua livre para ajustar nome, camisa ou foto do contexto atual.

### Operação casual

Fluxo:

- o time quer apenas marcar gol adversário por número;
- `match_opponent_players` atende sem exigir cadastro rico.

### Gol adversário sem identificar autor

Fluxo:

- o time quer apenas registrar que sofreu um gol;
- ninguém cadastrou jogador adversário na partida;
- ou até cadastrou, mas não quer indicar o autor.

Regra:

- `match_opponent_players` não é obrigatório para o gol adversário existir;
- a existência de `match_opponent_players` também não obriga atribuição de autoria.

## O que não deve ficar em `match_opponent_players`

Não devem ficar aqui:

- pessoa global do produto;
- estatística consolidada permanente;
- vínculo oficial com time do app;
- memória completa do adversário fora do contexto da partida.

Esses dados pertencem, respectivamente, a:

- não existe no estado atual do produto para o lado adversário
- tabelas derivadas futuras
- eventual time oficial quando o adversário entrar no app
- `local_opponent_players`

## Dependências diretas desta tabela

Esta tabela conversa diretamente com:

- `matches`
- `local_opponents`
- `local_opponent_players`
- `match_events`
- `match_substitutions`
- `users`
- `Matches_API`

## Riscos de alteração futura

Mudanças em:

- exigência mínima além da camisa;
- relação entre snapshot da partida e memória local;
- eventual reivindicação futura de histórico do adversário;
- suporte a foto e nome contextual

impactam em cascata:

- operação casual;
- scout do lado adversário;
- memória privada de confronto;
- futura reivindicação de histórico de time adversário.

## Resumo estrutural

`match_opponent_players` é a memória operacional do adversário dentro do jogo. Ele permite que o time registre e reaproveite o mínimo necessário para entender quem fez o quê do outro lado, sem forçar uma identidade global que ainda não existe no produto.
