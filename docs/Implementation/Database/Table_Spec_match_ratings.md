---
title: Table Spec match_ratings
status: Draft
version: 1.0.0
owner: Product Architecture
last_update: 2026-07-07
related_documents:
  - Table_Spec_match_appearances.md
  - Table_Spec_follows.md
  - Table_Spec_referee_reviews.md
---

# Table Spec match_ratings

## Objetivo

Especificar `match_ratings` — notas dos participantes de uma partida (jogadores e técnico). Duas populações separadas: companheiros (peer) e torcida (geral).

## Campos sugeridos

- `id` (uuid, PK)
- `match_id` (uuid, FK → `matches.id`)
- `rater_user_id` (uuid, FK → `users.id`)
- `target_type` (enum `rating_target`)
- `target_player_id` (uuid, FK → `players.id`) — pessoa avaliada
- `rating_type` (enum `rating_type`)
- `score` (numérico)
- `created_at`

## Enums

- `rating_type`: `PEER | GENERAL`
- `rating_target`: `PLAYER | COACH`

## Regras

- `PEER`: avaliador é user que participou da partida (`match_appearances`). `GENERAL` ("nota da geral"): avaliador é user que segue o time (`follows`).
- As médias `PEER` e `GENERAL` são exibidas e agregadas separadamente — nunca misturadas.
- 1 nota por avaliador, por alvo, por partida; apenas após a partida.
- A "nota da geral" avalia o **lado do time que o avaliador segue**; seguidor dos dois times avalia cada lado entrando no evento de cada time.
- Árbitro NÃO é avaliado aqui — ver `referee_reviews`.

