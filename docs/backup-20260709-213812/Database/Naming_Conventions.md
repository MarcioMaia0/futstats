---
title: Database Naming Conventions
status: Draft
version: 1.0.0
owner: Product Architecture
last_update: 2026-07-06
related_documents:
  []
---

# Database Naming Conventions

## Objetivo

Padronizar nomenclatura do banco.

## Convenções

- Tabelas em inglês e plural: `teams`, `matches`, `players`.
- Colunas em `snake_case`: `created_at`, `team_id`.
- Enums em inglês e `UPPER_SNAKE_CASE`: `FINISHED`, `CANCELLED_BY_OPPONENT`.
- Chaves primárias como `id`.
- Chaves estrangeiras como `<entity>_id`.
- Timestamps padrão: `created_at`, `updated_at`, `deleted_at`.
- Soft delete preferencial em entidades importantes.

## Regra

Português e resenha pertencem à UI, não ao banco.
