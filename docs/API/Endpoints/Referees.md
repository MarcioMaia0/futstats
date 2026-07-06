---
title: Referees Endpoints
status: Draft
version: 0.6.0
owner: Product Architecture
last_update: 2026-07-06
related_documents: []
---

# Referees Endpoints

## Objetivo

Documentar endpoints do grupo Referees.

## Endpoints

- `POST /v1/referees`
- `POST /v1/matches/{match_id}/referees`
- `POST /v1/match-referees/{id}/reviews`

## Regras

- Validar autenticação quando necessário.
- Validar permissões por contexto.
- Retornar erros padronizados.
- Evitar acoplamento com textos de UI.
