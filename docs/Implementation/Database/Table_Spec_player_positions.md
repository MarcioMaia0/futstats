---
title: Table Spec player_positions
status: Draft
version: 1.0.0
owner: Product Architecture
last_update: 2026-07-09
related_documents:
  - Table_Spec_players.md
  - Table_Spec_modality_positions.md
---

# Table Spec player_positions

## Objetivo

Especificar `player_positions`: posições declaradas/preferenciais do atleta.

## Finalidade

Registrar as posições que o atleta informa que joga, por modalidade.

Esta tabela serve para:

- exibir o perfil do atleta;
- destacar posições no momento da escalação;
- apoiar UX de seleção sem substituir o histórico factual das partidas.

## Campos sugeridos

- `id` (uuid, PK)
- `player_id` (uuid, FK -> `players.id`)
- `modality_position_id` (uuid, FK -> `modality_positions.id`)
- `created_at`

## Regras

- Um atleta pode ter várias posições declaradas.
- A modalidade é herdada do catálogo `modality_positions`.
- Esta tabela não representa posição efetivamente jogada em partida.
- Histórico posicional real deve vir de `match_players_positions` e eventos da partida.
- A completude mínima do atleta depende da existência de ao menos uma posição válida associada às suas modalidades.

## Unicidade

- Deve existir no máximo uma linha por `player_id + modality_position_id`.

