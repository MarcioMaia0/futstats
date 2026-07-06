---
title: MVP API Contract
status: Review
version: 1.0.0
owner: Product Architecture
last_update: 2026-07-06
related_documents:
  []
---

# MVP API Contract

## Auth

```text
POST /auth/sign-in
GET /me
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
