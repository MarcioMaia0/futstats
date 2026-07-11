---
title: Table Spec team_join_requests
status: Draft
version: 1.2.0
owner: Product Architecture
last_update: 2026-07-09
related_documents:
  - ../../Frontend/Screens/Join_Team_Search.md
  - ../../Frontend/Screens/Start_Path_Selection.md
  - ../../Domain/Teams.md
---

# Table Spec team_join_requests

## Objetivo

Especificar `team_join_requests`: solicitações iniciadas pela pessoa para entrar em um time.

## Finalidade

Separar claramente o ato de solicitar entrada do vínculo final com o time.

Esta tabela existe para o fluxo `Entrar em um time` e não substitui:

- `user_team_roles` para papel contextual no time;
- `team_players` para elenco;
- `follows` para seguir um time.

## Campos sugeridos

- `id` (uuid, PK)
- `requester_user_id` (uuid, FK -> `users.id`)
- `team_id` (uuid, FK -> `teams.id`)
- `status` (enum `team_join_request_status`)
- `approved_membership_mode` (enum `approved_membership_mode`, nullable)
- `requested_at` (timestamptz)
- `responded_at` (timestamptz, nullable)
- `responded_by_user_id` (uuid, FK -> `users.id`, nullable)
- `rejection_reason` (text, nullable)
- `cancelled_at` (timestamptz, nullable)
- `source_context` (enum `join_request_source`, nullable)
- `created_at`
- `updated_at`

## Enums

- `team_join_request_status`: `PENDING | APPROVED | REJECTED | CANCELLED`
- `join_request_source`: `START_PATH_SELECTION | TEAM_DISCOVERY | TEAM_PROFILE | OTHER`
- `approved_membership_mode`: `PLAYER | COMMITTEE | DIRECTOR | PRESIDENT | PLAYER_DIRECTOR | PLAYER_PRESIDENT`

## Regras

- Uma solicitação representa intenção de entrar em um time, não vínculo final.
- A regra do fluxo exige bloquear nova linha `PENDING` para o mesmo par (`requester_user_id`, `team_id`).
- Se a pessoa já faz parte do time, uma nova solicitação deve ser bloqueada antes da criação.
- O endpoint canônico de criação é `POST /api/v1/teams/:team_id/join-requests`.
- A criação sempre é feita para a própria pessoa autenticada.
- `APPROVED` deve registrar também como a entrada foi resolvida em `approved_membership_mode`.
- `responded_by_user_id` registra quem aprovou ou rejeitou, quando houver resposta humana.
- `rejection_reason` é opcional.
- `CANCELLED` representa cancelamento pela pessoa antes da aprovação.
- Solicitações antigas `REJECTED` ou `CANCELLED` não impedem nova solicitação futura por padrão no MVP.
- A transição para `APPROVED` ou `REJECTED` deve acontecer uma única vez.
- Depois que `responded_at` e `status` final forem gravados, a solicitação não pode voltar para `PENDING`.
- Regras de concorrência devem impedir dupla decisão sobre a mesma linha.
- O estado final deve ser a única fonte de verdade para a UI quando mais de uma pessoa da gestão abrir a mesma solicitação.

## Regras de resolução na aprovação

- `PLAYER`
  - cria vínculo esportivo
  - não cria `user_team_roles`
- `COMMITTEE`
  - cria `user_team_roles.role = COMMITTEE`
- `DIRECTOR`
  - cria `user_team_roles.role = DIRECTOR`
- `PRESIDENT`
  - cria `user_team_roles.role = PRESIDENT`
- `PLAYER_DIRECTOR`
  - cria vínculo esportivo
  - cria `user_team_roles.role = DIRECTOR`
- `PLAYER_PRESIDENT`
  - cria vínculo esportivo
  - cria `user_team_roles.role = PRESIDENT`

## Regras de hierarquia

- `COMMITTEE` não deve coexistir com `DIRECTOR`, `PRESIDENT` ou `PLAYER`.
- `DIRECTOR` e `PRESIDENT` não devem coexistir para a mesma pessoa no mesmo time no MVP.
- Se a UI apresentar combinações, o backend deve validar e recusar combinações inválidas.
