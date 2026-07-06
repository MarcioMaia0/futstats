---
title: Players Endpoints
status: Draft
version: 0.6.0
owner: Product Architecture
last_update: 2026-07-06
related_documents: []
---

# Players Endpoints

## Objetivo

Documentar endpoints do grupo Players.

## Endpoints

- `POST /v1/players`
- `GET /v1/players/{player_id}`
- `POST /v1/players/{player_id}/claim`

## Regras

- Validar autenticação quando necessário.
- Validar permissões por contexto.
- Retornar erros padronizados.
- Evitar acoplamento com textos de UI.
