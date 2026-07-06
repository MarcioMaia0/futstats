---
title: Event Driven Strategy
status: Draft
version: 0.9.0
owner: Product Architecture
last_update: 2026-07-06
---

# Event Driven Strategy


## Objetivo

Documentar a estratégia de eventos do FUTSTATS.

## Por que eventos?

O produto gera muitos efeitos colaterais a partir de ações simples. Um gol registrado pode alterar placar, ranking, card social, estatísticas do atleta e timeline do time.

## Eventos principais

- `MatchCreated`
- `GoalRegistered`
- `GoalUpdated`
- `MatchFinished`
- `MatchCancelled`
- `PlayerLinkedToTeam`
- `RefereeReviewed`
- `PostPublished`
- `ThemeUpdated`

## Regras

1. Eventos devem representar fatos que já aconteceram.
2. Eventos não devem carregar regras de UI.
3. Handlers podem falhar sem desfazer a ação principal, salvo quando a consistência for obrigatória.
4. Eventos críticos devem ser idempotentes.

## Uso inicial

No MVP, eventos podem ser implementados internamente no backend. Em escala maior, podem migrar para fila dedicada.
