---
title: ADR 003 Account User Player Separation
status: Draft
version: 0.4.0
owner: Product Architecture
last_update: 2026-07-06
related_documents: []
---

# ADR 003: Account, User and Player Separation

## Status

Draft

## Contexto

Uma pessoa pode ser usuário, atleta, diretor, árbitro ou torcedor.

## Decisão

Separar `account`, `user` e `player`.

## Consequências

- Permite múltiplos papéis.
- Preserva histórico esportivo.
- Evita modelagem limitada.
