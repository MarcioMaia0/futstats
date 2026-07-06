---
title: API Conventions
status: Draft
version: 0.9.0
owner: Product Architecture
last_update: 2026-07-06
related_documents:
[]
---

# API Conventions

## Nomenclatura

- Rotas em inglês.
- JSON em `snake_case` ou `camelCase`, desde que padronizado no projeto.
- Enums em `UPPER_SNAKE_CASE`.

## Paginação

Parâmetros:

- `limit`
- `cursor`
- `sort`
- `filter`

## Resposta de erro

```json
{
  "error": {
    "code": "MATCH_ALREADY_FINISHED",
    "message": "Esta partida já foi finalizada.",
    "details": {}
  }
}
```
