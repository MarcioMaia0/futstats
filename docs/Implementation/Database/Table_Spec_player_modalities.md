---
title: Table Spec player_modalities
status: Draft
version: 1.0.0
owner: Product Architecture
last_update: 2026-07-09
related_documents:
  - Table_Spec_players.md
---

# Table Spec player_modalities

## Objetivo

Especificar `player_modalities`: modalidades declaradas do atleta.

## Finalidade

Registrar em quais modalidades o atleta informa que atua.

Esta tabela serve para:

- compor o perfil público do atleta;
- ajudar UX de cadastro e escalação;
- apoiar cálculo de completude esportiva.

## Campos sugeridos

- `id` (uuid, PK)
- `player_id` (uuid, FK -> `players.id`)
- `modality` (enum `sport_modality`)
- `created_at`

## Regras

- Um atleta pode ter várias modalidades.
- Modalidade aqui é declarada/preferencial, não histórico factual de partida.
- A completude mínima do atleta depende da existência de ao menos uma modalidade.

## Unicidade

- Deve existir no máximo uma linha por `player_id + modality`.

