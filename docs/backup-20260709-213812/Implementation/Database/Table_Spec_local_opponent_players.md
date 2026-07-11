---
title: Table Spec local_opponent_players
status: Draft
version: 1.0.0
owner: Product Architecture
last_update: 2026-07-09
related_documents:
  - Table_Spec_local_opponents.md
  - ../../Domain/Teams.md
  - ../../Domain/Matches.md
---

# Table Spec local_opponent_players

## Objetivo

Especificar `local_opponent_players`: jogadores adversarios privados cadastrados por um time para um adversario local.

## Finalidade

Permitir memoria privada sobre jogadores de um adversario, mesmo quando esse adversario ou esses atletas nao fazem parte oficialmente do app.

## Campos sugeridos

- `id` (uuid, PK)
- `team_id` (uuid, FK -> `teams.id`)
- `local_opponent_id` (uuid, FK -> `local_opponents.id`)
- `shirt_number` (integer, not null)
- `display_name` (text, nullable)
- `photo_media_asset_id` (uuid, FK -> `media_assets.id`, nullable)
- `notes` (text, nullable)
- `created_at`
- `updated_at`

## Regras

- o registro pertence ao time que cadastrou o adversario.
- o minimo obrigatorio e `shirt_number`.
- `display_name` e `photo_media_asset_id` sao opcionais.
- `notes` sao privadas do time.
- o registro nao cria `person` nem `player` global.
- quando o mesmo adversario voltar a jogar, o sistema pode sugerir reutilizacao desses jogadores.

## Unicidade

- deve existir no maximo um registro por `team_id + local_opponent_id + shirt_number`.
