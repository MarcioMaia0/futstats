---
title: Table Spec follows
status: Draft
version: 1.1.0
owner: Product Architecture
last_update: 2026-07-10
related_documents:
  - Table_Spec_users.md
  - Table_Spec_user_preferences.md
  - Table_Spec_match_ratings.md
  - Table_Spec_team_members.md
  - Table_Spec_team_players.md
  - Table_Spec_user_team_roles.md
---

# Table Spec follows

## Objetivo

Especificar `follows`: relações de seguir. Base para a visibilidade `FOLLOWERS` e para a futura "nota da geral".

## Campos sugeridos

- `id` (uuid, PK)
- `follower_user_id` (uuid, FK -> `users.id`)
- `target_type` (enum `follow_target`)
- `target_id` (uuid)
- `created_at` (timestamptz, default `now()`)

## Enums

### `follow_target`

- `TEAM`
- `PLAYER`
- `USER`

## Regras

- Um torcedor pode seguir time, atleta ou usuário.
- Seguir não é ser integrante do time.
- Pertencimento interno nasce em `team_members`.
- Vínculo esportivo oficial nasce em `team_players`.
- Papel de gestão nasce em `user_team_roles`.
- Sustenta a audiência `FOLLOWERS` da visibilidade de perfil.
- Sustenta a elegibilidade futura da "nota da geral", em que só quem segue o time pode avaliar aquele lado.
- Deve existir unicidade por (`follower_user_id`, `target_type`, `target_id`).
