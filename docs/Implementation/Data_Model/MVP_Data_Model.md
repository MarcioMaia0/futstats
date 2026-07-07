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

- `accounts` (mapeado ao `auth.users` do Supabase — ver ADR 012, Opção A)
- `users`
- `user_preferences`
- `teams`
- `user_team_roles`
- `team_players`
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
users → user_preferences
users → user_team_roles → teams
players → team_players → teams
teams → matches
matches → match_goals
matches → match_cards
matches → posts
players → match_goals
```

## Pessoas, papéis e social

- `players` é o pool de pessoas do time (jogador/técnico/árbitro; user global ou registro do time). Ver ADR 004/012 e `../Database/Table_Spec_players.md`.
- Papel de gestão = `user_team_roles` (ex.: `DIRECTOR`); elenco = `team_players`; participação na partida = `match_appearances` (jogador/técnico); arbitragem = `match_referees`.
- Social e moderação: `follows`, `match_ratings` (peer/geral), `referee_reviews` (peso por papel), `comments` (thread + ocultar), `reactions` (dialeto), `team_blocks`.

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
