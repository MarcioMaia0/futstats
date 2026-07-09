---
title: Domain Event Model
status: Draft
version: 1.1.0
owner: Product Architecture
last_update: 2026-07-07
related_documents:
  - Domain_Event_Catalog.md
  - Event_Driven_Strategy.md
  - ../Domain/Identity.md
---

# Domain Event Model

## Objetivo

Definir eventos de domínio importantes para desacoplar funcionalidades e permitir evolução da plataforma.

## Eventos principais

| Evento | Quando ocorre | Possíveis consumidores |
|---|---|---|
| `UserSignedUp` | Cadastro por e-mail concluído | Analytics, Security, CRM |
| `SocialAuthCompleted` | Login social concluído com sucesso | Analytics, Security |
| `PhoneOtpVerified` | OTP validado e sessão criada | Analytics, Security |
| `IdentityLinked` | Identidade externa vinculada a conta existente | Security, Audit |
| `PasswordResetRequested` | Recuperação de senha aceita pelo sistema | Security, Notifications |
| `PasswordResetCompleted` | Senha redefinida com sucesso | Security, Audit |
| `ProfileCompleted` | Perfil mínimo de onboarding concluído | Analytics, Search, Experience |
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

## Regras

Eventos devem registrar fatos que já aconteceram, não comandos.

No domínio `Identity`:

- `GetCurrentSession` é consulta, não evento.
- criação de `public.user_preferences` para concluir auth é parte do fluxo principal, não efeito colateral eventual.
- decisão entre Home e `Complete Profile` deve sair do estado consolidado de sessão, não de handlers assíncronos.
