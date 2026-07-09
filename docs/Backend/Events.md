---
title: Backend Events
status: Draft
version: 0.7.0
owner: Product Architecture
last_update: 2026-07-09
related_documents:
  - ../Architecture/Domain_Event_Catalog.md
  - ../Architecture/Event_Driven_Strategy.md
  - ../Domain/Identity.md
---

# Backend Events

## Objetivo

Definir eventos de domínio usados pelo backend para desacoplar efeitos colaterais.

## Eventos iniciais

### Identity

- `UserSignedUp`
- `SocialAuthCompleted`
- `PhoneOtpVerified`
- `IdentityLinked`
- `PasswordResetRequested`
- `PasswordResetCompleted`
- `ProfileCompleted`

### Outros domínios

- `TeamCreated`
- `TeamJoinRequestCreated`
- `TeamJoinRequestApproved`
- `TeamJoinRequestRejected`
- `PlayerJoinedTeam`
- `PlayerWelcomePostPublished`
- `ExternalPostDistributionQueued`
- `ExternalPostDistributionPublished`
- `ExternalPostDistributionFailed`
- `ExternalPostDistributionRetryScheduled`
- `TeamFollowersNotifiedAboutNewPlayer`
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

Eventos devem ser usados para efeitos colaterais, como:

- auditoria;
- analytics;
- notificações;
- segurança;
- geração de cards;
- recálculo de estatísticas;
- atualização de índices e caches derivados.

## Regra

Evento não deve substituir transação principal. Primeiro conclui a ação, depois dispara efeitos.

No domínio `Identity`, isso significa:

- criar conta, perfil mínimo e estado de sessão no fluxo principal;
- usar evento apenas para efeitos secundários;
- nunca depender de handler assíncrono para decidir onboarding.

No domínio `Teams`, isso também significa:

- criar a `join_request` na transação principal;
- disparar notificação para a gestão do time como efeito derivado;
- aprovar a `join_request` e persistir os vínculos do time na transação principal;
- rejeitar a `join_request` na transação principal quando essa for a decisão válida;
- publicar post de boas-vindas e disparar notificações como efeitos derivados controlados;
- enfileirar distribuição externa como operação derivada;
- não deixar a aprovação dependente de sucesso de notificação ou rede social para ser considerada concluída.
