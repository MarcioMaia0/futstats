---
title: Table Spec follows
status: Draft
version: 1.0.0
owner: Product Architecture
last_update: 2026-07-07
related_documents:
  - Table_Spec_users.md
  - Table_Spec_user_preferences.md
  - Table_Spec_match_ratings.md
---

# Table Spec follows

## Objetivo

Especificar `follows` — relações de seguir. Base para a visibilidade `FOLLOWERS` e para a "nota da geral".

## Campos sugeridos

- `id` (uuid, PK)
- `follower_user_id` (uuid, FK → `users.id`)
- `target_type` (enum `follow_target`)
- `target_id` (uuid) — id do alvo conforme `target_type`
- `created_at`

## Enums

- `follow_target`: `TEAM | PLAYER | USER`

## Regras

- Um torcedor segue o time (ou player/user); seguir NÃO é ser integrante do time (isso é `user_team_roles`/elenco).
- Sustenta: audiência `FOLLOWERS` da visibilidade de perfil, e elegibilidade da "nota da geral" (só quem segue o time avalia aquele lado).
- Único por (`follower_user_id`, `target_type`, `target_id`).

