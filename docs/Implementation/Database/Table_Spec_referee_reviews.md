---
title: Table Spec referee_reviews
status: Draft
version: 2.0.0
owner: Product Architecture
last_update: 2026-07-10
related_documents:
  - Table_Spec_match_referees.md
  - Table_Spec_referees.md
  - Table_Spec_matches.md
  - Table_Spec_users.md
  - ../../Domain/Referees.md
  - ../../API/Referees_API.md
  - ../../Implementation/API/Endpoint_Detail_Referees.md
---

# Table Spec referee_reviews

## Objetivo

Documentar `avaliações da arbitragem (referee_reviews)` em nível técnico.

## Finalidade

`referee_reviews` representa a avaliação de uma atuação de arbitragem em uma partida específica.

Ela existe para sustentar:

- resenha sobre arbitragem;
- competência consolidada por árbitro formal;
- leitura separada entre nota social e nota que pesa na competência;
- histórico de avaliações por partida.

## O que `referee_reviews` é

- avaliação contextual de arbitragem por partida;
- opinião persistida de um avaliador autenticado;
- base para reputação derivada.

## O que `referee_reviews` não é

- não é a identidade do árbitro;
- não é a arbitragem da partida em si;
- não é reputação final consolidada;
- não é papel fixo do usuário no produto.

## Responsabilidade na cadeia do domínio

No fluxo correto:

1. a partida identifica sua arbitragem em `match_referees`;
2. usuários autorizados avaliam aquela atuação;
3. cada avaliação nasce em `referee_reviews`;
4. camadas analíticas derivam reputação e competência.

Logo:

- identidade formal do árbitro pertence a `referees`;
- atuação concreta do jogo pertence a `match_referees`;
- avaliação daquela atuação pertence a `referee_reviews`.

## Quando nasce

`referee_reviews` pode nascer quando:

1. após a partida, um usuário decide avaliar a arbitragem;
2. o time quer registrar resenha mesmo quando a arbitragem não era formal;
3. usuários com papéis diferentes geram leituras distintas sobre a mesma arbitragem.

## Quem grava

`referee_reviews` é gravada pela aplicação.

Casos de uso relevantes:

- `CreateRefereeReview`
- `UpdateRefereeReview`
- `ComputeRefereeCompetenceScore`

## Estrutura física sugerida

- schema: `public`
- nome da tabela: `referee_reviews`

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
  - apontar a qual partida a avaliação pertence.

### `match_referee_id`

- tipo físico: `uuid`
- nulidade: `not null`
- FK: `match_referees.id`
- `on update`: `cascade`
- `on delete`: `restrict`
- finalidade:
  - apontar qual atuação de arbitragem está sendo avaliada.

### `referee_id`

- tipo físico: `uuid`
- nulidade: `nullable`
- FK: `referees.id`
- `on update`: `cascade`
- `on delete`: `restrict`
- finalidade:
  - apontar para o árbitro formal quando existir, permitindo reputação consolidada.

### `rater_user_id`

- tipo físico: `uuid`
- nulidade: `not null`
- FK: `users.id`
- `on update`: `cascade`
- `on delete`: `restrict`
- finalidade:
  - identificar quem enviou a avaliação.

### `rater_role`

- tipo físico: `referee_rater_role`
- nulidade: `not null`
- finalidade:
  - registrar com qual papel contextual o usuário avaliou aquela arbitragem.

### `score`

- tipo físico: `numeric(4,2)`
- nulidade: `not null`
- finalidade:
  - nota atribuída à arbitragem naquela partida.

### `counts_for_competence`

- tipo físico: `boolean`
- nulidade: `not null`
- finalidade:
  - marcar se aquela nota deve influenciar a competência consolidada do árbitro.

### `description`

- tipo físico: `text`
- nulidade: `nullable`
- finalidade:
  - justificativa opcional da avaliação.

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

### `referee_rater_role`

- `DIRECTOR`
- `PRESIDENT`
- `COACH`
- `PLAYER`
- `FAN`

## Regras dos enums

### `DIRECTOR`

- nota de gestão;
- conta para competência.

### `PRESIDENT`

- nota de gestão com o mesmo peso operacional de `DIRECTOR`;
- conta para competência.

### `COACH`

- nota técnica contextual do jogo;
- conta para competência.

### `PLAYER`

- nota de quem estava jogando;
- entra como resenha e percepção, não como competência oficial.

### `FAN`

- nota social ou de torcida;
- entra como resenha, não como competência oficial.

## Constraints sugeridas

## Primary key

- `pk_referee_reviews`
  - colunas: `id`

## Foreign keys

- `fk_referee_reviews_match`
  - coluna: `match_id`
  - referência: `matches.id`
  - `on update cascade`
  - `on delete restrict`

- `fk_referee_reviews_match_referee`
  - coluna: `match_referee_id`
  - referência: `match_referees.id`
  - `on update cascade`
  - `on delete restrict`

- `fk_referee_reviews_referee`
  - coluna: `referee_id`
  - referência: `referees.id`
  - `on update cascade`
  - `on delete restrict`

- `fk_referee_reviews_rater_user`
  - coluna: `rater_user_id`
  - referência: `users.id`
  - `on update cascade`
  - `on delete restrict`

## Check constraints sugeridas

- `ck_referee_reviews_score_range`
  - `score >= 0 and score <= 10`

- `ck_referee_reviews_description_not_blank_when_present`
  - se `description is not null`, então `btrim(description) <> ''`

## Unicidade

Uma avaliação por avaliador, por atuação de arbitragem:

- `match_referee_id + rater_user_id`

Nome sugerido:

- `uq_referee_reviews_match_referee_rater`

## Índices sugeridos

- `idx_referee_reviews_match_id`
  - colunas: `match_id`
  - finalidade:
    - listar avaliações da partida.

- `idx_referee_reviews_match_referee_id`
  - colunas: `match_referee_id`
  - finalidade:
    - listar avaliações da atuação de arbitragem.

- `idx_referee_reviews_referee_id`
  - colunas: `referee_id`
  - finalidade:
    - consolidar reputação do árbitro formal.

- `idx_referee_reviews_rater_role`
  - colunas: `rater_role`
  - finalidade:
    - separar leitura social de leitura de competência.

- `idx_referee_reviews_counts_for_competence`
  - colunas: `counts_for_competence`
  - finalidade:
    - agregações analíticas mais rápidas.

## Regras de negócio centrais

1. A avaliação pertence à atuação de arbitragem de uma partida.
2. A avaliação é sempre feita por `user`.
3. `counts_for_competence` é derivado do `rater_role`.
4. Notas de `PLAYER` e `FAN` entram só como resenha.
5. Notas de `DIRECTOR`, `PRESIDENT` e `COACH` contam para competência.
6. `PRESIDENT` tem o mesmo peso operacional de `DIRECTOR`.
7. Só árbitro formal com `referee_id` pode consolidar competência oficial de longo prazo.

## Regras de consistência contextual

### Coerência entre `match_referee_id`, `match_id` e `referee_id`

O backend deve validar que:

- `referee_reviews.match_referee_id` pertence ao mesmo `match_id`;
- se `match_referees.referee_id` existir, `referee_reviews.referee_id` deve ser igual a ele;
- se `match_referees.referee_id` não existir, `referee_reviews.referee_id` deve permanecer `null`.

### Coerência com o avaliador

`rater_user_id` deve representar um usuário autenticado real.

O papel contextual usado na avaliação:

- não deve ser inferido apenas do cadastro do usuário;
- deve refletir o contexto daquela partida e daquela avaliação.

### Coerência com quadros

Como `matches` já representa um quadro específico:

- avaliações separadas por primeiro e segundo quadro acontecem naturalmente por `match_id`;
- não é necessário campo extra de quadro aqui.

## Relações com outras tabelas

## Relação com `matches`

- tipo: `N -> 1`
- chave: `referee_reviews.match_id -> matches.id`
- regra:
  - cada avaliação pertence a uma partida específica.

## Relação com `match_referees`

- tipo: `N -> 1`
- chave: `referee_reviews.match_referee_id -> match_referees.id`
- regra:
  - a avaliação sempre mira uma atuação concreta de arbitragem.

## Relação com `referees`

- tipo: `N -> 0..1`
- chave: `referee_reviews.referee_id -> referees.id`
- regra:
  - existe quando a arbitragem estava ligada a um árbitro formal.

## Relação com `users`

- tipo: `N -> 1`
- chave: `referee_reviews.rater_user_id -> users.id`
- regra:
  - toda avaliação nasce de um usuário autenticado.

## Regras operacionais por fluxo

### Avaliação com árbitro formal

Fluxo:

- a partida aponta para `referee_id`;
- usuários avaliam;
- notas de gestão e técnico alimentam competência consolidada;
- notas de jogador e torcida ficam como camada social.

### Avaliação com árbitro ad-hoc

Fluxo:

- a partida usou `referee_person_id`;
- ainda é possível registrar avaliação;
- isso gera histórico e resenha, mas não reputação oficial consolidada de `referees`.

### Arbitragem externa não identificada

Fluxo:

- a partida marcou `external = true`;
- avaliações podem existir como percepção daquela atuação;
- sem consolidar competência de um árbitro formal específico.

## O que não deve ficar em `referee_reviews`

Não devem ficar aqui:

- identidade da arbitragem;
- dados cadastrais do árbitro;
- reputação final consolidada;
- texto operacional da partida.

Esses dados pertencem, respectivamente, a:

- `match_referees`
- `referees`
- camadas analíticas derivadas
- `matches` e documentos correlatos

## Dependências diretas desta tabela

Esta tabela conversa diretamente com:

- `matches`
- `match_referees`
- `referees`
- `users`
- `Referees_API`
- `Endpoint_Detail_Referees`

## Riscos de alteração futura

Mudanças em:

- enum `referee_rater_role`;
- regra de quem conta para competência;
- escala de `score`;
- política para arbitragem ad-hoc e externa

impactam em cascata:

- UX de avaliação;
- reputação consolidada;
- leitura social da arbitragem;
- relatórios por juiz;
- fairness analítica do produto.

## Resumo estrutural

`referee_reviews` é a camada em que a atuação da arbitragem recebe opinião registrada. Ela separa claramente o que é resenha social do que pesa na competência de um árbitro formal, preservando o contexto real de cada partida.
