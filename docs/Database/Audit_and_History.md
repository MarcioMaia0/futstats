---
title: Audit and History
status: Draft
version: 1.0.0
owner: Product Architecture
last_update: 2026-07-06
related_documents:
  []
---

# Audit and History

## Objetivo

Definir como mudanças relevantes serão rastreadas.

## Entidades que exigem histórico

- matches;
- match_events;
- scores;
- team roles;
- referee reviews;
- player claims;
- player merges/reassignments;
- subscription/billing;
- public content moderation.

## Regras

1. Alterações de placar devem registrar autor e data.
2. Exclusão lógica deve ser preferida para dados históricos.
3. Eventos de partida devem permitir reconstrução do placar.
4. Alteração em scout deve recalcular estatísticas.
5. Reviews e comentários devem guardar trilha mínima para moderação.
6. Merge de `player_id` deve registrar origem, destino, autor e contexto da ação.

## Tabelas possíveis

- `audit_logs`
- `match_score_history`
- `match_event_history`
- `role_assignment_history`
