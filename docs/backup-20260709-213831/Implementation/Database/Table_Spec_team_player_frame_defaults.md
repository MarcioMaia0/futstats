---
title: Table Spec team_player_frame_defaults
status: Draft
version: 1.0.0
owner: Product Architecture
last_update: 2026-07-09
related_documents:
  - Table_Spec_team_players.md
  - Table_Spec_teams.md
  - ../../Domain/Matches.md
---

# Table Spec team_player_frame_defaults

## Objetivo

Especificar `team_player_frame_defaults`: pré-configuração padrão de quadro dos atletas dentro do time.

## Finalidade

Permitir que a diretoria mantenha uma base de referência dizendo em qual quadro o atleta costuma participar por modalidade.

## Campos sugeridos

- `id` (uuid, PK)
- `team_id` (uuid, FK -> `teams.id`)
- `player_id` (uuid, FK -> `players.id`)
- `modality` (enum `modality`)
- `default_frame_type` (enum `default_frame_type`)
- `created_by_user_id` (uuid, FK -> `users.id`, nullable)
- `created_at`
- `updated_at`

## Enums

- `default_frame_type`
  - `SECOND_FRAME`
  - `FIRST_FRAME`
  - `UNASSIGNED`

## Regras

- esta tabela não substitui `team_players`.
- esta tabela não escala ninguém automaticamente para uma partida.
- esta tabela guarda apenas uma referência padrão de logística do time.
- a gestão pode escalar o atleta em quadro diferente no contexto de um jogo específico.
- a configuração deve ser por modalidade, porque o mesmo atleta pode ter contexto diferente em:
  - futsal
  - society
  - campo
- `SECOND_FRAME` deve continuar existindo como conceito canônico, mesmo aparecendo antes na UI.
- quando o jogo tiver `match_frame_count = 1`, esta configuração pode ser ignorada para fins de visualização de presença.

## Unicidade

- deve existir no máximo uma linha por `team_id + player_id + modality`.

