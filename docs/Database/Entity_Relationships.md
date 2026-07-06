---
title: Entity Relationships
status: Draft
version: 0.5.0
owner: Product Architecture
last_update: 2026-07-06
related_documents: []
---

# Entity Relationships

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
matches 1---N match_appearances
players 1---N match_appearances
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
