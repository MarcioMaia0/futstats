---
title: Experience Endpoints Historical
status: Draft
document_type: Historical
version: 0.7.0
owner: Product Architecture
last_update: 2026-07-07
related_documents:
  - ../Experience_API.md
---

# Experience Endpoints Historical

## Status

Rascunho historico preservado. A referencia oficial do assunto agora e `../Experience_API.md`.

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
