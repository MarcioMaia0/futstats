---
title: Statistics Endpoints Historical
status: Draft
document_type: Historical
version: 0.7.0
owner: Product Architecture
last_update: 2026-07-07
related_documents:
  - ../Statistics_API.md
---

# Statistics Endpoints Historical

## Status

Rascunho historico preservado. A referencia oficial do assunto agora e `../Statistics_API.md`.

## Objetivo

Documentar endpoints do grupo Statistics.

## Endpoints

- `GET /v1/teams/{team_id}/statistics`
- `GET /v1/players/{player_id}/statistics`
- `GET /v1/matches/{match_id}/report`

## Regras

- Validar autenticação quando necessário.
- Validar permissões por contexto.
- Retornar erros padronizados.
- Evitar acoplamento com textos de UI.
