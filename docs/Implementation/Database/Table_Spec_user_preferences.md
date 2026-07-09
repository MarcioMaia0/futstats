---
title: Table Spec user_preferences
status: Draft
version: 1.0.1
owner: Product Architecture
last_update: 2026-07-07
related_documents:
  - Table_Spec_users.md
  - ../../ADR/ADR_012_Identity_On_Supabase_Auth.md
  - ../../ADR/ADR_005_UI_Language_Modes.md
  - ../../API/Identity_API.md
  - ../../Security/Privacy_Model.md
---

# Table Spec user_preferences

## Objetivo

Especificar tabela `user_preferences`: preferências de app e privacidade da pessoa. Relação 1:1 com `users`.

## Campos sugeridos

- `user_id` (uuid, PK, FK -> `users.id`)
- `preferred_language_mode` (enum `language_mode`; default pelo locale do dispositivo)
- `preferred_theme_id` (FK -> `themes`, nullable)
- `profile_visibility` (enum `profile_visibility`; default `PUBLIC`)
- `name_display_public` (enum `name_display`; default `NAME`)
- `name_display_followers` (enum `name_display`; default `NAME`)
- `name_display_team` (enum `name_display`; default `NICKNAME`)
- `region_prompt_dismissed_at` (timestamptz, nullable) - usuário optou por não ser perguntado sobre região
- `created_at`
- `updated_at`

## Enums

- `profile_visibility`: `PUBLIC | FOLLOWERS | TEAM_MEMBERS`
- `name_display`: `NAME | NICKNAME | BOTH`

## Regras

- Registro criado com defaults no cadastro.
- `profile_visibility` default `PUBLIC` (perfil aberto a todos).
- `profile_visibility` controla o acesso ao perfil, aplicado via RLS.
- `name_display_*` controla a apresentação do nome dentro da audiência permitida.
- Audiências de `profile_visibility`:
  - `PUBLIC`: qualquer pessoa, inclusive torcedor sem registro.
  - `FOLLOWERS`: quem segue o usuário.
  - `TEAM_MEMBERS`: quem compartilha ao menos um time com o dono do perfil.
- Precedência ao resolver qual nome exibir a um viewer: `TEAM_MEMBERS` -> `FOLLOWERS` -> `PUBLIC`.
- Se um `name_display_*` indicar `NICKNAME` ou `BOTH` mas `users.nickname` for nulo, cai para `NAME`.
- Atualizações via API devem permitir patch parcial: a pessoa altera apenas os campos enviados em `PATCH /api/v1/me/preferences`.

## Resolução de nome

- `profile_visibility` (acesso) é aplicado no banco via RLS.
- O rótulo de nome (`name_display_*`) é resolvido no banco, por uma função ou view em SQL padrão, por exemplo `resolve_display_name(viewer_id, profile_id)`, em lote e deduplicada por autor.
- O cliente apenas formata `BOTH` para apresentação visual.
- A função recebe `viewer_id` como parâmetro e usa apenas SQL padrão, sem helpers específicos do Supabase dentro da lógica.
- O acoplamento ao provedor para obter o id do usuário atual fica na borda, em RLS ou API.
- Apenas o rótulo permitido ao viewer trafega no payload; o nome oculto não sai do banco.
