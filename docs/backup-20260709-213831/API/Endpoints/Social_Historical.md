---
title: Social Endpoints Historical
status: Draft
document_type: Historical
version: 0.7.0
owner: Product Architecture
last_update: 2026-07-07
related_documents:
  - ../Social_API.md
---

# Social Endpoints Historical

## Status

Rascunho historico preservado. A referencia oficial do assunto agora e `../Social_API.md`.

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
