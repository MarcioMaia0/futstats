---
title: Pagination and Filtering
status: Draft
version: 1.0.0
owner: Product Architecture
last_update: 2026-07-06
related_documents:
  []
---

# Pagination and Filtering

## Paginação padrão

```text
?page=1&page_size=20
```

## Filtros comuns

- `team_id`
- `player_id`
- `status`
- `date_from`
- `date_to`
- `type`
- `visibility`

## Ordenação

```text
?sort=created_at:desc
```

## Regra

Listagens grandes sempre devem ser paginadas.
