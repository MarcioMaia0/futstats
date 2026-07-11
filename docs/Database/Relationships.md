---
title: Database Relationships
status: Draft
version: 0.6.0
owner: Product Architecture
last_update: 2026-07-10
related_documents: []
---

# Database Relationships

## Objetivo

Descrever os relacionamentos principais do banco.

## Identity

```text
auth.users 1 --- 1 public.users
persons 1 --- 0..1 public.users
persons 1 --- 0..1 players
persons 1 --- N person_social_connections
public.users 1 --- N user_team_roles
teams 1 --- N user_team_roles
teams 1 --- N team_members
persons 1 --- N team_members
public.users 1 --- 1 user_preferences
```

## Teams and Players

```text
teams 1 --- N team_members
team_members 1 --- 0..N team_players
players 1 --- N team_players
team_players 1 --- N team_player_frame_defaults
teams 1 --- N team_staff_defaults
persons 1 --- N team_staff_defaults
players 1 --- N player_match_statistics
players 1 --- 1 player_profile_summary
players 1 --- 1 player_statistics_summary
players 1 --- N player_statistics_by_modality
players 1 --- N player_statistics_by_team_modality
players 1 --- N player_timeline_items
players 1 --- N player_gallery_items
players 1 --- N player_performance_series
players 1 --- N player_style_inference
```

Um jogador pode atuar por vários times. Um time pode ter vários jogadores.

## Scheduled Matches

```text
teams 1 --- N scheduled_matches
scheduled_matches 1 --- N match_attendance_responses
team_members 1 --- N match_attendance_responses
```

## Matches

```text
teams 1 --- N matches
scheduled_matches 1 --- 0..N matches
matches 1 --- N match_players
players 1 --- N match_players
matches 1 --- N match_players_positions
match_players 1 --- N match_players_positions
matches 1 --- N match_staff
persons 1 --- N match_staff
matches 1 --- N match_operator_assignments
public.users 1 --- N match_operator_assignments
matches 1 --- N match_events
match_players 1 --- N match_events
match_opponent_players 1 --- N match_events
matches 1 --- N match_substitutions
match_players 1 --- N match_substitutions
match_opponent_players 1 --- N match_substitutions
matches 1 --- N match_goals
match_players 1 --- N match_goals
matches 1 --- N match_ratings
match_players 1 --- N match_ratings
match_staff 1 --- N match_ratings
matches 1 --- N match_cards
teams 1 --- N match_cards
players 1 --- N match_cards
```

## Opponents and Venues

```text
teams 1 --- N local_opponents
local_opponents 1 --- N local_opponent_players
local_opponents 1 --- N scheduled_matches
local_opponents 1 --- N matches
matches 1 --- N match_opponent_players
local_opponent_players 1 --- N match_opponent_players
venues 1 --- N scheduled_matches
venues 1 --- N matches
```

Adversários locais são privados por time e alimentam tanto agenda quanto operação da partida.

## Referees

```text
persons 1 --- N referees
public.users 1 --- 0..1 referees
matches 1 --- N match_referees
referees 1 --- N match_referees
persons 1 --- N match_referees
match_referees 1 --- N referee_reviews
referees 1 --- N referee_reviews
public.users 1 --- N referee_reviews
```

## Social

```text
public.users 1 --- N posts
posts 1 --- N comments
posts 1 --- N reactions
public.users 1 --- N follows
media_assets 1 --- N posts
media_assets 1 --- N match_cards
```

## Experience

```text
themes 1 --- N user_preferences
teams 1 --- N team_social_connections
```

## Regra histórica

Relacionamentos ligados a partidas não devem ser apagados fisicamente sem necessidade. A integridade histórica é prioritária.
