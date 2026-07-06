---
title: Core Relationships
status: Draft
version: 0.6.0
owner: Product Architecture
last_update: 2026-07-06
related_documents: []
---

# Core Relationships

## Identity

```text
accounts 1---1 users
users 1---N user_team_roles
roles 1---N user_team_roles
```

## Teams and players

```text
teams 1---N team_players
players 1---N team_players
```

## Matches

```text
teams 1---N matches
matches 1---N match_events
matches 1---N match_referees
matches N---1 venues
```

## Social

```text
users 1---N posts
posts 1---N comments
posts 1---N reactions
```

## Statistics

```text
matches 1---N statistics_snapshots
players 1---N statistics_snapshots
teams 1---N statistics_snapshots
```
