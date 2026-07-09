---
title: Domain Event Catalog
status: Draft
version: 1.0.0
owner: Product Architecture
last_update: 2026-07-07
related_documents:
  - Domain_Event_Model.md
  - Event_Driven_Strategy.md
  - ../Domain/Identity.md
---

# Domain Event Catalog

## Objetivo

Listar os principais eventos de domínio do FUTSTATS.

## Eventos de produto

### Identity

- `UserSignedUp`
- `SocialAuthCompleted`
- `PhoneOtpVerified`
- `IdentityLinked`
- `PasswordResetRequested`
- `PasswordResetCompleted`
- `ProfileCompleted`

### Teams

- `TeamCreated`
- `TeamThemeChanged`

### Players

- `PlayerCreated`
- `PlayerClaimRequested`

### Matches

- `MatchCreated`
- `MatchScheduled`
- `MatchStarted`
- `GoalRegistered`
- `GoalUpdated`
- `MatchFinished`
- `MatchCancelled`
- `MatchShared`

### Referees

- `RefereeAssigned`
- `RefereeReviewed`

### Social

- `PostPublished`
- `CommentAdded`
- `ReactionAdded`

### Statistics and Intelligence

- `StatisticsRecalculated`
- `InsightGenerated`

## Regras

1. Eventos devem representar fatos que já aconteceram.
2. Eventos não devem carregar texto de interface como valor canônico.
3. Eventos podem alimentar notificações, estatísticas, analytics, segurança e feed.
4. Eventos críticos devem ser auditáveis.
5. Eventos de autenticação e onboarding pertencem ao domínio `Identity`, não à UI.
