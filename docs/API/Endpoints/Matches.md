---
title: Matches Endpoints
status: Draft
version: 0.6.0
owner: Product Architecture
last_update: 2026-07-06
related_documents: []
---

# Matches Endpoints

## Objetivo

Documentar endpoints do grupo Matches.

## Endpoints

- `POST /v1/matches`
- `GET /v1/matches/{match_id}`
- `POST /v1/matches/{match_id}/goals`
- `POST /v1/matches/{match_id}/finish`

## Regras

- Validar autenticação quando necessário.
- Validar permissões por contexto.
- Retornar erros padronizados.
- Evitar acoplamento com textos de UI.
