---
title: Background Jobs
status: Draft
version: 0.9.0
owner: Product Architecture
last_update: 2026-07-06
related_documents:
[]
---

# Background Jobs

## Objetivo

Listar processamentos assíncronos.

## Jobs

- Recalcular estatísticas.
- Gerar cards.
- Processar uploads.
- Gerar thumbnails.
- Executar moderação.
- Gerar insights de IA.
- Atualizar rankings.
- Enviar notificações.
- Recalcular reputação de árbitros.
- Gerar snapshots.

## Regra

Toda tarefa pesada ou não imediata deve ser candidata a job assíncrono.
