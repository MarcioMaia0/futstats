---
title: Privacy Model
status: Draft
version: 0.9.0
owner: Product Architecture
last_update: 2026-07-06
---

# Privacy Model


## Objetivo

Definir privacidade inicial.

## Regras

1. Usuário controla perfil público.
2. Time controla exposição de jogos.
3. Comentários podem ser denunciados.
4. Dados sensíveis não devem aparecer em links públicos.
5. Crianças e menores exigem cuidado futuro específico.

## Visibilidade de perfil

O usuário controla quem vê seu perfil via `user_preferences.profile_visibility` (default `PUBLIC`):

- `PUBLIC`: qualquer pessoa, inclusive torcedor sem registro.
- `FOLLOWERS`: apenas quem o segue.
- `TEAM_MEMBERS`: apenas quem compartilha ao menos um time com ele.

## Exibição de nome por audiência

Independente da visibilidade, o usuário escolhe qual nome cada audiência vê (`name_display` = `NAME | NICKNAME | BOTH`), via `name_display_public`, `name_display_followers` e `name_display_team`. Precedência do mais específico ao mais amplo: `TEAM_MEMBERS` → `FOLLOWERS` → `PUBLIC`. Se o apelido for nulo, cai para o nome. Ver `Implementation/Database/Table_Spec_user_preferences.md`.
