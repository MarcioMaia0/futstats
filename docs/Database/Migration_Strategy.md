---
title: Database Migration Strategy
status: Draft
version: 1.0.0
owner: Product Architecture
last_update: 2026-07-06
related_documents:
  []
---

# Database Migration Strategy

## Objetivo

Definir como mudanças no banco serão introduzidas com segurança.

## Regras

1. Toda alteração deve ter migration versionada.
2. Migrations devem ser pequenas e reversíveis quando possível.
3. Alterações destrutivas devem passar por etapa de compatibilidade.
4. Enums devem ser tratados com cuidado para evitar travamento de deploy.
5. Campos novos devem nascer `NULLABLE` quando utilizados por funcionalidades futuras.
6. Dados derivados devem poder ser recalculados.

## Estratégia recomendada

```text
Adicionar campo/tabela → Adaptar backend → Backfill opcional → Usar em produção → Remover legado
```

## Cuidados

- Nunca renomear coluna sem fase intermediária.
- Nunca apagar dado histórico sem política explícita.
- Métricas devem versionar regras de cálculo.
