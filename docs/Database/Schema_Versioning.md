---
title: Schema Versioning
status: Draft
version: 0.9.0
owner: Product Architecture
last_update: 2026-07-06
---

# Schema Versioning


## Objetivo

Definir estratégia de versionamento do banco.

## Regras

1. Toda alteração de schema deve ter migration.
2. Migrations devem ser reversíveis quando viável.
3. Campos novos devem preferir `NULL` ou default seguro.
4. Renomeações devem ser feitas com cuidado para evitar perda de dados.
5. Alterações destrutivas exigem janela de manutenção ou migração em fases.

## Convenção

```text
YYYYMMDDHHMM_description.sql
```

## Estratégia

Usar ferramenta de migrations do backend escolhido e manter schema documentado junto à documentação.
