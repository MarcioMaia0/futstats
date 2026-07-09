---
title: Referees Endpoints Historical
status: Draft
document_type: Historical
version: 0.7.0
owner: Product Architecture
last_update: 2026-07-07
related_documents:
  - ../Referees_API.md
---

# Referees Endpoints Historical

## Status

Rascunho historico preservado. A referencia oficial do assunto agora e `../Referees_API.md`.

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
