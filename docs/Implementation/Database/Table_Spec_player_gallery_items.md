---
title: Table Spec player_gallery_items
status: Draft
version: 1.0.0
owner: Product Architecture
last_update: 2026-07-09
related_documents:
  - Table_Spec_posts.md
  - Table_Spec_media_assets.md
  - ../../Domain/Social.md
---

# Table Spec player_gallery_items

## Objetivo

Especificar `player_gallery_items`: itens consolidados da galeria do atleta.

## Campos sugeridos

- `id` (uuid, PK)
- `player_id` (uuid, FK -> `players.id`)
- `source_type` (enum `player_gallery_source_type`)
- `source_platform` (enum `social_platform`)
- `source_url` (text)
- `embed_url` (text, nullable)
- `embed_status` (enum `embed_status`)
- `team_id` (uuid, nullable)
- `match_id` (uuid, nullable)
- `modality` (enum `sport_modality`, nullable)
- `linked_goal_id` (uuid, nullable)
- `linked_event_id` (uuid, nullable)
- `title` (text, nullable)
- `thumbnail_url` (text, nullable)
- `published_at` (timestamptz, nullable)
- `saved_by_athlete_at` (timestamptz, nullable)
- `visibility_status` (enum `gallery_visibility_status`)
- `metadata_json` (jsonb, nullable)
- `created_at`
- `updated_at`

## Enums

- `player_gallery_source_type`
  - `TEAM_POST`
  - `MATCH_EVENT_LINKED`
  - `ATHLETE_SAVED_REFERENCE`
- `social_platform`
  - `INSTAGRAM`
  - `TIKTOK`
  - `YOUTUBE`
- `embed_status`
  - `EMBEDDABLE`
  - `LINK_ONLY`
  - `UNAVAILABLE`
- `gallery_visibility_status`
  - `VISIBLE`
  - `HIDDEN_BY_ATHLETE`
  - `UNAVAILABLE`

## Regras

- a galeria do atleta guarda referência ao conteúdo, não o vídeo bruto;
- deve suportar visão geral, por modalidade e por time;
- se a plataforma/origem deixar de permitir exibição, `embed_status` e `visibility_status` devem refletir isso.
