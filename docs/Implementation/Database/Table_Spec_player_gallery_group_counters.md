---
title: Table Spec player_gallery_group_counters
status: Draft
version: 1.0.0
owner: Product Architecture
last_update: 2026-07-09
related_documents:
  - Table_Spec_player_gallery_items.md
---

# Table Spec player_gallery_group_counters

## Objetivo

Especificar `player_gallery_group_counters`: contadores rápidos da galeria.

## Campos sugeridos

- `id` (uuid, PK)
- `player_id` (uuid, FK -> `players.id`)
- `scope_type` (enum `gallery_scope_type`)
- `modality` (enum `sport_modality`, nullable)
- `team_id` (uuid, nullable)
- `items_count` (integer, default `0`)
- `last_item_at` (timestamptz, nullable)
- `updated_at`

## Enums

- `gallery_scope_type`
  - `GENERAL`
  - `MODALITY`
  - `TEAM`

## Regras

- deve existir no máximo uma linha por contexto lógico da galeria;
- serve para abrir rápido a tela e decidir o que exibir sem contar tudo em tempo real.
