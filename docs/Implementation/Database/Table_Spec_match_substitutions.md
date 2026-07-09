---
title: Table Spec match_substitutions
status: Draft
version: 1.0.0
owner: Product Architecture
last_update: 2026-07-09
related_documents:
  - Table_Spec_match_players.md
  - Table_Spec_match_events.md
  - ../../Domain/Matches.md
---

# Table Spec match_substitutions

## Objetivo

Especificar `match_substitutions`: trocas detalhadas de atletas durante a partida.

## Finalidade

Registrar quem entrou no lugar de quem e em qual momento, abrindo caminho para:

- prancheta eletrônica;
- leitura temporal de quem estava em quadra;
- análises futuras de posição efetiva no lance.

## Campos sugeridos

- `id` (uuid, PK)
- `match_id` (uuid, FK -> `matches.id`)
- `team_id` (uuid, FK -> `teams.id`)
- `player_in_match_player_id` (uuid, FK -> `match_players.id`)
- `player_out_match_player_id` (uuid, FK -> `match_players.id`)
- `minute` (integer, nullable)
- `second` (integer, nullable)
- `created_at`

## Regras

- Cada linha representa uma substituição explícita.
- `player_in_match_player_id` e `player_out_match_player_id` devem pertencer ao mesmo `match_id` e `team_id`.
- A substituição não altera o fato de ambos já estarem relacionados em `match_players`.
- Esta tabela não substitui eventos de gol, cartão ou scout.
- Ela representa a dinâmica de troca de atletas durante o jogo.

