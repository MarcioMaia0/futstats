---
title: Table Spec scheduled_matches
status: Draft
version: 1.0.0
owner: Product Architecture
last_update: 2026-07-09
related_documents:
  - Table_Spec_teams.md
  - Table_Spec_local_opponents.md
  - Table_Spec_venues.md
  - ../../Domain/Matches.md
---

# Table Spec scheduled_matches

## Objetivo

Especificar `scheduled_matches`: compromissos futuros de jogo antes da partida operacional.

## Finalidade

Representar o jogo planejado pela diretoria antes da criação ou abertura da partida operacional.

## Campos sugeridos

- `id` (uuid, PK)
- `team_id` (uuid, FK -> `teams.id`)
- `origin_type` (enum `scheduled_match_origin_type`, default `PLANNED`)
- `opponent_type` (enum `scheduled_match_opponent_type`)
- `opponent_team_id` (uuid, FK -> `teams.id`, nullable)
- `local_opponent_id` (uuid, FK -> `local_opponents.id`, nullable)
- `opponent_name` (text, not null)
- `match_date` (date, not null)
- `match_time` (time, not null)
- `match_type` (enum `scheduled_match_type`)
- `age_category` (enum `scheduled_match_age_category`, nullable)
- `organization_name` (text, nullable)
- `venue_id` (uuid, FK -> `venues.id`, nullable)
- `venue_name_snapshot` (text, nullable)
- `venue_address_snapshot` (text, nullable)
- `home_match_capability_snapshot` (enum `home_match_capability`, nullable)
- `match_frame_count` (integer, default `1`)
- `status` (enum `scheduled_match_status`)
- `team_visibility_at` (timestamptz, nullable)
- `publish_match_announcement` (boolean, default `false`)
- `announcement_publish_at` (timestamptz, nullable)
- `created_by_user_id` (uuid, FK -> `users.id`)
- `confirmed_by_user_id` (uuid, FK -> `users.id`, nullable)
- `confirmed_at` (timestamptz, nullable)
- `cancelled_by_user_id` (uuid, FK -> `users.id`, nullable)
- `cancelled_at` (timestamptz, nullable)
- `notes` (text, nullable)
- `created_at`
- `updated_at`

## Enums

- `scheduled_match_origin_type`
  - `PLANNED`
  - `DERIVED_FROM_MATCH`
- `scheduled_match_opponent_type`
  - `APP_TEAM`
  - `LOCAL_OPPONENT`
- `scheduled_match_type`
  - `FRIENDLY`
  - `FESTIVAL`
  - `LEAGUE`
  - `TOURNAMENT`
- `scheduled_match_age_category`
  - `YOUTH`
  - `U17`
  - `U20`
  - `OPEN`
  - `O35`
  - `O40`
  - `O50`
  - `O55`
- `scheduled_match_status`
  - `PLANNED`
  - `CONFIRMED_INTERNAL`
  - `RELEASED_TO_TEAM`
  - `CANCELLED`

## Regras

- `scheduled_matches` não é a mesma entidade que `matches`.
- `scheduled_matches` representa planejamento e comunicação prévia.
- `matches` representa a partida operacional.
- `origin_type = PLANNED` representa o fluxo normal:
  - primeiro agenda;
  - depois partida;
- `origin_type = DERIVED_FROM_MATCH` representa o fluxo inverso:
  - primeiro partida;
  - depois item de agenda derivado;
- `match_frame_count` define quantos quadros o compromisso terá.
- valores iniciais recomendados para `match_frame_count`:
  - `1`
  - `2`
- se `match_frame_count = 1`:
  - a presença pode ser exibida em lista única.
- se `match_frame_count = 2`:
  - a presença deve considerar a separação por quadro.
- `organization_name` ajuda a identificar de onde veio o jogo:
  - liga
  - copa
  - festival
  - organizador informal
- `team_visibility_at` controla quando o compromisso fica visível para o restante do time.
- se `status = CONFIRMED_INTERNAL`, `team_visibility_at` pode nascer:
  - com data/hora atual;
  - ou com data/hora futura escolhida pela gestão.
- quando o jogo nascer sem agendamento prévio:
  - o sistema pode criar um `scheduled_match` derivado;
  - esse registro deve entrar na agenda;
  - esse registro não deve ser tratado como planejamento antigo esquecido;
  - esse registro existe para manter histórico e navegação coerentes entre agenda e partida.
