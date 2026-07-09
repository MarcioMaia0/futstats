---
title: Table Spec player_timeline_items
status: Draft
version: 1.0.0
owner: Product Architecture
last_update: 2026-07-09
related_documents:
  - Table_Spec_posts.md
  - Table_Spec_team_players.md
  - ../../API/Players_API.md
---

# Table Spec player_timeline_items

## Objetivo

Especificar `player_timeline_items`: timeline pronta do atleta.

## Campos sugeridos

- `id` (uuid, PK)
- `player_id` (uuid, FK -> `players.id`)
- `timeline_type` (enum `player_timeline_type`)
- `occurred_at` (timestamptz)
- `team_id` (uuid, nullable)
- `match_id` (uuid, nullable)
- `post_id` (uuid, nullable)
- `source_event_id` (uuid, nullable)
- `source_table` (text, nullable)
- `summary_title` (text)
- `summary_subtitle` (text, nullable)
- `payload_json` (jsonb, nullable)
- `is_visible` (boolean, default `true`)
- `created_at`
- `updated_at`

## Enums

- `player_timeline_type`
  - `TEAM_JOINED`
  - `PLAYER_WELCOME_POST`
  - `MATCH_APPEARANCE`
  - `PROFILE_CLAIMED`

## Regras

- a timeline é cronológica reversa;
- cada item deve ser renderizável sem joins pesados no request do perfil;
- pode ser reconstruída.
