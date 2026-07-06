---
title: Index Strategy
status: Draft
version: 0.6.0
owner: Product Architecture
last_update: 2026-07-06
related_documents: []
---

# Index Strategy

## Objetivo

Definir estratégia inicial de índices.

## Índices essenciais

- `accounts.email`
- `users.account_id`
- `user_team_roles.user_id`
- `user_team_roles.team_id`
- `team_players.team_id`
- `team_players.player_id`
- `matches.team_id`
- `matches.match_date`
- `match_events.match_id`
- `match_events.player_id`
- `posts.team_id`
- `comments.post_id`

## Estratégia

Começar com índices para consultas principais e evoluir com base em métricas reais.

## Cuidados

Evitar índices prematuros em campos pouco consultados.
