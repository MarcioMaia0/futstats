---
title: Offline Strategy
status: Draft
document_type: Reference
version: 1.0.0
owner: Product Architecture
last_update: 2026-07-07
related_documents:
  - Offline_First_Strategy.md
---

# Offline Strategy

## Objetivo

Manter um ponto de entrada curto para o tema offline e apontar para a estrategia canonica.

## Fonte oficial

O documento canonico do assunto e `Offline_First_Strategy.md`.

## Escopo resumido

- Registrar placar localmente.
- Registrar gols pendentes.
- Sincronizar depois.
- Evitar duplicidade de eventos.

## Regras-chave

1. Cada evento local deve possuir `client_event_id`.
2. Sincronizacao deve ser idempotente.
3. Conflitos devem ser exibidos ao usuario.
4. Operacoes destrutivas offline devem ser limitadas.

## Regra

Este arquivo nao deve duplicar a estrategia detalhada. Quando houver divergencia, prevalece `Offline_First_Strategy.md`.
