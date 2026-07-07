---
title: Table Spec team_players
status: Draft
version: 1.0.0
owner: Product Architecture
last_update: 2026-07-07
related_documents:
  - Table_Spec_players.md
  - Table_Spec_user_team_roles.md
---

# Table Spec team_players

## Objetivo

Especificar `team_players` — o **elenco fixo** de um time (vínculo de pessoa-jogador com o time).

## Campos sugeridos

- `id` (uuid, PK)
- `team_id` (uuid, FK → `teams.id`)
- `player_id` (uuid, FK → `players.id`)
- `shirt_number` (int, nullable)
- `joined_at` (date/timestamptz)
- `left_at` (timestamptz, nullable)
- `active` (boolean, default true)

## Regras

- Elenco fixo (tipos 1 e 3): players com conta ou registros do time. Avulsos NÃO entram aqui — participam via `match_appearances` com `is_guest`.
- Um player pode estar no elenco de mais de um time (linhas distintas).
- `left_at`/`active` preservam o histórico de passagem por time.

