---
title: Table Spec user_team_roles
status: Draft
version: 2.0.0
owner: Product Architecture
last_update: 2026-07-10
related_documents:
  - ../../API/Identity_API.md
  - ../../API/Teams_API.md
  - ../../Domain/Teams.md
  - Table_Spec_team_members.md
  - Table_Spec_team_join_requests.md
  - Table_Spec_team_players.md
  - Table_Spec_users.md
---

# Table Spec user_team_roles

## Objetivo

Especificar `user_team_roles`: papéis contextuais de gestão ou participação interna de um usuário autenticado dentro de um time.

`user_team_roles` não é a camada canônica de pertencimento ao time. A camada canônica de pertencimento é `team_members`.

## Papel da tabela no modelo

`user_team_roles` existe para responder perguntas como:

- este usuário pode gerir o time?
- este usuário é presidente, diretor ou comissão neste time?
- este usuário deve receber notificações operacionais do time?

`user_team_roles` não responde sozinho perguntas como:

- esta pessoa pertence ao time?
- esta pessoa é atleta do elenco?
- esta pessoa jogou uma partida?

Essas respostas pertencem, respectivamente, a:

- `team_members`
- `team_players`
- tabelas de partida

## Campos

- `id` (uuid, PK)
- `user_id` (uuid, FK -> `users.id`, not null)
- `team_id` (uuid, FK -> `teams.id`, not null)
- `role` (enum `team_role`, not null)
- `granted_by_user_id` (uuid, FK -> `users.id`, nullable)
- `granted_reason` (text, nullable)
- `created_at` (timestamptz, not null, default `now()`)
- `updated_at` (timestamptz, not null, default `now()`)
- `revoked_at` (timestamptz, nullable)
- `revoked_by_user_id` (uuid, FK -> `users.id`, nullable)
- `revoked_reason` (text, nullable)

## Enums

### `team_role`

- `DIRECTOR`
- `PRESIDENT`
- `COMMITTEE`

## Significado dos papéis

- `PRESIDENT`: papel de gestão com mesmo peso operacional de `DIRECTOR`; a diferença é de nomenclatura de negócio.
- `DIRECTOR`: papel de gestão do time.
- `COMMITTEE`: integrante interno do time sem papel de gestão e sem identidade esportiva implícita de atleta.

## Regras centrais

- Papel contextual não é a mesma coisa que identidade esportiva.
- "Ser jogador" não é `role`; é existir como atleta no contexto esportivo do time, via `team_players`.
- Um torcedor que apenas segue o time não recebe linha em `user_team_roles`.
- `DIRECTOR` e `PRESIDENT` concedem gestão do time.
- `COMMITTEE` não concede gestão.
- Apenas usuário autenticado pode ter linha em `user_team_roles`.

## Relações obrigatórias

### Relações físicas

- `user_id` referencia `users.id`.
- `team_id` referencia `teams.id`.
- `granted_by_user_id` referencia `users.id`.
- `revoked_by_user_id` referencia `users.id`.

### Relação semântica obrigatória com `team_members`

Para existir uma linha ativa em `user_team_roles`, deve existir também uma linha ativa correspondente em `team_members` para:

- o mesmo `team_id`
- a `person` vinculada a `users.person_id`

Em outras palavras:

- `user_team_roles` depende de pertencimento ativo em `team_members`
- `user_team_roles` nunca substitui `team_members`

Essa integridade é parcialmente semântica, porque o banco não consegue garanti-la apenas com uma FK simples entre `user_id` e `person_id`. O backend deve validar isso em toda criação, promoção, troca ou revogação de papel.

## Regras de coexistência

- `PRESIDENT` e `DIRECTOR` não devem coexistir para o mesmo `user_id` no mesmo `team_id`.
- `COMMITTEE` não deve coexistir com `DIRECTOR`.
- `COMMITTEE` não deve coexistir com `PRESIDENT`.
- `COMMITTEE` não deve coexistir com vínculo esportivo de jogador no mesmo time.
- `DIRECTOR` pode coexistir com vínculo esportivo de jogador no mesmo time.
- `PRESIDENT` pode coexistir com vínculo esportivo de jogador no mesmo time.

## Regras de hierarquia prática

No momento da aprovação de entrada no time:

- se a escolha for `PLAYER`, não criar linha em `user_team_roles`
- se a escolha for `COMMITTEE`, criar apenas `COMMITTEE`
- se a escolha for `DIRECTOR`, criar apenas `DIRECTOR`
- se a escolha for `PRESIDENT`, criar apenas `PRESIDENT`
- se a escolha for `PLAYER_DIRECTOR`, criar `DIRECTOR` e também o vínculo esportivo em `team_players`
- se a escolha for `PLAYER_PRESIDENT`, criar `PRESIDENT` e também o vínculo esportivo em `team_players`

## Histórico e estado ativo

Uma linha em `user_team_roles` é considerada ativa quando:

- `revoked_at is null`

Uma linha deixa de estar ativa quando:

- o papel é removido manualmente; ou
- o vínculo da pessoa com o time deixa de ser ativo e o backend revoga o papel; ou
- uma troca de hierarquia substitui o papel anterior por outro papel válido

## Regras de revogação

- `revoked_at` só pode ser preenchido uma vez.
- `revoked_by_user_id` pode ser nulo apenas quando a revogação for sistêmica.
- `revoked_reason` é opcional, mas recomendada em remoções administrativas.
- linha revogada não deve voltar a ficar ativa; se o papel voltar no futuro, deve ser criada nova linha.

## Índices e unicidade sugeridos

### PK

- `pk_user_team_roles (id)`

### Índices de leitura

- `idx_user_team_roles_user_id` em (`user_id`)
- `idx_user_team_roles_team_id` em (`team_id`)
- `idx_user_team_roles_role` em (`role`)
- `idx_user_team_roles_active_team` em (`team_id`) where `revoked_at is null`
- `idx_user_team_roles_active_user` em (`user_id`) where `revoked_at is null`

### Unicidade parcial

Garantir no máximo um papel ativo por tipo para o mesmo usuário no mesmo time:

- `uq_user_team_roles_active_user_team_role`
- colunas: (`user_id`, `team_id`, `role`)
- condição: `revoked_at is null`

Garantir que `DIRECTOR` e `PRESIDENT` não coexistam ativos para o mesmo usuário no mesmo time:

- essa regra pode ser aplicada no serviço de domínio com validação transacional antes do `insert`
- se o banco precisar reforçar isso, pode usar constraint trigger

## Checks sugeridos

- `created_at <= updated_at`
- `revoked_at is null or revoked_at >= created_at`
- `revoked_by_user_id is null` quando `revoked_at is null`
- `trim(granted_reason) <> ''` quando `granted_reason` for informado
- `trim(revoked_reason) <> ''` quando `revoked_reason` for informado

## Fluxos que criam ou alteram esta tabela

### Criação de time

Ao concluir a criação de time:

- criar `team_members` para a pessoa criadora
- criar `user_team_roles` com `role = DIRECTOR`
- não criar `PRESIDENT` automaticamente

### Aprovação de solicitação de entrada

Ao aprovar `team_join_requests`:

- garantir ou criar `team_members`
- conforme `approved_membership_mode`, criar `user_team_roles` e/ou `team_players`
- impedir combinações inválidas antes da persistência

### Alteração administrativa de função

Um gestor pode:

- promover `DIRECTOR` para `PRESIDENT`
- rebaixar `PRESIDENT` para `DIRECTOR`
- conceder ou remover `COMMITTEE`

Essas operações devem:

- validar a hierarquia
- respeitar a linha ativa em `team_members`
- revogar o papel anterior quando houver substituição
- criar nova linha para o novo papel quando necessário

## Leituras dependentes desta tabela

- `GET /api/v1/me/roles`
- cálculo de `manageable_team_ids`
- destinatários operacionais de notificações de solicitação para entrar no time
- permissões de gestão em telas e APIs do time

## Regras de audiência e notificação

No estado atual do produto:

- notificações operacionais de aprovação/negação de entrada devem mirar pessoas com papel ativo `DIRECTOR` ou `PRESIDENT`
- `COMMITTEE` não entra como destinatário operacional padrão

## Exemplos de persistência

### Exemplo 1: usuário entra como atleta

- existe `team_members` ativo
- existe `team_players` ativo
- não existe linha em `user_team_roles`

### Exemplo 2: usuário entra como comissão

- existe `team_members` ativo
- existe `user_team_roles.role = COMMITTEE`
- não existe `team_players`

### Exemplo 3: usuário entra como jogador e diretor

- existe `team_members` ativo
- existe `team_players` ativo
- existe `user_team_roles.role = DIRECTOR`

### Exemplo 4: criador do time

- existe `team_members` ativo
- existe `user_team_roles.role = DIRECTOR`
- pode ou não existir `team_players`, dependendo de ele também ser atleta do elenco
