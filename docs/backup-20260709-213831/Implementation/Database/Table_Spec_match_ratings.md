---
title: Table Spec match_ratings
status: Draft
version: 1.1.0
owner: Product Architecture
last_update: 2026-07-09
related_documents:
  - Table_Spec_match_players.md
  - Table_Spec_match_staff.md
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

- `PEER`
  - avaliador é user ligado a um `player` que foi relacionado para a partida em `match_players`.
- `GENERAL` ("nota da geral")
  - avaliador é user que segue o time (`follows`).
- As médias `PEER` e `GENERAL` são exibidas e agregadas separadamente — nunca misturadas.
- 1 nota por avaliador, por alvo, por partida; apenas após a partida.
- Como a atuação factual pode ser separada por quadro, futuras evoluções podem decidir se a nota será:
  - por compromisso completo;
  - ou por quadro específico.
- A "nota da geral" avalia o **lado do time que o avaliador segue**; seguidor dos dois times avalia cada lado entrando no evento de cada time.
- Quando o alvo for técnico, o backend deve resolver o técnico efetivo da partida a partir de `match_staff`.
- Árbitro NÃO é avaliado aqui — ver `referee_reviews`.
