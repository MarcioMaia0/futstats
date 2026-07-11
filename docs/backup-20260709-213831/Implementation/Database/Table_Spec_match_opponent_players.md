---
title: Table Spec match_opponent_players
status: Draft
version: 1.0.0
owner: Product Architecture
last_update: 2026-07-09
related_documents:
  - Table_Spec_matches.md
  - Table_Spec_local_opponent_players.md
  - ../../Domain/Matches.md
---

# Table Spec match_opponent_players

## Objetivo

Especificar `match_opponent_players`: participantes adversarios relacionados em uma partida especifica.

## Finalidade

Representar os jogadores do lado adversario dentro da operacao daquela partida.

## Campos sugeridos

- `id` (uuid, PK)
- `match_id` (uuid, FK -> `matches.id`)
- `local_opponent_id` (uuid, FK -> `local_opponents.id`, nullable)
- `local_opponent_player_id` (uuid, FK -> `local_opponent_players.id`, nullable)
- `shirt_number` (integer, not null)
- `display_name_snapshot` (text, nullable)
- `photo_media_asset_id` (uuid, FK -> `media_assets.id`, nullable)
- `is_starter` (boolean, default `false`)
- `created_at`
- `updated_at`

## Regras

- a tabela representa o lado adversario daquela `match`.
- o registro pode nascer:
  - vinculado a `local_opponent_player_id`;
  - ou apenas com `shirt_number` e snapshot minimo.
- isso permite operacao mesmo quando o adversario nao foi preparado antes do jogo.
- `is_starter = true`
  - adversario que comecou jogando.
- `is_starter = false`
  - banco ou reposicao posterior.

## Unicidade

- deve existir no maximo um registro por `match_id + shirt_number`.
