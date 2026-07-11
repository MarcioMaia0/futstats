---
title: Table Spec themes
status: Draft
version: 1.0.0
owner: Product Architecture
last_update: 2026-07-07
related_documents:
  - Table_Spec_user_preferences.md
  - Table_Spec_team_settings.md
  - ../../Domain/Experience.md
---

# Table Spec themes

## Objetivo

Especificar a tabela `themes`, usada para armazenar temas visuais reutilizaveis do app e de times.

## Finalidade

Representar definicoes de tema que podem ser selecionadas pela pessoa ou aplicadas como padrao de um time.

## Campos sugeridos

- `id` (uuid, PK)
- `scope` (enum `theme_scope`)
- `team_id` (uuid, FK -> `teams.id`, nullable)
- `key` (text, unico por escopo)
- `name` (text)
- `primary_color` (text)
- `secondary_color` (text, nullable)
- `accent_color` (text, nullable)
- `background_color` (text, nullable)
- `surface_color` (text, nullable)
- `text_color` (text, nullable)
- `is_default` (boolean, default `false`)
- `is_active` (boolean, default `true`)
- `created_at`
- `updated_at`

## Enums

- `theme_scope`: `SYSTEM | TEAM`

## Regras

- Temas `SYSTEM` nao possuem `team_id`.
- Temas `TEAM` exigem `team_id`.
- `key` deve ser canonica e tecnica, por exemplo: `light`, `dark`, `team-default`.
- O estado atual do produto deve garantir pelo menos dois temas `SYSTEM`: claro e escuro.
- O tema selecionado em `user_preferences.preferred_theme_id` deve sempre referenciar um tema ativo.
- Um time pode ter varios temas `TEAM`, mas apenas um `is_default = true`.
- Cores devem ser persistidas em formato estavel para o frontend, por exemplo hex.
