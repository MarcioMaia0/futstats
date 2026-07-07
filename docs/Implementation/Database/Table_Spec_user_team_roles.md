---
title: Table Spec user_team_roles
status: Draft
version: 1.0.0
owner: Product Architecture
last_update: 2026-07-07
related_documents:
  - Table_Spec_players.md
  - Table_Spec_team_players.md
  - Table_Spec_team_blocks.md
---

# Table Spec user_team_roles

## Objetivo

Especificar `user_team_roles` — papéis de gestão de um usuário em um time.

## Campos sugeridos

- `id` (uuid, PK)
- `user_id` (uuid, FK → `users.id`)
- `team_id` (uuid, FK → `teams.id`)
- `role` (enum `team_role`)
- `created_at`

## Enums

- `team_role`: `DIRECTOR` (demais papéis de gestão no futuro). MVP usa enum; uma tabela `roles` fica como evolução se surgirem papéis customizáveis.

## Regras

- Papel = permissão de gestão. "Ser jogador" NÃO é papel — é ter um `player` no elenco/partida.
- Múltiplas linhas por (`user_id`, `team_id`) permitidas (ex.: pessoa que é diretor e também joga tem papel `DIRECTOR` aqui e um `player` ligado no elenco).
- Integrante do time (audiência `TEAM_MEMBERS` da visibilidade) = tem linha aqui OU é `player` ligado a user no elenco do time. Torcedor (só `follows`) não é integrante.
- Só `DIRECTOR` modera o time; diretor não bloqueia outro diretor (ver `team_blocks`).

