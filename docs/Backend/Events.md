---
title: Backend Events
status: Draft
version: 0.4.0
owner: Product Architecture
last_update: 2026-07-06
related_documents: []
---

# Backend Events

## Objetivo

Definir eventos de domínio.

## Eventos iniciais

- `TeamCreated`
- `PlayerCreated`
- `MatchCreated`
- `GoalRegistered`
- `MatchFinished`
- `MatchCancelled`
- `StatisticsRecalculated`
- `RefereeReviewed`
- `PostPublished`
- `ThemeUpdated`

## Uso

Eventos devem ser usados para efeitos colaterais, como recalcular estatísticas, gerar cards, criar posts automáticos ou notificar usuários.

## Regra

Evento não deve substituir transação principal. Primeiro conclui a ação, depois dispara efeitos.
