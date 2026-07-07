---
title: Table Spec matches
status: Draft
version: 0.9.0
owner: Product Architecture
last_update: 2026-07-06
---

# Table Spec matches

## Objetivo

Especificar tabela `matches`.

## Finalidade

Representar partidas.

## Campos sugeridos

- `id`
- `team_id`
- `opponent_id`
- `venue_id`
- `match_date`
- `status`
- `match_type`
- `modality` (enum: `FUTSAL`, `SOCIETY`, `FIELD`; padrão `FUTSAL`)
- `starters_count` (inteiro; padrão derivado da modalidade: 5/7/11)
- `frame_type`
- `home_score`
- `opponent_score`
- `video_url`
- `created_at`
- `updated_at`

## Regras

- Deve aceitar dados mínimos.
- Placar pode ser atualizado.
- Cancelamento preserva registro.
- `modality` e `starters_count` são herdados do `default_modality` do time na criação; o usuário pode sobrescrever.
- `modality` (futsal/society/campo) é independente de `match_type` (amistoso, campeonato).
- Vale para partidas agendadas e registradas (agendamento usa esta tabela via `status`).


