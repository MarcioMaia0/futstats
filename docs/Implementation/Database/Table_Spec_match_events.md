---
title: Table Spec match events
status: Draft
version: 1.0.0
owner: Product Architecture
last_update: 2026-07-09
related_documents:
  - Table_Spec_match_players.md
  - Table_Spec_match_substitutions.md
---

# Table Spec match events

## Objetivo

Especificar tabela `match_events`.

## Finalidade

Registrar eventos granulares de partida.

Esta tabela serve para camada mais fina de eventos táticos e operacionais, como:

- gols;
- assistências;
- cartões;
- faltas;
- defesas;
- eventos futuros de scout.

## Campos sugeridos

- `id`
- `match_id`
- `event_type`
- `occurred_at`
- `primary_match_player_id`
- `secondary_match_player_id`
- `metadata`
- `created_at`

## Regras

- `primary_match_player_id` e `secondary_match_player_id` permitem capturar o contexto do atleta na partida, e não apenas o atleta abstrato.
- `metadata` pode armazenar detalhes avançados, inclusive posição efetiva no momento do lance quando o produto suportar isso.
- Evento pode não ter player no modo casual.
- Alterações devem recalcular dependentes.
- Esta tabela não substitui `match_substitutions`.
- `match_substitutions` registra trocas; `match_events` registra lances e acontecimentos.

