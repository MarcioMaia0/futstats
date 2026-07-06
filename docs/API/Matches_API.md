---
title: Matches API
status: Draft
version: 0.9.0
owner: Product Architecture
last_update: 2026-07-06
related_documents:
[]
---

# Matches API

## Rotas iniciais

```text
POST /matches
GET /matches/:match_id
PATCH /matches/:match_id
POST /matches/:match_id/goals
PATCH /matches/:match_id/goals/:goal_id
POST /matches/:match_id/events
POST /matches/:match_id/finish
POST /matches/:match_id/cancel
```

## Regras

- Criar partida deve aceitar modo rápido.
- Gol pode ser salvo sem jogador.
- Finalizar partida dispara consolidação.
