---
title: Table Spec teams
status: Draft
version: 0.9.0
owner: Product Architecture
last_update: 2026-07-06
---

# Table Spec teams

## Objetivo

Especificar tabela `teams`.

## Finalidade

Representar times.

## Campos sugeridos

- `id`
- `name`
- `slug`
- `crest_url`
- `primary_color`
- `secondary_color`
- `accent_color`
- `default_modality` (enum: `FUTSAL`, `SOCIETY`, `FIELD`; padrão `FUTSAL`)
- `default_coach_player_id` (uuid, FK → `players.id`, nullable) — técnico default do time; pode ser trocado por partida na escalação; default por quadro é evolução futura
- `created_by_user_id`
- `created_at`
- `updated_at`

## Regras

- Nome é obrigatório.
- Cores são opcionais.
- Histórico pertence ao team.


