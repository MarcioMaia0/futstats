---
title: Table Spec match_referees
status: Draft
version: 2.0.0
owner: Product Architecture
last_update: 2026-07-10
related_documents:
  - Table_Spec_matches.md
  - Table_Spec_referees.md
  - Table_Spec_referee_reviews.md
  - Table_Spec_persons.md
  - ../../Domain/Matches.md
  - ../../API/Matches_API.md
  - ../../Implementation/API/Endpoint_Detail_Referees.md
---

# Table Spec match_referees

## Objetivo

Documentar `arbitragem da partida (match_referees)` em nível técnico.

## Finalidade

`match_referees` representa quem atuou como arbitragem naquela partida específica.

Ela existe para sustentar:

- histórico por juiz;
- leitura real da arbitragem usada em cada jogo;
- relatórios como quantidade de jogos com determinado árbitro;
- diferença clara entre árbitro cadastrado, árbitro ad-hoc e arbitragem externa não identificada;
- base para avaliações em `referee_reviews`.

## O que `match_referees` é

- arbitragem efetiva contextual da partida;
- fonte factual da identificação do juiz naquele jogo;
- elo entre partida e futuras análises de arbitragem.

## O que `match_referees` não é

- não é cadastro mestre de árbitro;
- não é avaliação do árbitro;
- não é técnico;
- não é operador da partida;
- não é só um campo de texto solto.

## Responsabilidade na cadeia do domínio

No fluxo correto:

1. a partida existe em `matches`;
2. o time identifica a arbitragem daquele jogo;
3. essa identificação é persistida em `match_referees`;
4. se houver avaliação, ela nasce depois em `referee_reviews`.

Logo:

- cadastro mestre do árbitro pertence a `referees`;
- arbitragem efetiva do jogo pertence a `match_referees`;
- resenha e nota sobre arbitragem pertencem a `referee_reviews`.

## Quando nasce

`match_referees` pode nascer quando:

1. o responsável informa o juiz no momento do jogo;
2. a informação é adicionada depois, em revisão;
3. o time quer apenas marcar que a arbitragem foi externa e não identificada;
4. um árbitro conhecido do app é reaproveitado no jogo.

## Quem grava

`match_referees` é gravada pela aplicação.

Casos de uso relevantes:

- `SetMatchReferee`
- `SetExternalUnknownReferee`
- `ReplaceMatchReferee`
- `ReviewMatchReferee`

## Estrutura física sugerida

- schema: `public`
- nome da tabela: `match_referees`

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
  - apontar a qual partida operacional a arbitragem pertence.

### `referee_id`

- tipo físico: `uuid`
- nulidade: `nullable`
- FK: `referees.id`
- `on update`: `cascade`
- `on delete`: `restrict`
- finalidade:
  - apontar para árbitro cadastrado formalmente no produto, quando existir.

### `referee_person_id`

- tipo físico: `uuid`
- nulidade: `nullable`
- FK: `persons.id`
- `on update`: `cascade`
- `on delete`: `restrict`
- finalidade:
  - apontar para pessoa canônica usada como árbitro ad-hoc, quando o caso não exigir ou não justificar cadastro em `referees`.

### `external`

- tipo físico: `boolean`
- nulidade: `not null`
- default sugerido: `false`
- finalidade:
  - marcar que a arbitragem foi externa ao controle do time e não foi identificada nominalmente.

### `created_by_user_id`

- tipo físico: `uuid`
- nulidade: `nullable`
- FK: `users.id`
- `on update`: `cascade`
- `on delete`: `set null`
- finalidade:
  - registrar quem informou ou ajustou a arbitragem.

### `notes`

- tipo físico: `text`
- nulidade: `nullable`
- finalidade:
  - observações administrativas rápidas sobre a arbitragem daquele jogo.

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

- `pk_match_referees`
  - colunas: `id`

## Foreign keys

- `fk_match_referees_match`
  - coluna: `match_id`
  - referência: `matches.id`
  - `on update cascade`
  - `on delete restrict`

- `fk_match_referees_referee`
  - coluna: `referee_id`
  - referência: `referees.id`
  - `on update cascade`
  - `on delete restrict`

- `fk_match_referees_referee_person`
  - coluna: `referee_person_id`
  - referência: `persons.id`
  - `on update cascade`
  - `on delete restrict`

- `fk_match_referees_created_by_user`
  - coluna: `created_by_user_id`
  - referência: `users.id`
  - `on update cascade`
  - `on delete set null`

## Check constraints sugeridas

- `ck_match_referees_notes_not_blank_when_present`
  - se `notes is not null`, então `btrim(notes) <> ''`

- `ck_match_referees_identification_mode`
  - exatamente um dos modos abaixo deve valer:
    - `referee_id is not null` e `referee_person_id is null` e `external = false`
    - `referee_id is null` e `referee_person_id is not null` e `external = false`
    - `referee_id is null` e `referee_person_id is null` e `external = true`

## Unicidade

No estado atual do produto, deve existir no máximo uma linha de arbitragem principal por:

- `match_id`

Nome sugerido:

- `uq_match_referees_match_id`

## Índices sugeridos

- `idx_match_referees_match_id`
  - colunas: `match_id`
  - finalidade:
    - carregar a arbitragem da partida.

- `idx_match_referees_referee_id`
  - colunas: `referee_id`
  - finalidade:
    - relatórios por árbitro cadastrado.

- `idx_match_referees_referee_person_id`
  - colunas: `referee_person_id`
  - finalidade:
    - relatórios por árbitro ad-hoc identificado por pessoa.

## Regras de negócio centrais

1. A partida pode ter:
   - árbitro cadastrado;
   - árbitro ad-hoc identificado por pessoa;
   - arbitragem externa não identificada.
2. `external = true` só faz sentido quando não há `referee_id` nem `referee_person_id`.
3. `referee_id` e `referee_person_id` não devem coexistir na mesma linha.
4. O que vale para histórico da partida é sempre `match_referees`.
5. Avaliações da arbitragem não pertencem a esta tabela.

## Regras de consistência contextual

### Coerência com a partida

O backend deve validar que:

- `match_referees.match_id` pertence à partida correta.

### Coerência entre cadastro mestre e pessoa ad-hoc

Se o árbitro já existe formalmente em `referees`:

- o ideal é usar `referee_id`.

Se o caso for eventual, casual ou rápido:

- pode usar `referee_person_id`.

Se nem isso for conhecido:

- usar `external = true`.

### Coerência com avaliações

Se a linha estiver em modo:

- `referee_id`

então pode sustentar competência consolidada em `referee_reviews`.

Se estiver em modo:

- `referee_person_id`
- ou `external = true`

então a leitura deve ser mais limitada, focada em resenha e histórico contextual, não em competência consolidada oficial.

## Relações com outras tabelas

## Relação com `matches`

- tipo: `N -> 1`
- chave: `match_referees.match_id -> matches.id`
- regra:
  - cada arbitragem pertence a uma partida específica.

## Relação com `referees`

- tipo: `N -> 0..1`
- chave: `match_referees.referee_id -> referees.id`
- regra:
  - usada quando o árbitro faz parte do cadastro mestre.

## Relação com `persons`

- tipo: `N -> 0..1`
- chave: `match_referees.referee_person_id -> persons.id`
- regra:
  - usada quando o árbitro é só uma pessoa identificada naquele contexto.

## Relação com `referee_reviews`

- relação indireta
- regra:
  - a avaliação consulta ou deriva a arbitragem usada naquela partida.

## Regras operacionais por fluxo

### Árbitro cadastrado

Fluxo:

- o responsável encontra um árbitro já cadastrado;
- a partida aponta para `referee_id`;
- relatórios por árbitro podem consolidar esse histórico.

### Árbitro ad-hoc

Fluxo:

- o responsável conhece a pessoa, mas ela não é um árbitro formal cadastrado;
- usa `referee_person_id`;
- isso preserva leitura contextual sem exigir cadastro mestre.

### Arbitragem externa não identificada

Fluxo:

- a arbitragem veio do adversário, campeonato ou contexto externo;
- ninguém foi identificado nominalmente;
- grava `external = true`.

## O que não deve ficar em `match_referees`

Não devem ficar aqui:

- nota do árbitro;
- justificativa longa de avaliação;
- competência consolidada;
- papel do avaliador.

Esses dados pertencem, respectivamente, a:

- `referee_reviews.score`
- `referee_reviews.description`
- camadas analíticas derivadas
- `referee_reviews.rater_role`

## Dependências diretas desta tabela

Esta tabela conversa diretamente com:

- `matches`
- `referees`
- `persons`
- `referee_reviews`
- `Matches_API`
- `Endpoint_Detail_Referees`

## Riscos de alteração futura

Mudanças em:

- política entre `referee_id` e `referee_person_id`;
- semântica de `external`;
- possibilidade de múltiplos árbitros por partida;
- escopo dos relatórios por arbitragem

impactam em cascata:

- preenchimento do jogo;
- relatórios por juiz;
- avaliações da arbitragem;
- leitura histórica da partida.

## Resumo estrutural

`match_referees` guarda quem apitou aquele jogo de fato. Ele aceita desde um árbitro formal do cadastro até uma arbitragem externa não identificada, mas sempre separando identidade da arbitragem da avaliação que o time fará depois sobre ela.
