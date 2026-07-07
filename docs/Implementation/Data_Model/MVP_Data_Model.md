---
title: MVP Data Model
status: Review
version: 1.0.0
owner: Product Architecture
last_update: 2026-07-06
related_documents:
  []
---

# MVP Data Model

## Entidades mínimas

- `accounts`
- `users`
- `teams`
- `team_members`
- `players`
- `matches`
- `match_goals`
- `match_cards`
- `posts`

## Regra

O MVP deve permitir registro de partida sem scout.

## Relacionamentos

```text
accounts → users
users → team_members → teams
teams → matches
matches → match_goals
matches → match_cards
matches → posts
players → match_goals
```

## Campos mínimos

### teams

- id
- name
- logo_url
- primary_color
- secondary_color
- accent_color
- default_modality (enum: FUTSAL, SOCIETY, FIELD; padrão FUTSAL)

### matches

- id
- team_id
- opponent_name
- match_date
- home_score
- opponent_score
- status
- modality (enum: FUTSAL, SOCIETY, FIELD; herdado do time)
- starters_count (padrão por modalidade: 5/7/11)

### match_goals

- id
- match_id
- player_id nullable
- minute nullable
- own_goal boolean
