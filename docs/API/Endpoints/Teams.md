---
title: Teams Endpoints
status: Draft
version: 0.6.0
owner: Product Architecture
last_update: 2026-07-06
related_documents: []
---

# Teams Endpoints

## Objetivo

Documentar endpoints do grupo Teams.

## Endpoints

- `POST /v1/teams`
- `GET /v1/teams/{team_id}`
- `PATCH /v1/teams/{team_id}`

## Regras

- Validar autenticação quando necessário.
- Validar permissões por contexto.
- Retornar erros padronizados.
- Evitar acoplamento com textos de UI.
