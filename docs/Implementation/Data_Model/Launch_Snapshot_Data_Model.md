---
title: Launch Snapshot Data Model
status: Review
document_type: Historical
version: 2.1.0
owner: Product Architecture
last_update: 2026-07-09
related_documents:
  []
---

# Launch Snapshot Data Model

## Entidades mínimas

- `accounts` (mapeado ao `auth.users` do Supabase)
- `persons`
- `users`
- `user_preferences`
- `teams`
- `venues`
- `user_team_roles`
- `team_join_requests`
- `team_players`
- `team_staff_defaults`
- `players`
- `player_modalities`
- `modality_positions`
- `player_positions`
- `matches`
- `match_players`
- `match_players_positions`
- `match_staff`
- `match_goals`
- `match_cards`
- `user_interest_signals`
- `team_social_connections`
- `post_distribution_attempts`
- `posts`

## Entidades preparadas para evolução próxima

- `match_attendance_responses`
- `match_substitutions`
- `match_events`

## Regra

O recorte inicial de lançamento deve permitir:

- autenticação e onboarding;
- criação de time;
- solicitação para entrar em time;
- vínculo esportivo oficial com time;
- cadastro rápido de atleta avulso;
- escalação de partida com fixos e avulsos;
- registro de partida sem scout avançado.

## Relacionamentos

```text
accounts -> users
persons -> users
persons -> players
users -> user_preferences
users -> user_team_roles -> teams
users -> team_join_requests -> teams
users -> user_interest_signals
players -> player_modalities
players -> player_positions -> modality_positions
players -> team_players -> teams
players -> match_players -> matches
match_players -> match_players_positions -> modality_positions
teams -> team_staff_defaults -> persons
matches -> match_staff -> persons
teams -> venues
teams -> team_social_connections
teams -> matches
matches -> match_goals
matches -> match_cards
matches -> posts
posts -> post_distribution_attempts
```

## Pessoas, papéis, esporte e partida

- `persons`
  - identidade canônica base de qualquer pessoa do ecossistema, com ou sem conta.
- `users`
  - presença daquela `person` na plataforma autenticada.
- `players`
  - identidade esportiva daquela `person`.
- `user_team_roles`
  - papel contextual de gestão ou comissão no time.
- `team_players`
  - vínculo esportivo oficial com o time.
- `match_players`
  - atleta relacionado para uma partida específica, seja fixo ou avulso.
- `match_players_positions`
  - posições em que aquele atleta pode atuar naquela partida.
- `match_staff`
  - técnico efetivo da partida.

## Social, notificações e distribuição

- Interesse implícito:
  - `user_interest_signals` para recomendação e personalização leve.
- Distribuição externa de conteúdo do time:
  - `team_social_connections`
  - `post_distribution_attempts`
- Eventos sociais do time:
  - `posts`

## Fluxos iniciais validados

- Intenção inicial:
  - `users.start_path_completed_at`
  - `users.last_start_path_choice`
- Criar conta:
  - `accounts`
  - `persons`
  - `users`
- Criar time:
  - `teams`
  - `user_team_roles`
  - `venues` quando houver `primary_venue`
  - `media_assets` quando houver escudo
- Entrar em um time:
  - `team_join_requests`
- Aprovação com jogador:
  - `players`
  - `team_players`
- Atleta avulso na partida:
  - `persons`
  - `players`
  - `match_players`
- Interesse implícito:
  - `user_interest_signals`

## Campos mínimos

### persons

- id
- full_name
- nickname
- avatar_media_id
- search_name

### users

- id
- person_id
- username
- display_name
- start_path_completed_at
- last_start_path_choice

### players

- id
- person_id
- dominant_foot
- birth_date
- height_cm
- weight_kg
- profile_completeness_status

### teams

- id
- name
- crest_url
- primary_color
- secondary_color
- accent_color
- default_modality
- region_state
- region_city
- region_zone
- primary_venue_id
- created_by_user_id

### team_players

- id
- team_id
- player_id
- status
- joined_at
- left_at

### matches

- id
- team_id
- opponent_name
- match_date
- home_score
- opponent_score
- status
- modality
- starters_count

### match_players

- id
- match_id
- team_id
- player_id
- shirt_number
- is_starter
- is_team_player

### match_goals

- id
- match_id
- player_id nullable
- minute nullable
- own_goal boolean
