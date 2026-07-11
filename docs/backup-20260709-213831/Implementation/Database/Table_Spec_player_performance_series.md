---
title: Table Spec player_performance_series
status: Draft
version: 1.0.0
owner: Product Architecture
last_update: 2026-07-09
related_documents:
  - Table_Spec_player_match_statistics.md
  - ../../Frontend/Screens/Player_Profile.md
---

# Table Spec player_performance_series

## Objetivo

Especificar `player_performance_series`: série temporal pronta para gráficos do perfil do atleta.

## Campos sugeridos

- `id` (uuid, PK)
- `player_id` (uuid, FK -> `players.id`)
- `scope_type` (enum `performance_scope_type`)
- `modality` (enum `sport_modality`, nullable)
- `team_id` (uuid, nullable)
- `bucket_type` (enum `time_bucket_type`)
- `bucket_start_date` (date)
- `matches_played` (integer, default `0`)
- `minutes_played` (integer, default `0`)
- `goals_scored` (integer, default `0`)
- `recorded_assists` (integer, default `0`)
- `tackles` (integer, default `0`)
- `interceptions` (integer, default `0`)
- `blocks` (integer, default `0`)
- `saves` (integer, default `0`)
- `wins` (integer, default `0`)
- `draws` (integer, default `0`)
- `losses` (integer, default `0`)
- `updated_at`

## Enums

- `performance_scope_type`
  - `GENERAL`
  - `MODALITY`
  - `TEAM`
- `time_bucket_type`
  - `DAY`
  - `WEEK`
  - `MONTH`

## Regras

- uma linha por bucket temporal e contexto;
- deve servir tanto para visão geral quanto para visão filtrada;
- sem base suficiente, a série pode existir parcialmente ou não existir.
