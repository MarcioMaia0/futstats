---
title: ERD Overview
status: Draft
version: 1.1.0
owner: Product Architecture
last_update: 2026-07-09
related_documents: []
---

# ERD Overview

## Visão conceitual

```text
auth.users -- public.users -- user_team_roles -- teams
        |             |
        |             -- roles
        |
      persons -- players -- team_players
                       |           |
                       |           -- player_statistics_by_team_modality
                       |
                       -- player_profile_summary
                       -- player_statistics_summary
                       -- player_statistics_by_modality
                       -- player_timeline_items
                       -- player_gallery_items
                       -- player_performance_series
                       -- player_style_inference

teams -- matches -- match_players -- player_match_statistics
  |         |            |
  |         |            -- match_players_positions
  |         |
  |         |-- match_events
  |         |-- match_goals
  |         |-- match_referees -- referee_reviews
  |         |-- venues
  |         -- local_opponents
  |
  -- team_settings / themes
```

## Observação

Este ERD é conceitual. A modelagem física deve ser refinada durante implementação.
