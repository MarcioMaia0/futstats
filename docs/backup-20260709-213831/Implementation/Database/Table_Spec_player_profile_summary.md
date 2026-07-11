---
title: Table Spec player_profile_summary
status: Draft
version: 1.0.0
owner: Product Architecture
last_update: 2026-07-09
related_documents:
  - Table_Spec_persons.md
  - Table_Spec_players.md
  - ../../Architecture/Player_Profile_Read_Model_Strategy.md
---

# Table Spec player_profile_summary

## Objetivo

Especificar `player_profile_summary`: resumo principal do perfil do atleta.

## Campos sugeridos

- `player_id` (uuid, PK, FK -> `players.id`)
- `person_id` (uuid, FK -> `persons.id`)
- `avatar_media_id` (uuid, nullable)
- `full_name` (text, nullable)
- `nickname` (text)
- `dominant_foot` (enum `dominant_foot`, nullable)
- `birth_date` (date, nullable)
- `height_cm` (integer, nullable)
- `weight_kg` (numeric, nullable)
- `profile_completeness_status` (enum `player_profile_completeness_status`)
- `active_teams_count` (integer, default `0`)
- `modalities_count` (integer, default `0`)
- `last_match_at` (timestamptz, nullable)
- `last_post_at` (timestamptz, nullable)
- `inferred_primary_style` (enum `player_style`, nullable)
- `inferred_primary_style_confidence` (enum `inference_confidence`, nullable)
- `updated_at`

## Enums

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

- uma linha por atleta;
- esta tabela deve responder rápido pelo topo do perfil;
- identidade declarada continua vindo da origem canônica, mas aqui fica a projeção pronta para leitura;
- pode ser reconstruída integralmente.
