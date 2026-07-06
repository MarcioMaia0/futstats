---
title: Statistics Endpoints
status: Draft
version: 0.6.0
owner: Product Architecture
last_update: 2026-07-06
related_documents: []
---

# Statistics Endpoints

## Objetivo

Documentar endpoints do grupo Statistics.

## Endpoints

- `GET /v1/teams/{team_id}/statistics`
- `GET /v1/players/{player_id}/statistics`
- `GET /v1/matches/{match_id}/report`

## Regras

- Validar autenticação quando necessário.
- Validar permissões por contexto.
- Retornar erros padronizados.
- Evitar acoplamento com textos de UI.
