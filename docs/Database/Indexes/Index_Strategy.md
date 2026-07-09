---
title: Index Strategy
status: Draft
version: 1.0.0
owner: Product Architecture
last_update: 2026-07-09
related_documents:
  - ../../ADR/ADR_012_Identity_On_Supabase_Auth.md
  - ../../Implementation/Database/Table_Spec_users.md
---

# Index Strategy

## Objetivo

Definir estrategia inicial de indices.

## Indices essenciais

- `auth.users.email`
- `auth.users.phone`
- `users.username`
- `user_team_roles.user_id`
- `user_team_roles.team_id`
- `team_players.team_id`
- `team_players.player_id`
- `matches.team_id`
- `matches.match_date`
- `match_events.match_id`
- `match_events.primary_match_player_id`
- `posts.team_id`
- `comments.post_id`
- `player_match_statistics.player_id`
- `player_match_statistics.player_id + match_date`
- `player_statistics_by_modality.player_id + modality`
- `player_statistics_by_team_modality.player_id + team_id + modality`
- `player_timeline_items.player_id + occurred_at desc`
- `player_gallery_items.player_id + published_at desc`

## Estrategia

Comecar com indices para consultas principais e evoluir com base em metricas reais.

## Cuidados

Evitar indices prematuros em campos pouco consultados.
