---
title: Table Spec player_match_statistics
status: Draft
version: 1.1.0
owner: Product Architecture
last_update: 2026-07-09
related_documents:
  - Table_Spec_match_players.md
  - Table_Spec_match_goals.md
  - Table_Spec_match_events.md
  - ../../Architecture/Player_Profile_Read_Model_Strategy.md
---

# Table Spec player_match_statistics

## Objetivo

Especificar `player_match_statistics`: projeção por atleta por partida.

## Finalidade

Registrar a visão do jogo sob a ótica do atleta.

Esta tabela existe para:

- alimentar timeline de desempenho;
- alimentar gráficos temporais;
- servir como base relacional limpa para agregações por modalidade e por time;
- evitar que o perfil do atleta reconstrua cada partida via múltiplos joins pesados.

## Regra principal

Uma linha por:

- `player_id`
- `match_id`
- `team_id`
- `frame_type`

A modalidade vem de `matches.modality`.

## Campos sugeridos

- `id` (uuid, PK)
- `player_id` (uuid, FK -> `players.id`)
- `match_id` (uuid, FK -> `matches.id`)
- `team_id` (uuid, FK -> `teams.id`)
- `frame_type` (enum `frame_type`)
- `modality` (enum `sport_modality`)
- `match_date` (timestamptz)
- `opponent_team_id` (uuid, nullable)
- `opponent_name` (text)
- `is_starter` (boolean)
- `is_team_player` (boolean)
- `minutes_played` (integer, nullable)
- `goals_scored` (integer, default `0`)
- `recorded_assists` (integer, default `0`)
- `own_goals` (integer, default `0`)
- `tackles` (integer, default `0`)
- `interceptions` (integer, default `0`)
- `blocks` (integer, default `0`)
- `shots` (integer, default `0`)
- `shots_on_target` (integer, default `0`)
- `saves` (integer, default `0`)
- `goals_conceded_as_goalkeeper` (integer, default `0`)
- `primary_position_code` (text, nullable)
- `positions_json` (jsonb, nullable)
- `result` (enum `match_result`, nullable)
- `source_version` (integer, default `1`)
- `created_at`
- `updated_at`

## Enums

- `match_result`
  - `WIN`
  - `DRAW`
  - `LOSS`

## Regras

- deve existir no máximo uma linha por `player_id + match_id + team_id + frame_type`;
- esta tabela não substitui `match_players`, `match_goals` ou `match_events`;
- ela é projeção reconstruível;
- métricas do atleta devem ser separadas por quadro;
- se o atleta atuar em mais de um quadro do mesmo compromisso esportivo, devem existir múltiplas linhas nesta tabela;
- `recorded_assists` deve refletir apenas assistências explicitamente registradas;
- `minutes_played` só deve ser preenchido quando houver base factual suficiente;
- `positions_json` pode guardar múltiplas posições exercidas no jogo quando a camada operacional suportar isso com segurança;
- se a partida for corrigida ou cancelada, a linha deve ser atualizada ou reprocessada.
