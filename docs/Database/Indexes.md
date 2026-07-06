---
title: Database Indexes
status: Draft
version: 0.5.0
owner: Product Architecture
last_update: 2026-07-06
related_documents: []
---

# Database Indexes

## Objetivo

Definir índices iniciais para performance.

## Identity

- `accounts.email`
- `accounts.provider_external_id`
- `users.account_id`

## Teams

- `teams.slug`
- `team_players.team_id`
- `team_players.player_id`
- `user_team_roles.user_id`
- `user_team_roles.team_id`

## Matches

- `matches.team_id`
- `matches.match_date`
- `matches.status`
- `matches.local_opponent_id`
- `matches.venue_id`

## Events

- `match_events.match_id`
- `match_events.player_id`
- `match_events.event_type`
- `match_events.occurred_at`

## Social

- `posts.created_at`
- `posts.team_id`
- `comments.post_id`
- `reactions.post_id`

## Observação

Índices devem ser revisados com dados reais de uso.
