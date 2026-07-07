---
title: Database Documentation
status: Draft
version: 0.5.0
owner: Product Architecture
last_update: 2026-07-06
related_documents: [Database_Architecture.md]
---

# Database Documentation

## Objetivo

Documentar a arquitetura de banco do FUTSTATS.

## Princípios

- Nomenclatura em inglês.
- `snake_case` para tabelas e colunas.
- Enums em inglês canônico.
- Dados de interface fora do dado canônico.
- Campos avançados opcionais.
- Histórico preservado.
- Métricas derivadas quando possível.

## Documentos

- `Database_Architecture.md`
- `Naming_Conventions.md`
- `Entity_Relationships.md`
- `Indexes.md`
- `../Implementation/Database/Table_Spec_*.md` (specs de tabela — fonte única)
- `Tables.md` (mapa de alto nível das tabelas)
