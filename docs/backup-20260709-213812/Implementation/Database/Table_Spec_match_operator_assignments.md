---
title: Table Spec match_operator_assignments
status: Draft
version: 1.0.0
owner: Product Architecture
last_update: 2026-07-09
related_documents:
  - Table_Spec_matches.md
  - ../../Domain/Matches.md
---

# Table Spec match_operator_assignments

## Objetivo

Especificar `match_operator_assignments`: responsabilidades operacionais atribuidas a usuarios durante a partida.

## Campos sugeridos

- `id` (uuid, PK)
- `match_id` (uuid, FK -> `matches.id`)
- `user_id` (uuid, FK -> `users.id`)
- `scope` (enum `match_operator_scope`)
- `frame_type` (enum `frame_type`, nullable)
- `is_exclusive` (boolean, default `true`)
- `created_by_user_id` (uuid, FK -> `users.id`)
- `created_at`
- `updated_at`

## Enums

- `match_operator_scope`
  - `CLOCK`
  - `SCOREBOARD`
  - `LINEUP`
  - `SUBSTITUTION`
  - `SHOT_EVENTS`
  - `PASS_EVENTS`
  - `FOUL_EVENTS`
  - `DEFENSIVE_EVENTS`
  - `FULL_REVIEW`

## Regras

- o operador de `CLOCK` controla `play`, `pause`, `resume` e `stop`.
- escopos podem ser exclusivos ou compartilhados.
- `FULL_REVIEW` ganha acesso amplo na revisao por video, respeitando permissao geral do usuario.
- o sistema deve validar escopo no backend, nao apenas na UI.
