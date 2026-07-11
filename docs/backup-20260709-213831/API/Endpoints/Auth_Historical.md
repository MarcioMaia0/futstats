---
title: Auth Endpoints Historical
status: Draft
document_type: Historical
version: 0.7.0
owner: Product Architecture
last_update: 2026-07-07
related_documents:
  - ../Auth_API.md
---

# Auth Endpoints Historical

## Status

Rascunho historico preservado. A referencia oficial do assunto agora e `../Auth_API.md`.

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
