---
title: Statistics API
status: Draft
version: 1.0.0
owner: Product Architecture
last_update: 2026-07-09
related_documents:
  - Players_API.md
  - ../Domain/Statistics.md
---

# Statistics API

## Rotas

```text
GET /api/v1/teams/:team_id/statistics
GET /api/v1/players/:player_id/statistics
GET /api/v1/matches/:match_id/report
GET /api/v1/teams/:team_id/rankings
```

## Princípio central

Estatísticas devem declarar claramente:

- o que já é confiável no MVP;
- o que é parcial;
- o que ainda não existe por falta de scout ou camada operacional mais fina.

## GET /api/v1/players/:player_id/statistics

Retorna estatísticas consolidadas do atleta com base no histórico factual já persistido no app.

## Fontes mínimas do MVP

- `match_players`
- `matches`
- `match_goals`
- `team_players`

## Resposta conceitual

```json
{
  "player_id": "uuid",
  "overview": {
    "matches_played": 18,
    "starter_matches": 11,
    "bench_matches": 7,
    "official_team_matches": 15,
    "guest_matches": 3,
    "wins": 9,
    "draws": 2,
    "losses": 4,
    "goals_scored": 12,
    "recorded_assists": 4,
    "own_goals": 1
  },
  "by_modality": [
    {
      "modality": "FUTSAL",
      "matches_played": 10,
      "goals_scored": 8,
      "recorded_assists": 3,
      "own_goals": 1
    },
    {
      "modality": "SOCIETY",
      "matches_played": 8,
      "goals_scored": 4,
      "recorded_assists": 1,
      "own_goals": 0
    }
  ],
  "by_team": [
    {
      "team_id": "uuid",
      "team_name": "Uniao de Artur Alvim",
      "matches_played": 15,
      "goals_scored": 11
    }
  ],
  "coverage": {
    "results_basis": "FINISHED_MATCHES_ONLY",
    "assists_are_partial": true,
    "advanced_scout_available": false,
    "minutes_available": false,
    "plus_minus_available": false
  },
  "limitations": [
    "Assists depend on explicit goal registration with assist_player_id.",
    "Advanced tactical metrics are not part of the MVP.",
    "Only finalized matches are considered in result-based metrics."
  ]
}
```

## Regras

- o endpoint deve considerar apenas partidas válidas para estatística;
- métricas de resultado devem considerar apenas partidas finalizadas;
- `matches_played` vem de `match_players`, não de `team_players`;
- `starter_matches`
  - quantidade de partidas em que `match_players.is_starter = true`;
- `bench_matches`
  - quantidade de partidas em que `match_players.is_starter = false`;
- `official_team_matches`
  - quantidade de partidas em que `match_players.is_team_player = true`;
- `guest_matches`
  - quantidade de partidas em que `match_players.is_team_player = false`;
- `goals_scored`
  - contar `match_goals.player_id = player_id` com `own_goal = false`;
- `own_goals`
  - contar `match_goals.player_id = player_id` com `own_goal = true`;
- `recorded_assists`
  - contar `match_goals.assist_player_id = player_id` com base apenas no que foi registrado;
- `wins`, `draws` e `losses`
  - dependem da relação entre `match_players.team_id` e o placar final da partida;
- `by_modality`
  - deve ser derivado de `matches.modality`;
- `by_team`
  - deve consolidar histórico do atleta por time.

## Fora do MVP

- minutos jogados;
- plus/minus;
- nota média avançada;
- mapa de calor;
- scout fino por fundamento;
- posição efetiva por minuto do jogo.

## Regra de UX/API

Sempre que uma métrica for parcial ou indisponível, o backend deve sinalizar isso em `coverage` e `limitations`, em vez de fingir completude.
