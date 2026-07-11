---
title: Launch Snapshot API Map
status: Review
document_type: Historical
version: 1.1.0
owner: Product Architecture
last_update: 2026-07-07
related_documents:
  - ../../API/Auth_API.md
  - ../../API/Identity_API.md
---

# Launch Snapshot API Map

## Regra

Este documento é apenas um mapa resumido de endpoints do recorte inicial de lançamento.

Os contratos oficiais de `Identity` estão em:

- `../../API/Auth_API.md`
- `../../API/Identity_API.md`

## Identity

```text
GET /api/v1/me
POST /api/v1/auth/sign-up
POST /api/v1/auth/sign-in
POST /api/v1/auth/forgot-password
POST /api/v1/auth/reset-password
POST /api/v1/auth/social/start
POST /api/v1/auth/social/complete
POST /api/v1/auth/phone/request-code
POST /api/v1/auth/phone/verify-code
POST /api/v1/auth/complete-profile
GET /api/v1/auth/username-availability
POST /api/v1/auth/sign-out
PATCH /api/v1/me
PATCH /api/v1/me/preferences
GET /api/v1/me/roles
```

## Teams

```text
POST /teams
GET /teams/:teamId
PATCH /teams/:teamId
```

## Players

```text
POST /players
GET /players/:playerId
```

## Matches

```text
POST /matches
GET /matches/:matchId
PATCH /matches/:matchId/score
POST /matches/:matchId/goals
POST /matches/:matchId/finish
```

## Sharing

```text
POST /matches/:matchId/card
GET /matches/:matchId/card
```

## Social

```text
GET /feed
POST /posts/:postId/reactions
POST /posts/:postId/comments
```
