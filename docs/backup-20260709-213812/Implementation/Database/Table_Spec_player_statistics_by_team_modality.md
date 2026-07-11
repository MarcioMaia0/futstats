---
title: Table Spec player_statistics_by_team_modality
status: Draft
version: 1.0.0
owner: Product Architecture
last_update: 2026-07-09
related_documents:
  - Table_Spec_player_statistics_by_modality.md
---

# Table Spec player_statistics_by_team_modality

## Objetivo

Especificar `player_statistics_by_team_modality`: agregação por atleta, time e modalidade.

## Campos sugeridos

- `id` (uuid, PK)
- `player_id` (uuid, FK -> `players.id`)
- `team_id` (uuid, FK -> `teams.id`)
- `modality` (enum `sport_modality`)
- `first_match_at` (timestamptz, nullable)
- `last_match_at` (timestamptz, nullable)
- todos os contadores principais de `player_statistics_summary`
- `inferred_style` (enum `player_style`, nullable)
- `inferred_style_confidence` (enum `inference_confidence`, nullable)
- `updated_at`

## Regras

- deve existir no máximo uma linha por `player_id + team_id + modality`;
- base principal para filtro por escudo/time dentro do contexto do perfil.
