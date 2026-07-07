---
title: Table Spec match events
status: Draft
version: 0.9.0
owner: Product Architecture
last_update: 2026-07-06
---

# Table Spec match events

## Objetivo

Especificar tabela `match_events`.

## Finalidade

Registrar eventos de partida.

## Campos sugeridos

- `id`
- `match_id`
- `event_type`
- `occurred_at`
- `primary_player_id`
- `secondary_player_id`
- `metadata`
- `created_at`

## Regras

- Metadata pode armazenar detalhes avançados.
- Evento pode não ter player no modo casual.
- Alterações devem recalcular dependentes.


