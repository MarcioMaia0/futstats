---
title: Domain Event Model
status: Draft
version: 1.0.0
owner: Product Architecture
last_update: 2026-07-06
related_documents:
  []
---

# Domain Event Model

## Objetivo

Definir eventos de domínio importantes para desacoplar funcionalidades e permitir evolução da plataforma.

## Eventos principais

| Evento | Quando ocorre | Possíveis consumidores |
|---|---|---|
| `TeamCreated` | Time criado | Analytics, Feed, Onboarding |
| `PlayerCreated` | Perfil esportivo criado | Search, Social |
| `MatchScheduled` | Partida agendada | Notifications, Calendar |
| `MatchStarted` | Partida iniciada | Live, Analytics |
| `GoalRegistered` | Gol registrado | Score, Feed, Statistics |
| `MatchFinished` | Partida finalizada | Statistics, Feed, Cards |
| `MatchCancelled` | Partida cancelada | Reliability, Notifications |
| `RefereeReviewed` | Arbitragem avaliada | Referee Reputation |
| `PostPublished` | Post social publicado | Feed, Moderation |
| `ThemeUpdated` | Tema alterado | Cache, Cards |

## Regra

Eventos devem registrar fatos que já aconteceram, não comandos.
