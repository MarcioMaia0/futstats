---
title: Player Profile Read Model Service
status: Draft
version: 1.0.0
owner: Product Architecture
last_update: 2026-07-09
related_documents:
  - ../Database/Table_Spec_player_match_statistics.md
  - ../Database/Table_Spec_player_profile_summary.md
  - ../Database/Table_Spec_player_statistics_summary.md
  - ../Database/Table_Spec_player_statistics_by_modality.md
  - ../Database/Table_Spec_player_statistics_by_team_modality.md
  - ../Database/Table_Spec_player_timeline_items.md
  - ../Database/Table_Spec_player_gallery_items.md
  - ../Database/Table_Spec_player_performance_series.md
  - ../Database/Table_Spec_player_style_inference.md
---

# Player Profile Read Model Service

## Objetivo

Definir o serviço de projeção e reconstrução do perfil do atleta.

## Responsabilidades

- projetar visão geral do perfil;
- projetar estatísticas agregadas;
- projetar timeline;
- projetar galeria;
- projetar séries temporais;
- projetar inferência de estilo;
- oferecer rebuild total ou parcial por atleta/contexto.

## Métodos conceituais

### `rebuildPlayerProfileSummary(playerId)`

Atualiza:

- `player_profile_summary`

### `upsertPlayerMatchStatistics(matchId, playerId, teamId)`

Atualiza:

- `player_match_statistics`

### `rebuildPlayerStatisticsSummary(playerId)`

Atualiza:

- `player_statistics_summary`

### `rebuildPlayerStatisticsByModality(playerId, modality)`

Atualiza:

- `player_statistics_by_modality`

### `rebuildPlayerStatisticsByTeamModality(playerId, teamId, modality)`

Atualiza:

- `player_statistics_by_team_modality`

### `appendPlayerTimelineItem(playerId, timelineType, payload)`

Atualiza:

- `player_timeline_items`

### `upsertPlayerGalleryItem(playerId, sourceRef)`

Atualiza:

- `player_gallery_items`
- `player_gallery_group_counters`

### `rebuildPlayerPerformanceSeries(playerId, scope)`

Atualiza:

- `player_performance_series`

### `rebuildPlayerStyleInference(playerId, scope)`

Atualiza:

- `player_style_inference`
- `player_profile_summary` quando o escopo for geral

### `rebuildPlayerReadModelsAfterMerge(targetPlayerId, sourcePlayerId)`

Atualiza:

- remove ou invalida projeções antigas do `sourcePlayerId`, quando existirem;
- reconstrói:
  - `player_profile_summary`
  - `player_statistics_summary`
  - `player_statistics_by_modality`
  - `player_statistics_by_team_modality`
  - `player_timeline_items`
  - `player_gallery_items`
  - `player_gallery_group_counters`
  - `player_performance_series`
  - `player_style_inference`
  para o `targetPlayerId`

## Regras

- métodos devem ser idempotentes;
- rebuild parcial deve ser preferido a rebuild total quando possível;
- origem operacional continua sendo a verdade;
- se o serviço estiver desativado por flag, não deve bloquear o fluxo principal.
- merge de atletas deve preferir reconstrução do destino a remendo manual em tabelas derivadas;
- `sourcePlayerId` e `targetPlayerId` devem ser tratados como identificadores distintos até o commit operacional terminar.
