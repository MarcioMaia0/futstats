---
title: ERD Overview
status: Draft
version: 1.0.0
owner: Product Architecture
last_update: 2026-07-06
related_documents:
  []
---

# ERD Overview

## Visão conceitual

```text
accounts ── users ── user_team_roles ── teams
              │              │
              │              └── roles
              │
            players ── team_players
                         │
teams ── matches ── match_events
  │          │              │
  │          ├── match_referees ── referee_reviews
  │          ├── venues
  │          └── local_opponents
  │
  └── team_settings / themes
```

## Observação

Este ERD é conceitual. A modelagem física deve ser refinada durante implementação.
