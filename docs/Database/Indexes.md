---
title: Database Indexes
status: Draft
version: 1.0.0
owner: Product Architecture
last_update: 2026-07-09
related_documents:
  - ../ADR/ADR_012_Identity_On_Supabase_Auth.md
  - ../Implementation/Database/Table_Spec_users.md
---

# Database Indexes

## Objetivo

Definir indices iniciais para performance.

## Identity

- `auth.users.email`
- `auth.users.phone`
- `users.username`

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
- `match_events.primary_match_player_id`
- `match_events.event_type`
- `match_events.occurred_at`

## Social

- `posts.created_at`
- `posts.team_id`
- `comments.post_id`
- `reactions.post_id`

## Player Profile Read Models

- `player_match_statistics.player_id`
- `player_match_statistics.match_id`
- `player_match_statistics.team_id`
- `player_match_statistics.match_date`
- `player_match_statistics.player_id + team_id + modality`
- `player_statistics_by_modality.player_id + modality`
- `player_statistics_by_team_modality.player_id + team_id + modality`
- `player_timeline_items.player_id + occurred_at`
- `player_gallery_items.player_id + published_at`
- `player_gallery_items.player_id + modality + published_at`
- `player_gallery_items.player_id + team_id + published_at`
- `player_gallery_group_counters.player_id + scope_type + modality + team_id`
- `player_performance_series.player_id + scope_type + bucket_type + bucket_start_date`
- `player_style_inference.player_id + scope_type + modality + team_id`

## Observacao

Indices devem ser revisados com dados reais de uso.
