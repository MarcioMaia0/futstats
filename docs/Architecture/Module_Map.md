---
title: Module Map
status: Draft
version: 1.0.0
owner: Product Architecture
last_update: 2026-07-06
related_documents:
  []
---

# Module Map

## Módulos de domínio

- Identity
- Teams
- Players
- Matches
- Opponents
- Venues
- Referees
- Statistics
- Social
- Experience
- Media
- Gamification

## Módulos técnicos

- Authentication
- Authorization
- Notifications
- Storage
- Search
- Analytics
- AI
- Moderation
- Billing

## Dependência recomendada

```text
API Layer
  ↓
Application Services
  ↓
Domain Services
  ↓
Repositories
  ↓
Database / External Services
```

## Regra

Módulos de domínio não devem depender diretamente de frameworks de interface.
