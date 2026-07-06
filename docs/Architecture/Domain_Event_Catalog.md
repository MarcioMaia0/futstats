---
title: Domain Event Catalog
status: Draft
version: 0.9.0
owner: Product Architecture
last_update: 2026-07-06
related_documents:
[]
---

# Domain Event Catalog

## Objetivo

Listar os principais eventos de domínio do FUTSTATS.

## Eventos de produto

- `AccountCreated`
- `UserProfileUpdated`
- `TeamCreated`
- `TeamThemeChanged`
- `PlayerCreated`
- `PlayerClaimRequested`
- `MatchCreated`
- `MatchScheduled`
- `MatchStarted`
- `GoalRegistered`
- `GoalUpdated`
- `MatchFinished`
- `MatchCancelled`
- `MatchShared`
- `RefereeAssigned`
- `RefereeReviewed`
- `PostPublished`
- `CommentAdded`
- `ReactionAdded`
- `StatisticsRecalculated`
- `InsightGenerated`

## Regras

1. Eventos devem representar fatos que já aconteceram.
2. Eventos não devem carregar texto de interface como valor canônico.
3. Eventos podem alimentar notificações, estatísticas, analytics e feed.
4. Eventos críticos devem ser auditáveis.
