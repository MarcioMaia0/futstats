---
title: Table Spec player_statistics_summary
status: Draft
version: 1.0.0
owner: Product Architecture
last_update: 2026-07-09
related_documents:
  - Table_Spec_player_match_statistics.md
  - ../../API/Statistics_API.md
---

# Table Spec player_statistics_summary

## Objetivo

Especificar `player_statistics_summary`: estatísticas gerais consolidadas do atleta.

## Campos sugeridos

- `player_id` (uuid, PK, FK -> `players.id`)
- `matches_played` (integer, default `0`)
- `starter_matches` (integer, default `0`)
- `bench_matches` (integer, default `0`)
- `official_team_matches` (integer, default `0`)
- `guest_matches` (integer, default `0`)
- `wins` (integer, default `0`)
- `draws` (integer, default `0`)
- `losses` (integer, default `0`)
- `goals_scored` (integer, default `0`)
- `recorded_assists` (integer, default `0`)
- `own_goals` (integer, default `0`)
- `tackles` (integer, default `0`)
- `interceptions` (integer, default `0`)
- `blocks` (integer, default `0`)
- `shots` (integer, default `0`)
- `shots_on_target` (integer, default `0`)
- `saves` (integer, default `0`)
- `goals_conceded_as_goalkeeper` (integer, default `0`)
- `coverage_json` (jsonb, nullable)
- `limitations_json` (jsonb, nullable)
- `updated_at`

## Regras

- uma linha por atleta;
- deve refletir apenas dados aceitos pela regra vigente do produto;
- métricas parciais devem deixar rastros em `coverage_json` e `limitations_json`.
