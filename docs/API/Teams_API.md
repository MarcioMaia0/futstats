---
title: Teams API
status: Draft
version: 0.4.0
owner: Product Architecture
last_update: 2026-07-06
related_documents: []
---

# Teams API

## Rotas

```text
POST /api/v1/teams
GET /api/v1/teams/:team_id
PATCH /api/v1/teams/:team_id
GET /api/v1/teams/:team_id/members
POST /api/v1/teams/:team_id/invites
PATCH /api/v1/teams/:team_id/settings
```

## Regras

Criação rápida deve exigir apenas nome do time.
