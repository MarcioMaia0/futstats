---
title: Table Spec notifications
status: Draft
version: 0.2.0
owner: Product Architecture
last_update: 2026-07-09
related_documents:
  - ../../API/Teams_API.md
  - ../../Backend/Events.md
  - ../../Implementation/Database/Table_Spec_team_join_requests.md
---

# Table Spec notifications

## Objetivo

Especificar a tabela `notifications` para avisos in-app direcionados a usuários.

## Campos sugeridos

- `id` (uuid, PK)
- `recipient_user_id` (uuid, FK -> `users.id`)
- `type` (enum `notification_type`)
- `title` (text)
- `body` (text, nullable)
- `status` (enum `notification_status`)
- `action_url` (text, nullable)
- `payload` (jsonb, nullable)
- `created_at` (timestamptz)
- `read_at` (timestamptz, nullable)
- `archived_at` (timestamptz, nullable)

## Regras

- notificação é derivada de um fato do domínio, não substitui a transação principal;
- o estado atual do produto pode começar com notificação in-app como canal principal;
- push pode existir depois como projeção complementar, sem alterar a tabela base;
- `payload` deve guardar contexto mínimo para a UI resolver o destino ou exibir resumo do evento.

## Enums iniciais

- `notification_type`
  - `TEAM_JOIN_REQUEST_CREATED`
  - `TEAM_JOIN_REQUEST_APPROVED`
  - `TEAM_JOIN_REQUEST_REJECTED`
  - `PLAYER_WELCOME_PUBLISHED`
- `notification_status`
  - `UNREAD`
  - `READ`
  - `ARCHIVED`

## Regra específica: nova solicitação de entrada em time

Quando uma `team_join_request` for criada com sucesso:

- o sistema deve gerar notificação para pessoas com gestão do time;
- no estado atual do produto, isso significa integrantes com `DIRECTOR` ou `PRESIDENT`;
- `COMMITTEE` não recebe essa notificação operacional por padrão;
- a pessoa solicitante não precisa receber notificação espelhada deste mesmo evento;
- a notificação deve apontar para a área de gestão de solicitações do time.

### Payload conceitual sugerido

```json
{
  "team_id": "uuid-team",
  "team_name": "Ajax da Leste",
  "join_request_id": "uuid-request",
  "requester_user_id": "uuid-user",
  "requester_display_name": "Marcio",
  "notification_context": "TEAM_JOIN_REQUEST_CREATED"
}
```

## Regra específica: solicitação resolvida

Quando uma `team_join_request` sair de `PENDING`:

- a pessoa solicitante deve receber notificação do resultado;
- `APPROVED` usa `notification_type = TEAM_JOIN_REQUEST_APPROVED`;
- `REJECTED` usa `notification_type = TEAM_JOIN_REQUEST_REJECTED`.

### Regra de conteúdo para aprovação

- a mensagem pode ser celebratória;
- a mensagem pode citar o time e a função final;
- a mensagem não precisa citar quem aprovou.

### Regra de conteúdo para rejeição

- a mensagem deve ser neutra e respeitosa;
- a mensagem não deve citar quem rejeitou;
- a mensagem deve informar apenas que o time não aprovou a solicitação naquele momento.

### Payload conceitual sugerido para aprovação

```json
{
  "team_id": "uuid-team",
  "team_name": "Uniao de Artur Alvim",
  "join_request_id": "uuid-request",
  "approved_membership_mode": "PLAYER",
  "notification_context": "TEAM_JOIN_REQUEST_APPROVED"
}
```

### Payload conceitual sugerido para rejeição

```json
{
  "team_id": "uuid-team",
  "team_name": "Uniao de Artur Alvim",
  "join_request_id": "uuid-request",
  "notification_context": "TEAM_JOIN_REQUEST_REJECTED"
}
```
