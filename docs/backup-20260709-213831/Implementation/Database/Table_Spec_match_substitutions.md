---
title: Table Spec match_substitutions
status: Draft
version: 1.1.0
owner: Product Architecture
last_update: 2026-07-09
related_documents:
  - Table_Spec_match_players.md
  - Table_Spec_match_opponent_players.md
  - Table_Spec_match_events.md
  - ../../Domain/Matches.md
---

# Table Spec match_substitutions

## Objetivo

Especificar `match_substitutions`: trocas detalhadas de atores durante a partida.

## Finalidade

Registrar quem entrou no lugar de quem e em qual momento, abrindo caminho para:

- prancheta eletronica;
- leitura temporal de quem estava em quadra;
- analises futuras de posicao efetiva no lance.

## Campos sugeridos

- `id` (uuid, PK)
- `match_id` (uuid, FK -> `matches.id`)
- `participant_side` (enum `participant_side`)
- `team_id` (uuid, FK -> `teams.id`, nullable)
- `local_opponent_id` (uuid, FK -> `local_opponents.id`, nullable)
- `player_in_match_player_id` (uuid, FK -> `match_players.id`, nullable)
- `player_out_match_player_id` (uuid, FK -> `match_players.id`, nullable)
- `opponent_player_in_match_opponent_player_id` (uuid, FK -> `match_opponent_players.id`, nullable)
- `opponent_player_out_match_opponent_player_id` (uuid, FK -> `match_opponent_players.id`, nullable)
- `clock_second` (integer, nullable)
- `created_at`

## Regras

- Cada linha representa uma substituicao explicita.
- `participant_side = HOME`
  - usa `player_in_match_player_id` e `player_out_match_player_id`.
- `participant_side = OPPONENT`
  - usa `opponent_player_in_match_opponent_player_id` e `opponent_player_out_match_opponent_player_id`.
- entradas e saidas devem pertencer ao mesmo `match_id`.
- a substituicao nao altera o fato de ambos ja estarem relacionados.
- esta tabela nao substitui eventos de gol, cartao ou scout.
- ela representa a dinamica de troca de atores durante o jogo.

## Enums

- `participant_side`
  - `HOME`
  - `OPPONENT`
