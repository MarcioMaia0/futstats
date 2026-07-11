---
title: Table Spec matches
status: Draft
version: 1.1.0
owner: Product Architecture
last_update: 2026-07-09
---

# Table Spec matches

## Objetivo

Especificar tabela `matches`.

## Finalidade

Representar partidas operacionais.

## Campos sugeridos

- `id`
- `team_id`
- `scheduled_match_id`
- `opponent_type`
- `opponent_team_id`
- `local_opponent_id`
- `venue_id`
- `match_date`
- `status`
- `analysis_status`
- `match_type`
- `modality` (enum: `FUTSAL`, `SOCIETY`, `FIELD`; padrao `FUTSAL`)
- `starters_count` (inteiro; padrao derivado da modalidade: 5/7/11)
- `frame_type`
- `home_score`
- `opponent_score`
- `video_url`
- `created_at`
- `updated_at`

## Regras

- Deve aceitar dados minimos.
- Placar pode ser atualizado.
- Cancelamento preserva registro.
- `status` representa o estado operacional do jogo em campo.
- `analysis_status` representa o estado da camada analitica pos-jogo.
- `status = COMPLETED` nao significa que todos os dados analiticos estejam fechados.
- apos o encerramento operacional, a partida pode continuar recebendo:
  - scout por video;
  - correcoes de eventos;
  - enriquecimento estatistico;
  - revisao de autoria;
- `modality` e `starters_count` sao herdados do time na criacao; o usuario pode sobrescrever.
- `modality` e independente de `match_type`.
- `scheduled_match_id` pode ser nulo para jogo criado sem agendamento previo.
- `opponent_type` deve distinguir:
  - `APP_TEAM`
  - `LOCAL_OPPONENT`
- `opponent_team_id` deve ser usado quando o adversario for time oficial do app.
- `local_opponent_id` deve ser usado quando o adversario vier da agenda privada do time.
- quando a partida nascer sem agendamento previo:
  - o sistema pode criar depois um `scheduled_match` derivado para a agenda;
  - a partida deve ser religada a esse compromisso derivado assim que ele existir.
- `matches.frame_type` representa o quadro daquela partida operacional:
  - `UNIQUE_FRAME`
  - `SECOND_FRAME`
  - `FIRST_FRAME`
- se um mesmo compromisso esportivo tiver segundo e primeiro quadro, cada quadro deve existir como partida operacional independente.

## Enums sugeridos

- `match_status`
  - `DRAFT`
  - `IN_PROGRESS`
  - `COMPLETED`
  - `CANCELLED`
- `match_analysis_status`
  - `NOT_STARTED`
  - `IN_REVIEW`
  - `FINALIZED`
- `opponent_type`
  - `APP_TEAM`
  - `LOCAL_OPPONENT`
