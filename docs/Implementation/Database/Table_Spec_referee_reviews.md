---
title: Table Spec referee_reviews
status: Draft
version: 1.0.0
owner: Product Architecture
last_update: 2026-07-07
related_documents:
  - Table_Spec_match_referees.md
  - ../../Domain/Referees.md
---

# Table Spec referee_reviews

## Objetivo

Especificar `referee_reviews` — avaliações da arbitragem, com peso por papel do avaliador.

## Campos sugeridos

- `id` (uuid, PK)
- `match_id` (uuid, FK → `matches.id`)
- `referee_id` (uuid, FK → `referees.id`) — árbitro profissional cadastrado
- `rater_user_id` (uuid, FK → `users.id`)
- `rater_role` (enum `referee_rater_role`)
- `score` (numérico)
- `counts_for_competence` (boolean) — derivado do papel
- `description` (text, nullable) — justificativa opcional
- `created_at`

## Enums

- `referee_rater_role`: `DIRECTOR | COACH | PLAYER | FAN`

## Regras

- Notas de `PLAYER` e `FAN` entram só como **resenha** (não afetam a competência).
- Notas de `DIRECTOR` e `COACH` (fixos ou avulsos) contam para a **pontuação de competência** (`counts_for_competence = true`); `description` é o espaço para justificar.
- Só árbitro profissional (cadastrado) tem competência; árbitro ad-hoc/externo (ver `match_referees`) só gera resenha.
- 1 avaliação por avaliador, por partida.

