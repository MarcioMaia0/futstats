---
title: Schema Governance
status: Draft
version: 0.9.0
owner: Product Architecture
last_update: 2026-07-06
related_documents:
[]
---

# Schema Governance

## Objetivo

Definir regras para evolução do banco de dados.

## Regras

1. Tabelas e colunas em inglês `snake_case`.
2. Enums canônicos em inglês `UPPER_SNAKE_CASE`.
3. Migrações sempre versionadas.
4. Não remover colunas em uso sem estratégia de depreciação.
5. Dados históricos de partidas devem ser preservados.
6. Campos calculados devem declarar origem e regra.
7. Alterações em métricas precisam de versionamento.

## Política de mudanças

Toda mudança de schema deve responder:

- Qual domínio é afetado?
- Existe impacto em dados históricos?
- Precisa de backfill?
- Precisa de migração reversível?
- Afeta APIs públicas?
