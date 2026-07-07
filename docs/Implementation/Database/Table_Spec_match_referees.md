---
title: Table Spec match_referees
status: Draft
version: 1.0.0
owner: Product Architecture
last_update: 2026-07-07
related_documents:
  - Table_Spec_matches.md
  - Table_Spec_referee_reviews.md
  - Table_Spec_players.md
---

# Table Spec match_referees

## Objetivo

Especificar `match_referees` — a arbitragem de uma partida. Segue a mesma lógica de atribuição por partida do técnico.

## Campos sugeridos

- `id` (uuid, PK)
- `match_id` (uuid, FK → `matches.id`)
- `referee_id` (uuid, FK → `referees.id`, nullable) — árbitro profissional cadastrado
- `referee_person_id` (uuid, FK → `players.id`, nullable) — árbitro ad-hoc do pool de pessoas
- `external` (boolean, default false)
- `created_at`

## Regras

- Aponta o árbitro da partida: profissional cadastrado (`referee_id`) ou ad-hoc do pool (`referee_person_id`).
- `external = true` quando o adversário não é user do app e a arbitragem é responsabilidade dele — não se aponta pessoa, apenas registra a notação de arbitragem externa/não identificada.
- Avaliações da arbitragem vivem em `referee_reviews` (com peso por papel do avaliador).

