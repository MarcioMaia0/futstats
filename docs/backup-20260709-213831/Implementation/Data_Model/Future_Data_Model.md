---
title: Future Data Model
status: Review
version: 1.3.0
owner: Product Architecture
last_update: 2026-07-09
related_documents: []
---

# Future Data Model

## Objetivo

Preparar evolucao para recursos avancados sem bloquear o MVP.

## Entidades futuras

- `venues`
- `local_opponents`
- `local_opponent_players`
- `scheduled_matches`
- `live_match_updates`
- `match_events`
- `match_players`
- `match_opponent_players`
- `match_players_positions`
- `match_operator_assignments`
- `team_player_frame_defaults`
- `team_staff_defaults`
- `match_staff`
- `match_attendance_responses`
- `match_substitutions`
- `referees`
- `referee_reviews`
- `statistics_snapshots`
- `player_match_statistics`
- `player_profile_summary`
- `player_statistics_summary`
- `player_statistics_by_modality`
- `player_statistics_by_team_modality`
- `player_timeline_items`
- `player_gallery_items`
- `player_gallery_group_counters`
- `player_performance_series`
- `player_style_inference`
- `ui_vocabulary`
- `themes`
- `media_assets`
- `notifications`

## Estrategia

Criar schema modular. Nao adicionar complexidade no fluxo inicial antes da necessidade real.

## Observacao

- contratos como `clock_heartbeat`, `clock_sync_state`, `offline_event_queue` e `blind_window` pertencem a camada operacional de sincronizacao;
- eles nao precisam nascer como tabelas canonicas do banco principal;
- o banco principal deve priorizar a persistencia do resultado consolidado dos eventos e da linha do tempo oficial da partida.
