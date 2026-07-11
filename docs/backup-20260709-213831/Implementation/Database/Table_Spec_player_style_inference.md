---
title: Table Spec player_style_inference
status: Draft
version: 1.0.0
owner: Product Architecture
last_update: 2026-07-09
related_documents:
  - Table_Spec_player_positions.md
  - Table_Spec_match_players_positions.md
  - ../../Domain/Statistics.md
---

# Table Spec player_style_inference

## Objetivo

Especificar `player_style_inference`: inferência contextual do estilo de jogo do atleta.

## Campos sugeridos

- `id` (uuid, PK)
- `player_id` (uuid, FK -> `players.id`)
- `scope_type` (enum `style_scope_type`)
- `modality` (enum `sport_modality`, nullable)
- `team_id` (uuid, nullable)
- `style` (enum `player_style`)
- `confidence` (enum `inference_confidence`)
- `declared_weight` (numeric, nullable)
- `historical_position_weight` (numeric, nullable)
- `statistical_signature_weight` (numeric, nullable)
- `explanation_json` (jsonb, nullable)
- `updated_at`

## Enums

- `style_scope_type`
  - `GENERAL`
  - `MODALITY`
  - `TEAM`
- `player_style`
  - `OFFENSIVE`
  - `DEFENSIVE`
  - `BALANCED`
  - `GOALKEEPER`
- `inference_confidence`
  - `LOW`
  - `MEDIUM`
  - `HIGH`

## Regras

- a inferência é contextual e pode variar por modalidade ou time;
- não substitui o que o atleta declara;
- existe para ajudar leitura e destaque visual;
- deve preferir ausência de inferência a classificação fraca.
