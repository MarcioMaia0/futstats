---
title: Table Spec match_players_positions
status: Draft
version: 1.0.0
owner: Product Architecture
last_update: 2026-07-09
related_documents:
  - Table_Spec_match_players.md
  - Table_Spec_matches.md
---

# Table Spec match_players_positions

## Objetivo

Especificar `match_players_positions`: posições em que o atleta foi escalado para atuar naquela partida.

## Finalidade

Separar a posição contextual da partida da posição declarada no perfil do atleta.

Esta tabela serve para:

- dizer em quais posições o atleta pode atuar naquele jogo;
- alimentar histórico factual de utilização por modalidade;
- permitir múltiplas posições por atleta na mesma partida.

## Campos sugeridos

- `id` (uuid, PK)
- `match_player_id` (uuid, FK -> `match_players.id`)
- `modality_position_id` (uuid, FK -> `modality_positions.id`)
- `created_at`

## Regras

- Cada linha representa uma posição válida para aquele atleta naquela partida.
- Um mesmo `match_player` pode ter múltiplas posições.
- A posição deve ser canônica e vir do catálogo `modality_positions`.
- O backend deve validar coerência entre:
  - modalidade da partida;
  - modalidade da posição escolhida.
- Esta tabela representa posição exercida/prevista na partida, não posição declarada do atleta.

## Unicidade

- Deve existir no máximo uma linha por `match_player_id + modality_position_id`.

