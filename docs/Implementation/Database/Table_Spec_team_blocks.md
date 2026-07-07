---
title: Table Spec team_blocks
status: Draft
version: 1.0.0
owner: Product Architecture
last_update: 2026-07-07
related_documents:
  - Table_Spec_user_team_roles.md
  - Table_Spec_comments.md
  - ../../Security/Content_Moderation.md
  - ../../Security/Abuse_Prevention.md
---

# Table Spec team_blocks

## Objetivo

Especificar `team_blocks` — bloqueios de interação aplicados por diretores, escopados ao time.

## Campos sugeridos

- `id` (uuid, PK)
- `team_id` (uuid, FK → `teams.id`)
- `blocked_user_id` (uuid, FK → `users.id`)
- `blocked_by_user_id` (uuid, FK → `users.id`)
- `reason` (text, nullable)
- `blocked_until` (timestamptz, nullable) — nulo = permanente
- `created_at`

## Regras

- Escopo do time: impede interagir (comentar, reagir, dar nota) no contexto daquele time; o bloqueado ainda **lê** o conteúdo público.
- Durações: 1 hora, 1 dia, 1 semana ou permanente → `blocked_until` (nulo = permanente). Ativo enquanto `blocked_until` for futuro ou nulo.
- Só `DIRECTOR` bloqueia; diretor não bloqueia outro diretor do mesmo time.
- Ação registrada em `audit_logs`; aviso neutro ao bloqueado ("suas interações neste time estão suspensas até X").

