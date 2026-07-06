---
title: Social Endpoints
status: Draft
version: 0.6.0
owner: Product Architecture
last_update: 2026-07-06
related_documents: []
---

# Social Endpoints

## Objetivo

Documentar endpoints do grupo Social.

## Endpoints

- `GET /v1/feed`
- `POST /v1/posts`
- `POST /v1/posts/{post_id}/comments`
- `POST /v1/posts/{post_id}/reactions`

## Regras

- Validar autenticação quando necessário.
- Validar permissões por contexto.
- Retornar erros padronizados.
- Evitar acoplamento com textos de UI.
