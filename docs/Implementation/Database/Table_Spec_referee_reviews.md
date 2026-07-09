---
title: Table Spec referee_reviews
status: Draft
version: 1.0.1
owner: Product Architecture
last_update: 2026-07-07
related_documents:
  - Table_Spec_match_referees.md
  - ../../Domain/Referees.md
---

# Table Spec referee_reviews

## Objetivo

Especificar `referee_reviews`: avaliações da arbitragem, com peso por papel do avaliador.

## Campos sugeridos

- `id` (uuid, PK)
- `match_id` (uuid, FK -> `matches.id`)
- `referee_id` (uuid, FK -> `referees.id`) - árbitro profissional cadastrado
- `rater_user_id` (uuid, FK -> `users.id`)
- `rater_role` (enum `referee_rater_role`)
- `score` (numérico)
- `counts_for_competence` (boolean) - derivado do papel
- `description` (text, nullable) - justificativa opcional
- `created_at`

## Enums

- `referee_rater_role`: `DIRECTOR | PRESIDENT | COACH | PLAYER | FAN`

## Regras

- Notas de `PLAYER` e `FAN` entram só como resenha e não afetam a competência.
- Notas de `DIRECTOR`, `PRESIDENT` e `COACH`, fixos ou avulsos, contam para a pontuação de competência (`counts_for_competence = true`).
- `PRESIDENT` tem o mesmo peso operacional de `DIRECTOR`; a diferença é apenas de nomenclatura de gestão.
- `description` é o espaço para justificar a avaliação.
- Só árbitro profissional, cadastrado, tem competência consolidada; árbitro ad-hoc ou externo em `match_referees` gera apenas resenha.
- Uma avaliação por avaliador, por partida.
