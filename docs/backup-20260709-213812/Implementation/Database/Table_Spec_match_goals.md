---
title: Table Spec match_goals
status: Draft
version: 1.1.0
owner: Product Architecture
last_update: 2026-07-09
related_documents:
  - Table_Spec_matches.md
  - Table_Spec_players.md
  - Table_Spec_match_players.md
---

# Table Spec match_goals

## Objetivo

Especificar `match_goals` — gols de uma partida.

## Campos sugeridos

- `id` (uuid, PK)
- `match_id` (uuid, FK → `matches.id`)
- `frame_type` (enum `frame_type`)
- `match_player_id` (uuid, FK → `match_players.id`, nullable)
- `player_id` (uuid, FK → `players.id`, nullable) — gol pode existir sem autor
- `assist_player_id` (uuid, FK → `players.id`, nullable)
- `minute` (int, nullable)
- `own_goal` (boolean, default false)
- `created_at`

## Regras

- Gol pode existir sem autor (nullable).
- `frame_type` deve indicar em qual quadro o gol aconteceu.
- quando o autor estiver identificado no contexto completo da partida, `match_player_id` deve ser preferido como referência factual do quadro.
- Editar gols recalcula o placar (ver `Domain/Matches.md`).
