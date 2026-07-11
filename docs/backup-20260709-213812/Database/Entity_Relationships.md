---
title: Entity Relationships
status: Draft
version: 0.6.0
owner: Product Architecture
last_update: 2026-07-09
related_documents: []
---

# Entity Relationships

## Identity

```text
auth.users 1---1 public.users
persons 1---0..1 public.users
persons 1---0..1 players
public.users 1---N user_team_roles
roles 1---N user_team_roles
```

## Teams and players

```text
teams 1---N team_players
players 1---N team_players
players 1---N player_match_statistics
players 1---1 player_profile_summary
players 1---1 player_statistics_summary
players 1---N player_statistics_by_modality
players 1---N player_statistics_by_team_modality
players 1---N player_timeline_items
players 1---N player_gallery_items
players 1---N player_performance_series
players 1---N player_style_inference
```

## Matches

```text
teams 1---N matches
matches 1---N match_events
matches 1---N match_players
players 1---N match_players
matches 1---N match_players_positions
match_players 1---N match_players_positions
matches 1---N match_staff
persons 1---N match_staff
matches 1---N match_attendance_responses
players 1---N match_attendance_responses
matches 1---N match_substitutions
match_players 1---N match_substitutions
```

## Referees

```text
referees 1---N match_referees
matches 1---N match_referees
match_referees 1---N referee_reviews
```

## Social

```text
users 1---N posts
posts 1---N comments
posts 1---N reactions
users 1---N follows
```

## Experience

```text
users 1---1 user_preferences
teams 1---1 team_experience_settings
themes 1---N user_preferences
```
