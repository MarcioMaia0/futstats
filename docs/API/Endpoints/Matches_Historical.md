---
title: Matches Endpoints Historical
status: Draft
document_type: Historical
version: 0.7.0
owner: Product Architecture
last_update: 2026-07-07
related_documents:
  - ../Matches_API.md
---

# Matches Endpoints Historical

## Status

Rascunho historico preservado. A referencia oficial do assunto agora e `../Matches_API.md`.

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
