---
title: Auth Endpoints
status: Draft
version: 0.6.0
owner: Product Architecture
last_update: 2026-07-06
related_documents: []
---

# Auth Endpoints

## Objetivo

Documentar endpoints do grupo Auth.

## Endpoints

- `POST /v1/auth/sign-in`
- `POST /v1/auth/sign-out`
- `GET /v1/me`

## Regras

- Validar autenticação quando necessário.
- Validar permissões por contexto.
- Retornar erros padronizados.
- Evitar acoplamento com textos de UI.
