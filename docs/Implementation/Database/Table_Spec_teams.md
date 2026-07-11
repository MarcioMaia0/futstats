---
title: Table Spec teams
status: Draft
version: 1.3.0
owner: Product Architecture
last_update: 2026-07-10
related_documents:
  - ../../API/Teams_API.md
  - Table_Spec_user_team_roles.md
  - Table_Spec_venues.md
---

# Table Spec teams

## Objetivo

Especificar tabela `teams`.

## Finalidade

Representar times e sua identidade básica.

## Campos sugeridos

- `id` (uuid, PK)
- `name` (text, obrigatório)
- `slug` (text, único)
- `crest_url` (text, nullable)
- `first_color` (text, nullable)
- `second_color` (text, nullable)
- `third_color` (text, nullable)
- `home_match_capability` (enum `home_match_capability`, default `NOT_DEFINED_YET`)
- `region_state` (text, nullable)
- `region_city` (text, nullable)
- `region_zone` (text, nullable)
- `primary_venue_id` (uuid, FK -> `venues.id`, nullable)
- `created_by_user_id` (uuid, FK -> `users.id`)
- `created_at`
- `updated_at`

## Enums

- `home_match_capability`
  - `HAS_HOME_VENUE`
  - `NO_HOME_VENUE`
  - `NOT_DEFINED_YET`

## Regras

- `name` é obrigatório.
- `slug` é técnico e derivado; não deve ser digitado pela pessoa no wizard.
- `crest_url` é opcional.
- `first_color`, `second_color` e `third_color` representam as cores oficiais do time.
- as cores oficiais são opcionais.
- esse modelo conversa melhor com a linguagem real da várzea do que `primary/secondary/accent`.
- times podem ter duas ou três cores oficiais.
- quando não preenchidas, as cores podem permanecer `null`.
- a ordem oficial das cores do time não deve ser distorcida por necessidade de layout da interface.
- `teams` não deve limitar o time a uma única modalidade operacional.
- as modalidades preferenciais do time devem ser persistidas em estrutura própria de associação, e não em uma única coluna singular em `teams`.
- `home_match_capability` representa a capacidade estrutural do time de mandar jogos, e não o papel do time em uma partida específica.
- `primary_venue_id` é opcional.
- técnico padrão do time não deve ser persistido em `teams`; esse contrato pertence a `team_staff_defaults`, apontando para `person_id`.
- `created_by_user_id` registra quem concluiu a criação.
- histórico pertence ao time.
- o time só deve ser persistido ao final do wizard, nunca em etapas intermediárias.
