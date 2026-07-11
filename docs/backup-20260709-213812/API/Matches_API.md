---
title: Matches API
status: Draft
version: 1.0.0
owner: Product Architecture
last_update: 2026-07-09
related_documents: []
---

# Matches API

## Rotas iniciais

```text
POST /matches
GET /matches/:match_id
PATCH /matches/:match_id
POST /matches/:match_id/lineups/:frame_type/save
POST /matches/:match_id/goals/quick
POST /matches/:match_id/goals
PATCH /matches/:match_id/goals/:goal_id
POST /matches/:match_id/events
PATCH /matches/:match_id/events/:event_id
POST /matches/:match_id/substitutions
POST /matches/:match_id/opponent-players
PATCH /matches/:match_id/opponent-players/:match_opponent_player_id
POST /matches/:match_id/operator-assignments
PATCH /matches/:match_id/operator-assignments/:assignment_id
POST /matches/:match_id/finish
POST /matches/:match_id/cancel
```

## Regras

- Criar partida deve aceitar modo rapido.
- Criar partida deve aceitar fluxo sem agendamento previo.
- Se a partida nascer sem agendamento previo, o backend pode derivar um item de agenda vinculado para manter a leitura cronologica do time.
- A API de partida deve expor separadamente:
  - `status` para estado operacional;
  - `analysis_status` para estado analitico;
- `POST /matches/:match_id/lineups/:frame_type/save`
  - cria ou atualiza a escalacao do quadro.
- `POST /matches/:match_id/goals/quick`
  - suporta o modo casual por toque no escudo.
- `POST /matches/:match_id/events`
  - deve aceitar evento parcial.
- `PATCH /matches/:match_id/events/:event_id`
  - deve permitir enriquecer evento ja salvo parcialmente.
- `POST /matches/:match_id/opponent-players`
  - cria ator adversario operacional para aquela partida.
- `POST /matches/:match_id/operator-assignments`
  - define responsabilidades dos operadores da partida.
- Gol pode ser salvo sem jogador.
- Finalizar partida dispara consolidacao.
