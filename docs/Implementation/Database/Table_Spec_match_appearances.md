---
title: Table Spec match_appearances
status: Draft
version: 1.0.0
owner: Product Architecture
last_update: 2026-07-07
related_documents:
  - Table_Spec_players.md
  - Table_Spec_matches.md
  - Table_Spec_match_ratings.md
---

# Table Spec match_appearances

## Objetivo

Especificar `match_appearances` — quem participou de uma partida, como jogador ou técnico, incluindo avulsos.

## Campos sugeridos

- `id` (uuid, PK)
- `match_id` (uuid, FK → `matches.id`)
- `team_id` (uuid, FK → `teams.id`)
- `player_id` (uuid, FK → `players.id`)
- `role` (enum `participation_role`)
- `is_guest` (boolean, default false)
- `shirt_number` (int, nullable) — para jogadores
- `created_at`

## Enums

- `participation_role`: `PLAYER | COACH`

## Regras

- Registra a participação na partida dos tipos 1–4; `is_guest = true` para avulsos (não pertencem ao elenco).
- Técnico da partida = linha com `role = COACH` (default herdado do time; pode ser trocado ou criado na hora, no momento da escalação).
- Todos os que aparecem podem receber nota (`match_ratings`); a capacidade de dar nota/comentar como player é derivada desta participação.

