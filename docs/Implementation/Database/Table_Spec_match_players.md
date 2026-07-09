---
title: Table Spec match_players
status: Draft
version: 1.0.0
owner: Product Architecture
last_update: 2026-07-09
related_documents:
  - Table_Spec_matches.md
  - Table_Spec_team_players.md
  - Table_Spec_players.md
  - Table_Spec_match_players_positions.md
---

# Table Spec match_players

## Objetivo

Especificar `match_players`: atletas relacionados por time em uma partida específica.

## Finalidade

Representar quem foi relacionado para o jogo, seja:

- atleta fixo do time;
- atleta avulso daquela partida.

Esta tabela não representa:

- vínculo oficial com o time;
- confirmação de presença;
- substituições;
- eventos táticos finos.

## Campos sugeridos

- `id` (uuid, PK)
- `match_id` (uuid, FK -> `matches.id`)
- `team_id` (uuid, FK -> `teams.id`)
- `player_id` (uuid, FK -> `players.id`)
- `shirt_number` (integer, nullable)
- `is_starter` (boolean, default `false`)
- `is_team_player` (boolean, default `true`)
- `created_at`
- `updated_at`

## Regras

- Cada linha representa um atleta relacionado para uma partida por um time específico.
- `is_team_player = true`
  - atleta fixo/oficial do time.
- `is_team_player = false`
  - atleta avulso daquela partida.
- `is_starter = true`
  - titular.
- `is_starter = false`
  - reserva.
- Se não existir linha em `match_players`, o atleta não foi relacionado para aquela partida.
- A modalidade da atuação não fica nesta tabela; ela vem de `matches.modality`.
- As posições daquela partida ficam em `match_players_positions`.
- Se `is_team_player = true`, o backend deve conseguir validar vínculo oficial por `team_players`.
- Se `is_team_player = false`, não deve exigir `team_players`.

## Unicidade e integridade

- Deve existir no máximo um registro por `match_id + team_id + player_id`.
- `shirt_number` não deve duplicar dentro do mesmo `match_id + team_id`, salvo regra futura explícita.

