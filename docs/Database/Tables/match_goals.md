---
title: Table: match_goals
status: Draft
version: 1.0.0
owner: Product Architecture
last_update: 2026-07-06
related_documents:
  []
---

# Table: `match_goals`

## Objetivo

Camada simplificada para gols e autores.

## Convenções

- Nome técnico em inglês.
- Chave primária `id`.
- Campos temporais `created_at` e `updated_at`.
- Soft delete quando aplicável.

## Responsabilidades

Esta tabela deve armazenar apenas dados canônicos. Textos exibidos ao usuário devem ser resolvidos pela camada de apresentação quando dependerem de linguagem, tom ou resenha.

## Cuidados de implementação

- Definir índices para chaves estrangeiras.
- Evitar acoplamento com telas específicas.
- Garantir consistência histórica.
- Documentar qualquer campo derivado.

## Status

Estrutura física final será definida no SQL consolidado.
