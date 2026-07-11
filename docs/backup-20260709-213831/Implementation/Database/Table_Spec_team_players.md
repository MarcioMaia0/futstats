---
title: Table Spec team_players
status: Draft
version: 2.0.0
owner: Product Architecture
last_update: 2026-07-09
related_documents:
  - Table_Spec_players.md
  - Table_Spec_match_players.md
  - Table_Spec_user_team_roles.md
  - ../../Domain/Teams.md
---

# Table Spec team_players

## Objetivo

Especificar `team_players`: vínculo esportivo oficial entre atleta e time.

## Finalidade

Representar que um `player` faz ou fez parte do elenco oficial de um time.

Esta tabela não representa:

- papel de gestão;
- participação avulsa em partida;
- presença/ausência em jogo;
- posição contextual de uma partida.

## Campos sugeridos

- `id` (uuid, PK)
- `team_id` (uuid, FK -> `teams.id`)
- `player_id` (uuid, FK -> `players.id`)
- `status` (enum `team_player_status`)
- `joined_at` (timestamptz, nullable)
- `left_at` (timestamptz, nullable)
- `created_at`
- `updated_at`

## Enums

- `team_player_status`
  - `ACTIVE`
  - `INACTIVE`
  - `LEFT`
  - `REMOVED`

## Regras

- `team_players` representa vínculo esportivo oficial com o time.
- Um `player` pode estar vinculado a mais de um time.
- Um time pode ter vários `players`.
- Atleta avulso não entra aqui automaticamente.
- Atleta avulso participa da partida por `match_players` com `is_team_player = false`.
- Aprovação de `team_join_requests` com modo que inclua `PLAYER` deve:
  - criar o vínculo, se não existir;
  - ou reativar vínculo histórico, quando fizer sentido.
- `ACTIVE`
  - faz parte do elenco atual do time.
- `INACTIVE`
  - permanece relacionado historicamente, mas não está ativo no elenco atual.
- `LEFT`
  - saiu do time.
- `REMOVED`
  - foi removido administrativamente.

## Unicidade e integridade

- Deve existir no máximo um vínculo ativo por `team_id + player_id`.
- Histórico pode existir, mas o backend deve evitar duplicidade operacional de vínculo ativo.

