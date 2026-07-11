---
title: Soft Delete and Audit
status: Draft
version: 0.9.0
owner: Product Architecture
last_update: 2026-07-06
related_documents:
[]
---

# Soft Delete and Audit

## Objetivo

Definir política de remoção lógica e auditoria.

## Regras

1. Entidades históricas devem preferir `deleted_at` em vez de exclusão física.
2. Eventos críticos devem registrar autor e data.
3. Alterações de placar, gols e avaliações devem ser auditáveis.
4. Conteúdo social pode ser ocultado sem apagar o histórico operacional.
5. Auditoria deve ser separada da experiência pública.

## Entidades críticas

- matches;
- match_events;
- teams;
- players;
- referee_reviews;
- user_team_roles;
- payments;
- content_reports.
