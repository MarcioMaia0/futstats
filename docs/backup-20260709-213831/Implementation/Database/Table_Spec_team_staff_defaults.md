---
title: Table Spec team_staff_defaults
status: Draft
version: 1.0.0
owner: Product Architecture
last_update: 2026-07-09
related_documents:
  - Table_Spec_teams.md
  - Table_Spec_matches.md
  - ../../Domain/Matches.md
---

# Table Spec team_staff_defaults

## Objetivo

Especificar `team_staff_defaults`: pessoas de staff padrão configuradas para o time.

## Finalidade

Permitir que o time tenha pessoas previamente cadastradas para funções como técnico padrão, facilitando a criação da partida.

No MVP, o foco principal é:

- técnico padrão por modalidade.

## Campos sugeridos

- `id` (uuid, PK)
- `team_id` (uuid, FK -> `teams.id`)
- `person_id` (uuid, FK -> `persons.id`)
- `staff_role` (enum `staff_role`)
- `modality` (enum `sport_modality`)
- `is_default` (boolean, default `true`)
- `created_at`
- `updated_at`

## Enums

- `staff_role`
  - `HEAD_COACH`

## Regras

- Tudo aponta para `person_id`, não para `user_id` ou `player_id`.
- O time pode ter staff padrão sem depender de a pessoa ter conta no app.
- No MVP, `HEAD_COACH` é o único papel obrigatório neste recorte.
- A partida pode herdar esse técnico padrão no momento da criação.
- O técnico herdado pode ser trocado na escalação da partida.
- O histórico oficial da partida não deve depender desta tabela; depende de `match_staff`.

## Unicidade

- No MVP, deve existir no máximo um `HEAD_COACH` com `is_default = true` por `team_id + modality`.

