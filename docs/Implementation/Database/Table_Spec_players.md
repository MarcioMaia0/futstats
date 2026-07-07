---
title: Table Spec players
status: Draft
version: 1.0.0
owner: Product Architecture
last_update: 2026-07-07
related_documents:
  - ../../ADR/ADR_004_Account_User_Player_Separation.md
  - ../../ADR/ADR_012_Identity_On_Supabase_Auth.md
  - ../../Domain/Players.md
  - Table_Spec_team_players.md
  - Table_Spec_users.md
---

# Table Spec players

## Objetivo

Especificar `players` — o **pool de pessoas do time**. Um mesmo registro serve como jogador, técnico ou árbitro; o papel é uma atribuição por partida, não o tipo do registro.

## Campos sugeridos

- `id` (uuid, PK)
- `user_id` (uuid, FK → `users.id`, nullable) — preenchido para pessoas que são user (global); nulo para pessoas de escopo do time
- `owner_team_id` (uuid, FK → `teams.id`, nullable) — preenchido para pessoas sem conta (escopo do time, reutilizáveis); nulo para pessoas que são user (global)
- `name` (text) — nome do registro (para não-users); para users, o nome vem do `users`
- `nickname` (text, nullable) — apelido esportivo
- `position` (text, nullable)
- `dominant_foot` (text, nullable)
- `created_at`, `updated_at`
- `deleted_at` (nullable, soft delete)

## Regras

- Pool único: o registro pode ter zero partidas e ainda ser técnico/árbitro. "Jogador/técnico/árbitro" é atribuição por partida (ver `Table_Spec_match_appearances.md` e `Table_Spec_match_referees.md`).
- Pessoa-user: `user_id` set, `owner_team_id` nulo (global). Pessoa do time: `user_id` nulo, `owner_team_id` set (escopo do time).
- Reutilização do avulso: buscar por `owner_team_id` + `name` antes de criar (evita duplicar o "Lucas").
- Claim: pessoa do time sem conta (`user_id` nulo) pode ser reivindicada por um user → `user_id` preenchido, histórico (gols, notas) preservado (ADR 004). Relação `users` ↔ `players` 1:1.
- Soft delete preserva histórico esportivo.

