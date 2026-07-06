---
title: Statistics API
status: Draft
version: 0.4.0
owner: Product Architecture
last_update: 2026-07-06
related_documents: []
---

# Statistics API

## Rotas

```text
GET /api/v1/teams/:team_id/statistics
GET /api/v1/players/:player_id/statistics
GET /api/v1/matches/:match_id/report
GET /api/v1/teams/:team_id/rankings
```

## Regras

Estatísticas devem indicar quando dependem de dados avançados ausentes.
