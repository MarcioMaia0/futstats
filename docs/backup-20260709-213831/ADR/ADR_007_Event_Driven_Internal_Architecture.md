---
title: ADR 007 Event Driven Internal Architecture
status: Draft
version: 0.9.0
owner: Product Architecture
last_update: 2026-07-06
---

# ADR 007: Event Driven Internal Architecture


## Status

Draft

## Contexto

Muitas ações geram efeitos colaterais.

## Decisão

Adotar eventos internos desde cedo, mesmo que inicialmente implementados no próprio backend.

## Consequências

Facilita evolução para filas, jobs e integrações futuras.
