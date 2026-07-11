---
title: Table Spec match_players_positions
status: Draft
version: 2.2.0
owner: Product Architecture
last_update: 2026-07-10
related_documents:
  - Table_Spec_match_players.md
  - Table_Spec_matches.md
  - Table_Spec_modality_positions.md
  - Table_Spec_player_positions.md
  - ../../Domain/Matches.md
  - ../../Domain/Players.md
  - ../../API/Players_API.md
---

# Table Spec match_players_positions

## Objetivo

Documentar `posições usadas pelo atleta na partida (match_players_positions)` em nível técnico.

## Finalidade

`match_players_positions` representa em quais posições um atleta foi escalado ou utilizado naquele contexto factual de partida.

Ela existe para sustentar:

- posição real do atleta no jogo;
- histórico factual de utilização por modalidade;
- múltiplas posições por atleta no mesmo quadro, quando aplicável;
- leitura estatística e inferência futura de perfil tático.

## O que `match_players_positions` é

- registro factual da posição usada na partida;
- extensão contextual de `match_players`;
- fonte histórica do que o atleta realmente jogou.

## O que `match_players_positions` não é

- não é posição declarada do atleta no perfil;
- não é catálogo de posições;
- não é posição fixa do elenco;
- não é evento de scout.

## Responsabilidade na cadeia do domínio

No fluxo correto:

1. o atleta é relacionado em `match_players`;
2. a gestão informa em quais posições ele vai atuar ou atuou naquele quadro;
3. nasce uma ou mais linhas em `match_players_positions`;
4. esse histórico passa a alimentar leitura real de carreira dentro do app.

Logo:

- posição declarada pelo atleta pertence a `player_positions`;
- catálogo canônico de posições pertence a `modality_positions`;
- posição realmente exercida na partida pertence a `match_players_positions`.

## Quando nasce

`match_players_positions` nasce quando:

1. a escalação do quadro define posições iniciais;
2. a revisão posterior ajusta ou acrescenta posição realmente usada;
3. a partida registra múltiplas posições relevantes para o mesmo atleta naquele quadro.

## Quem grava

`match_players_positions` é gravada pela aplicação.

Casos de uso relevantes:

- `SaveLineupPositions`
- `AdjustMatchPlayerPositionsAfterReview`
- `EnrichPlayerUsageHistory`

## Estrutura física sugerida

- schema: `public`
- nome da tabela: `match_players_positions`

## Colunas

### `id`

- tipo físico: `uuid`
- nulidade: `not null`
- default sugerido: `gen_random_uuid()`
- PK: sim

### `match_player_id`

- tipo físico: `uuid`
- nulidade: `not null`
- FK: `match_players.id`
- `on update`: `cascade`
- `on delete`: `restrict`
- finalidade:
  - apontar qual linha factual de atleta na partida recebe aquela posição.

### `modality_position_id`

- tipo físico: `uuid`
- nulidade: `not null`
- FK: `modality_positions.id`
- `on update`: `cascade`
- `on delete`: `restrict`
- finalidade:
  - apontar qual posição canônica foi usada naquele contexto.

### `created_at`

- tipo físico: `timestamptz`
- nulidade: `not null`
- default sugerido: `now()`

## Constraints sugeridas

## Primary key

- `pk_match_players_positions`
  - colunas: `id`

## Foreign keys

- `fk_match_players_positions_match_player`
  - coluna: `match_player_id`
  - referência: `match_players.id`
  - `on update cascade`
  - `on delete restrict`

- `fk_match_players_positions_modality_position`
  - coluna: `modality_position_id`
  - referência: `modality_positions.id`
  - `on update cascade`
  - `on delete restrict`

## Unicidade

Deve existir no máximo uma linha por:

- `match_player_id + modality_position_id`

Nome sugerido:

- `uq_match_players_positions_match_player_modality_position`

## Índices sugeridos

- `idx_match_players_positions_match_player_id`
  - colunas: `match_player_id`
  - finalidade:
    - listar posições do atleta naquela partida.

- `idx_match_players_positions_modality_position_id`
  - colunas: `modality_position_id`
  - finalidade:
    - relatórios e filtros por posição real usada.

## Regras de negócio centrais

1. Cada linha representa uma posição válida para aquele atleta naquele quadro específico da partida.
2. Como `match_player_id` já identifica o quadro, a posição fica naturalmente separada por quadro.
3. Um mesmo `match_player` pode ter múltiplas posições.
4. A posição deve ser canônica e vir do catálogo `modality_positions`.
5. Esta tabela representa posição exercida ou prevista na partida, não posição declarada do atleta.
6. A posição inicial não precisa ser obrigatória para salvar a escalação, exceto para o goleiro titular.
7. Deve existir exatamente um goleiro titular definido no salvamento da escalação.

## Regras de consistência contextual

### Coerência entre modalidade da partida e posição

O backend deve validar coerência entre:

- modalidade da partida em `matches.modality`
- modalidade da posição escolhida em `modality_positions`

Em outras palavras:

- não pode existir posição de campo em uma partida de futsal, por exemplo.

### Coerência com `match_players`

Antes de existir `match_players_positions`, deve existir `match_players`.

Logo:

- posição factual nunca nasce sozinha;
- ela sempre depende de uma linha factual de atleta relacionado.

## Relações com outras tabelas

## Relação com `match_players`

- tipo: `N -> 1`
- chave: `match_players_positions.match_player_id -> match_players.id`
- regra:
  - a posição real pertence ao contexto factual do atleta na partida.

## Relação com `modality_positions`

- tipo: `N -> 1`
- chave: `match_players_positions.modality_position_id -> modality_positions.id`
- regra:
  - a posição sempre vem do catálogo canônico por modalidade.

## Relação com `player_positions`

- não há dependência direta;
- `player_positions` descreve o que o atleta declara jogar;
- `match_players_positions` descreve o que ele realmente jogou.

## Regras operacionais por fluxo

### Escalação inicial

Fluxo:

- atleta é relacionado em `match_players`;
- gestão marca uma ou mais posições para aquele quadro;
- essas posições viram linhas em `match_players_positions`.

Regras:

- titulares de linha podem ser salvos sem posição inicial definida;
- o goleiro titular deve ter posição inicial definida antes do salvamento da escalação;
- reservas podem nascer sem posição inicial.

### Revisão posterior

Fluxo:

- a posição inicialmente marcada pode ser ajustada;
- o histórico deve refletir o que foi efetivamente usado, não apenas a intenção inicial.

### Múltiplas posições no mesmo quadro

Fluxo:

- se o atleta atuar em mais de uma posição relevante no mesmo quadro, pode receber múltiplas linhas;
- isso é compatível com a ideia de histórico real de utilização.

## O que não deve ficar em `match_players_positions`

Não devem ficar aqui:

- posição declarada no perfil;
- função de gestão;
- evento tático fino;
- tempo do lance;
- estatística consolidada.

Esses dados pertencem, respectivamente, a:

- `player_positions`
- `user_team_roles`
- `match_events`
- `match_events.clock_second`
- tabelas derivadas e projeções

## Dependências diretas desta tabela

Esta tabela conversa diretamente com:

- `match_players`
- `matches`
- `modality_positions`
- `player_positions`
- `Players_API`
- perfil do atleta
- estatísticas e inferências futuras

## Riscos de alteração futura

Mudanças em:

- multiplicidade de posições por atleta na mesma partida;
- semântica entre posição prevista e posição efetivamente jogada;
- coerência entre modalidade e catálogo de posições

impactam em cascata:

- perfil do atleta;
- histórico posicional;
- inferência de estilo de jogo;
- relatórios por posição;
- leitura pública da carreira do atleta.

## Resumo estrutural

`match_players_positions` é o registro da posição real do atleta no jogo. É essa tabela que protege o sistema de confundir “o que o atleta diz que joga” com “o que o app viu ele jogar”.
