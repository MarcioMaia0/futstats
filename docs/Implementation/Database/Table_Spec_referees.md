---
title: Table Spec referees
status: Draft
version: 2.0.0
owner: Product Architecture
last_update: 2026-07-10
related_documents:
  - Table_Spec_persons.md
  - Table_Spec_users.md
  - Table_Spec_match_referees.md
  - Table_Spec_referee_reviews.md
  - ../../Domain/Referees.md
  - ../../API/Referees_API.md
  - ../../Implementation/API/Endpoint_Detail_Referees.md
---

# Table Spec referees

## Objetivo

Documentar `árbitros cadastrados (referees)` em nível técnico.

## Finalidade

`referees` representa o cadastro mestre de arbitragem dentro do produto.

Ela existe para sustentar:

- histórico consolidado por árbitro;
- reputação derivada;
- avaliações acumuladas;
- reaproveitamento em partidas futuras;
- diferenciação entre árbitro formal e árbitro apenas contextual.

## O que `referees` é

- perfil formal de arbitragem;
- entidade mestre reaproveitável entre partidas;
- base para competência e histórico consolidado.

## O que `referees` não é

- não é a arbitragem contextual de uma partida;
- não é avaliação;
- não é apenas uma pessoa ad-hoc identificada uma única vez;
- não é papel de time;
- não é operador da partida.

## Responsabilidade na cadeia do domínio

No fluxo correto:

1. uma pessoa pode existir em `persons`;
2. se ela precisar ser tratada como árbitro formal no produto, nasce `referees`;
3. uma partida usa esse cadastro por meio de `match_referees.referee_id`;
4. avaliações posteriores usam esse vínculo para consolidar histórico e reputação.

Logo:

- pessoa canônica pertence a `persons`;
- presença autenticada, se existir, pertence a `users`;
- perfil formal de arbitragem pertence a `referees`;
- atuação concreta em um jogo pertence a `match_referees`.

## Quando nasce

`referees` pode nascer quando:

1. a operação decide cadastrar formalmente um árbitro recorrente;
2. uma pessoa já conhecida precisa virar árbitro formal no produto;
3. o sistema evolui um uso recorrente de arbitragem contextual para cadastro mestre.

## Quem grava

`referees` é gravada pela aplicação.

Casos de uso relevantes:

- `CreateReferee`
- `PromotePersonToReferee`
- `UpdateRefereeProfile`
- `AttachRefereeToMatch`

## Estrutura física sugerida

- schema: `public`
- nome da tabela: `referees`

## Colunas

### `id`

- tipo físico: `uuid`
- nulidade: `not null`
- default sugerido: `gen_random_uuid()`
- PK: sim

### `person_id`

- tipo físico: `uuid`
- nulidade: `not null`
- FK: `persons.id`
- unicidade: `unique`
- `on update`: `cascade`
- `on delete`: `restrict`
- finalidade:
  - apontar qual pessoa canônica está sendo tratada como árbitro formal.

### `phone`

- tipo físico: `text`
- nulidade: `nullable`
- finalidade:
  - telefone operacional de contato do árbitro.

### `referee_type`

- tipo físico: `referee_type`
- nulidade: `not null`
- finalidade:
  - classificar o tipo de arbitragem que aquele perfil representa.

### `linked_user_id`

- tipo físico: `uuid`
- nulidade: `nullable`
- FK: `users.id`
- unicidade: `unique` quando presente
- `on update`: `cascade`
- `on delete`: `set null`
- finalidade:
  - apontar para a presença autenticada da pessoa na plataforma, quando ela também usa o app.

### `created_by_user_id`

- tipo físico: `uuid`
- nulidade: `nullable`
- FK: `users.id`
- `on update`: `cascade`
- `on delete`: `set null`
- finalidade:
  - registrar quem cadastrou o árbitro no sistema.

### `notes`

- tipo físico: `text`
- nulidade: `nullable`
- finalidade:
  - observações administrativas internas.

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

### `referee_type`

- `OFFICIAL`
- `THIRD_PARTY`
- `HOUSE_REFEREE`

## Regras dos enums

### `OFFICIAL`

- árbitro formal, profissional ou reconhecido como principal.

### `THIRD_PARTY`

- árbitro de terceiro, campeonato, liga ou parceiro externo.

### `HOUSE_REFEREE`

- árbitro mais casual, caseiro ou interno de contexto local.

## Constraints sugeridas

## Primary key

- `pk_referees`
  - colunas: `id`

## Foreign keys

- `fk_referees_person`
  - coluna: `person_id`
  - referência: `persons.id`
  - `on update cascade`
  - `on delete restrict`

- `fk_referees_linked_user`
  - coluna: `linked_user_id`
  - referência: `users.id`
  - `on update cascade`
  - `on delete set null`

- `fk_referees_created_by_user`
  - coluna: `created_by_user_id`
  - referência: `users.id`
  - `on update cascade`
  - `on delete set null`

## Check constraints sugeridas

- `ck_referees_phone_not_blank_when_present`
  - se `phone is not null`, então `btrim(phone) <> ''`

- `ck_referees_notes_not_blank_when_present`
  - se `notes is not null`, então `btrim(notes) <> ''`

## Unicidade

- `uq_referees_person_id`
  - colunas: `person_id`

- `uq_referees_linked_user_id`
  - colunas: `linked_user_id`
  - somente quando `linked_user_id is not null`

## Índices sugeridos

- `idx_referees_referee_type`
  - colunas: `referee_type`
  - finalidade:
    - filtros por tipo de arbitragem.

- `idx_referees_person_id`
  - colunas: `person_id`
  - finalidade:
    - navegação rápida entre pessoa e perfil de arbitragem.

- `idx_referees_linked_user_id`
  - colunas: `linked_user_id`
  - finalidade:
    - localizar árbitro pela conta do app.

## Regras de negócio centrais

1. `referees` é opcional.
2. Nem toda pessoa que apita um jogo precisa virar `referee`.
3. O cadastro formal existe para recorrência, reputação e histórico consolidado.
4. O árbitro pode ou não ter `user`.
5. O árbitro formal sempre aponta para uma `person`.

## Regras de consistência contextual

### Coerência com `persons`

Todo `referee` deve apontar para uma `person`.

Logo:

- nome, apelido e avatar canônico continuam sendo responsabilidade principal de `persons`.

### Coerência com `users`

Se `linked_user_id` existir:

- ele deve apontar para um `users.person_id` compatível com `referees.person_id`.

Em outras palavras:

- o usuário vinculado deve representar a mesma pessoa canônica.

### Coerência com `match_referees`

`referees` não substitui `match_referees`.

Ele apenas fornece uma identidade mestre para quando a partida quiser apontar:

- “foi este árbitro formal”.

## Relações com outras tabelas

## Relação com `persons`

- tipo: `N -> 1`
- chave: `referees.person_id -> persons.id`
- regra:
  - o árbitro formal sempre nasce sobre uma pessoa canônica.

## Relação com `users`

- tipo: `N -> 0..1`
- chave: `referees.linked_user_id -> users.id`
- regra:
  - o árbitro pode usar o app, mas isso não é obrigatório.

## Relação com `match_referees`

- tipo: `1 -> N`
- chave dependente: `match_referees.referee_id`
- regra:
  - várias partidas podem apontar para o mesmo árbitro formal.

## Relação com `referee_reviews`

- tipo: `1 -> N`
- chave dependente: `referee_reviews.referee_id`
- regra:
  - avaliações consolidadas de competência só fazem sentido pleno quando há `referee_id`.

## Regras operacionais por fluxo

### Cadastro formal do árbitro

Fluxo:

- o time ou operação decide cadastrar um árbitro recorrente;
- cria ou reaproveita `person`;
- cria `referees`.

### Uso em partida

Fluxo:

- a partida identifica esse árbitro;
- `match_referees` aponta para `referee_id`.

### Evolução de árbitro contextual para formal

Fluxo:

- antes o juiz era só ad-hoc em partidas;
- depois a operação quer consolidar histórico;
- cria `referees` para a mesma pessoa e passa a reaproveitar esse cadastro dali em diante.

## O que não deve ficar em `referees`

Não devem ficar aqui:

- atuação específica em uma partida;
- nota de uma partida;
- texto de avaliação;
- arbitragem externa não identificada.

Esses dados pertencem, respectivamente, a:

- `match_referees`
- `referee_reviews`
- `referee_reviews`
- `match_referees.external`

## Dependências diretas desta tabela

Esta tabela conversa diretamente com:

- `persons`
- `users`
- `match_referees`
- `referee_reviews`
- `Referees_API`
- `Endpoint_Detail_Referees`

## Riscos de alteração futura

Mudanças em:

- enum `referee_type`;
- obrigatoriedade de `linked_user_id`;
- política de promoção de árbitro contextual para formal;
- vínculo entre `person` e `user`

impactam em cascata:

- cadastro de árbitros;
- partidas futuras;
- avaliações;
- reputação consolidada;
- relatórios por arbitragem.

## Resumo estrutural

`referees` é o cadastro mestre de arbitragem do produto. Ele só deve existir quando fizer sentido consolidar histórico e reputação; caso contrário, a partida pode continuar funcionando apenas com arbitragem contextual.
