---
title: Core Relationships
status: Draft
version: 0.7.0
owner: Product Architecture
last_update: 2026-07-10
related_documents: []
---

# Core Relationships

## Identity

```text
auth.users 1---1 public.users
persons 1---0..1 public.users
persons 1---0..1 players
public.users 1---N user_team_roles
teams 1---N team_members
persons 1---N team_members
```

## Teams and players

```text
teams 1---N team_members
team_members 1---0..N team_players
players 1---N team_players
teams 1---N team_staff_defaults
persons 1---N team_staff_defaults
```

## Matches

```text
teams 1---N matches
scheduled_matches 1---0..N matches
matches 1---N match_players
matches 1---N match_events
matches 1---N match_goals
matches 1---N match_staff
matches 1---N match_referees
matches N---1 venues
```

## Social

```text
public.users 1---N posts
posts 1---N comments
posts 1---N reactions
media_assets 1---N match_cards
```

## Statistics

```text
matches 1---N statistics_snapshots
players 1---N statistics_snapshots
teams 1---N statistics_snapshots
```
