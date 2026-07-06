---
title: Experience Endpoints
status: Draft
version: 0.6.0
owner: Product Architecture
last_update: 2026-07-06
related_documents: []
---

# Experience Endpoints

## Objetivo

Documentar endpoints do grupo Experience.

## Endpoints

- `GET /v1/me/preferences`
- `PATCH /v1/me/preferences`
- `GET /v1/ui/vocabulary`

## Regras

- Validar autenticação quando necessário.
- Validar permissões por contexto.
- Retornar erros padronizados.
- Evitar acoplamento com textos de UI.
