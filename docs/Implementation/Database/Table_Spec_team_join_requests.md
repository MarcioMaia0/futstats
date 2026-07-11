---
title: Table Spec team_join_requests
status: Draft
version: 2.0.0
owner: Product Architecture
last_update: 2026-07-10
related_documents:
  - ../../Frontend/Screens/Join_Team_Search.md
  - ../../Frontend/Screens/Start_Path_Selection.md
  - ../../Domain/Teams.md
  - ../../API/Teams_API.md
  - Table_Spec_users.md
  - Table_Spec_team_members.md
  - Table_Spec_team_players.md
  - Table_Spec_user_team_roles.md
---

# Table Spec team_join_requests

## Objetivo

Documentar `solicitações de entrada em time (team_join_requests)` em nível técnico.

## Finalidade

`team_join_requests` representa a solicitação explícita feita pela própria pessoa para entrar em um time.

Esta tabela existe para separar claramente:

- intenção de entrar;
- análise/decisão da gestão;
- criação posterior dos vínculos reais.

## O que `team_join_requests` é

- pedido explícito de entrada no time;
- estado transacional anterior ao vínculo final;
- fonte de verdade da pendência de aprovação.

## O que `team_join_requests` não é

- não é pertencimento ao time;
- não é vínculo esportivo oficial;
- não é papel de gestão;
- não é follow;
- não é presença em jogo.

## Responsabilidade na cadeia do domínio

No fluxo correto:

1. a pessoa busca o time;
2. confirma a intenção;
3. nasce `team_join_requests`;
4. a gestão aprova ou rejeita;
5. só então podem nascer:
   - `team_members`
   - `team_players`
   - `user_team_roles`

## Quando nasce

`team_join_requests` nasce quando a própria pessoa autenticada decide pedir entrada em um time.

## Quem grava

`team_join_requests` é gravada pela aplicação.

Casos de uso relevantes:

- `CreateJoinRequest`
- `ApproveJoinRequest`
- `RejectJoinRequest`
- `CancelJoinRequest`

## Estrutura física sugerida

- schema: `public`
- nome da tabela: `team_join_requests`

## Colunas

### `id`

- tipo físico: `uuid`
- nulidade: `not null`
- default sugerido: `gen_random_uuid()`
- PK: sim

### `requester_user_id`

- tipo físico: `uuid`
- nulidade: `not null`
- FK: `users.id`
- `on update`: `cascade`
- `on delete`: `restrict`
- finalidade:
  - registrar qual usuário autenticado fez a solicitação.

### `team_id`

- tipo físico: `uuid`
- nulidade: `not null`
- FK: `teams.id`
- `on update`: `cascade`
- `on delete`: `restrict`
- finalidade:
  - registrar para qual time a solicitação foi feita.

### `status`

- tipo físico: `team_join_request_status`
- nulidade: `not null`
- default sugerido: `PENDING`
- finalidade:
  - resumir o estado de vida da solicitação.

### `approved_membership_mode`

- tipo físico: `approved_membership_mode`
- nulidade: `nullable`
- default: sem default
- finalidade:
  - registrar como a entrada foi resolvida quando a solicitação for aprovada.

### `requested_at`

- tipo físico: `timestamptz`
- nulidade: `not null`
- default sugerido: `now()`
- finalidade:
  - registrar o instante da solicitação.

### `responded_at`

- tipo físico: `timestamptz`
- nulidade: `nullable`
- default: sem default
- finalidade:
  - registrar o instante da decisão final da gestão.

### `responded_by_user_id`

- tipo físico: `uuid`
- nulidade: `nullable`
- FK: `users.id`
- `on update`: `cascade`
- `on delete`: `set null`
- finalidade:
  - registrar quem aprovou ou rejeitou a solicitação.

### `rejection_reason`

- tipo físico: `text`
- nulidade: `nullable`
- default: sem default
- finalidade:
  - guardar justificativa opcional para rejeição.

### `cancelled_at`

- tipo físico: `timestamptz`
- nulidade: `nullable`
- default: sem default
- finalidade:
  - registrar o instante de cancelamento pela própria pessoa, quando houver.

### `source_context`

- tipo físico: `join_request_source`
- nulidade: `nullable`
- default: sem default
- finalidade:
  - indicar de onde veio a intenção inicial.

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

### `team_join_request_status`

- `PENDING`
- `APPROVED`
- `REJECTED`
- `CANCELLED`

### `join_request_source`

- `START_PATH_SELECTION`
- `TEAM_DISCOVERY`
- `TEAM_PROFILE`
- `OTHER`

### `approved_membership_mode`

- `PLAYER`
- `COMMITTEE`
- `DIRECTOR`
- `PRESIDENT`
- `PLAYER_DIRECTOR`
- `PLAYER_PRESIDENT`

## Regras dos enums

### `team_join_request_status`

- `PENDING`
  - aguardando decisão da gestão.

- `APPROVED`
  - decisão positiva já consumida e resolvida.

- `REJECTED`
  - decisão negativa já consumida.

- `CANCELLED`
  - cancelamento pela própria pessoa antes da aprovação.

### `approved_membership_mode`

Representa o modo final de resolução da entrada no time.

Ele não é o vínculo em si.

Ele orienta quais vínculos derivados precisam nascer:

- `PLAYER`
  - cria ou reaproveita `team_member`
  - cria ou reaproveita `team_player`
  - não cria `user_team_roles`

- `COMMITTEE`
  - cria ou reaproveita `team_member`
  - cria `user_team_roles.role = COMMITTEE`

- `DIRECTOR`
  - cria ou reaproveita `team_member`
  - cria `user_team_roles.role = DIRECTOR`

- `PRESIDENT`
  - cria ou reaproveita `team_member`
  - cria `user_team_roles.role = PRESIDENT`

- `PLAYER_DIRECTOR`
  - cria ou reaproveita `team_member`
  - cria ou reaproveita `team_player`
  - cria `user_team_roles.role = DIRECTOR`

- `PLAYER_PRESIDENT`
  - cria ou reaproveita `team_member`
  - cria ou reaproveita `team_player`
  - cria `user_team_roles.role = PRESIDENT`

## Constraints sugeridas

## Primary key

- `pk_team_join_requests`
  - colunas: `id`

## Foreign keys

- `fk_team_join_requests_requester_user`
  - coluna: `requester_user_id`
  - referência: `users.id`
  - `on update cascade`
  - `on delete restrict`

- `fk_team_join_requests_team`
  - coluna: `team_id`
  - referência: `teams.id`
  - `on update cascade`
  - `on delete restrict`

- `fk_team_join_requests_responded_by_user`
  - coluna: `responded_by_user_id`
  - referência: `users.id`
  - `on update cascade`
  - `on delete set null`

## Check constraints sugeridas

- `ck_team_join_requests_rejection_reason_not_blank_when_present`
  - se `rejection_reason is not null`, então `btrim(rejection_reason) <> ''`

- `ck_team_join_requests_response_consistency`
  - se `status in ('APPROVED', 'REJECTED')`, então `responded_at is not null`

- `ck_team_join_requests_approved_mode_consistency`
  - se `status = 'APPROVED'`, então `approved_membership_mode is not null`

- `ck_team_join_requests_approved_mode_absent_when_not_approved`
  - se `status <> 'APPROVED'`, então `approved_membership_mode is null`

- `ck_team_join_requests_cancelled_at_consistency`
  - se `status = 'CANCELLED'`, então `cancelled_at is not null`

## Unicidade

Histórico de solicitações antigas deve ser permitido.

Por isso:

- não deve existir `unique(requester_user_id, team_id)` simples.

Regra correta:

- deve existir no máximo uma solicitação `PENDING` por `requester_user_id + team_id`.

Implementação sugerida:

- índice único parcial para linhas em que `status = 'PENDING'`

Nome sugerido:

- `uq_team_join_requests_pending_requester_team`

## Índices sugeridos

- `idx_team_join_requests_requester_user_id`
  - colunas: `requester_user_id`
  - finalidade:
    - listar solicitações da própria pessoa.

- `idx_team_join_requests_team_id`
  - colunas: `team_id`
  - finalidade:
    - listar solicitações pendentes para gestão do time.

- `idx_team_join_requests_status`
  - colunas: `status`
  - finalidade:
    - filtros operacionais.

- `idx_team_join_requests_requested_at`
  - colunas: `requested_at`
  - finalidade:
    - ordenação de fila.

## Regras de negócio centrais

1. A solicitação representa intenção, não vínculo final.
2. A criação sempre é feita para a própria pessoa autenticada.
3. Se a pessoa já faz parte do time, a solicitação deve ser bloqueada.
4. Se já existir solicitação `PENDING`, a nova criação deve ser bloqueada.
5. Solicitações antigas `REJECTED` ou `CANCELLED` não impedem nova tentativa por padrão.
6. A transição para `APPROVED` ou `REJECTED` deve acontecer uma única vez.
7. Depois da decisão final, a solicitação não pode voltar para `PENDING`.

## Regras de concorrência

- a primeira decisão válida de gestão consome a pendência;
- não pode existir dupla decisão sobre a mesma linha;
- se outra pessoa da gestão tentar agir depois da resolução:
  - a API deve devolver o estado final já resolvido;
  - a UI deve entrar em modo somente leitura para essa solicitação.

## Relações com outras tabelas

## Relação com `users`

- `requester_user_id -> users.id`
- `responded_by_user_id -> users.id`

Regras:

- a origem da solicitação exige conta autenticada;
- a resposta humana, quando existir, também vem de uma conta autenticada.

## Relação com `team_members`

- não é FK direta na tabela;
- mas aprovação normalmente cria ou reaproveita `team_members`.

## Relação com `team_players`

- não é FK direta na tabela;
- mas aprovação com modo esportivo cria ou reaproveita `team_players`.

## Relação com `user_team_roles`

- não é FK direta na tabela;
- mas aprovação com `COMMITTEE`, `DIRECTOR` ou `PRESIDENT` cria papel correspondente.

## Regras de hierarquia e persistência

- `COMMITTEE` não deve coexistir com `DIRECTOR`, `PRESIDENT` ou `PLAYER` como persistência redundante de papel.
- `DIRECTOR` e `PRESIDENT` não devem coexistir para a mesma pessoa no mesmo time no estado atual do produto.
- `PLAYER` pode coexistir com `DIRECTOR`.
- `PLAYER` pode coexistir com `PRESIDENT`.
- `PLAYER` não deve coexistir com `COMMITTEE`.

Observação:

- essas regras não significam que a UI não possa apresentar combinações;
- significam que o backend deve persistir apenas a combinação canônica válida.

## Regras por transição

### Criação

Ao criar:

- grava `requester_user_id`
- grava `team_id`
- grava `status = PENDING`
- grava `requested_at`
- grava `source_context`, quando houver

### Aprovação

Ao aprovar:

- grava `status = APPROVED`
- grava `approved_membership_mode`
- grava `responded_at`
- grava `responded_by_user_id`
- cria ou reaproveita os vínculos derivados coerentes

### Rejeição

Ao rejeitar:

- grava `status = REJECTED`
- grava `responded_at`
- grava `responded_by_user_id`
- grava `rejection_reason`, quando houver

### Cancelamento

Ao cancelar:

- grava `status = CANCELLED`
- grava `cancelled_at`

## Regras de notificação

- criação da solicitação deve disparar notificação operacional para gestão do time;
- no estado atual do produto, o alvo mínimo é:
  - `DIRECTOR`
  - `PRESIDENT`
- `COMMITTEE` não recebe essa notificação operacional por padrão;
- quando a solicitação sair de `PENDING`, a pessoa solicitante deve ser notificada;
- rejeição não deve expor quem rejeitou;
- aprovação pode gerar mensagem específica conforme `approved_membership_mode`.

## O que não deve ficar em `team_join_requests`

Não devem ficar aqui:

- vínculo final de pertencimento;
- vínculo esportivo oficial;
- papel de gestão efetivamente criado;
- presença em jogos;
- follow.

Esses dados pertencem, respectivamente, a:

- `team_members`
- `team_players`
- `user_team_roles`
- `match_attendance_responses`
- `follows`

## Dependências diretas desta tabela

Esta tabela conversa diretamente com:

- `users`
- `teams`
- `team_members`
- `team_players`
- `user_team_roles`
- `Teams_API`
- `Join_Team_Search`
- notificações operacionais do time

## Riscos de alteração futura

Mudanças em:

- unicidade da pendência por pessoa e time;
- semântica de `approved_membership_mode`;
- regra de decisão única;
- vínculo entre aprovação e criação de `team_members` / `team_players`

impactam em cascata:

- busca e solicitação de entrada;
- fila de aprovação da gestão;
- integrações de notificação;
- consistência do pertencimento ao time;
- merge entre atleta operacional e atleta canônico.

## Resumo estrutural

`team_join_requests` é a fila oficial de entrada no time. Ela existe para registrar intenção, controlar decisão única e só depois liberar a criação dos vínculos reais do time.
