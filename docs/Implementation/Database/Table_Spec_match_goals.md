---
title: Table Spec match_goals
status: Draft
version: 1.0.0
owner: Product Architecture
last_update: 2026-07-07
related_documents:
  - Table_Spec_matches.md
  - Table_Spec_players.md
---

# Table Spec match_goals

## Objetivo

Especificar `match_goals` — gols de uma partida.

## Campos sugeridos

- `id` (uuid, PK)
- `match_id` (uuid, FK → `matches.id`)
- `player_id` (uuid, FK → `players.id`, nullable) — gol pode existir sem autor
- `assist_player_id` (uuid, FK → `players.id`, nullable)
- `minute` (int, nullable)
- `own_goal` (boolean, default false)
- `created_at`

## Regras

- Gol pode existir sem autor (nullable).
- Editar gols recalcula o placar (ver `Domain/Matches.md`).
