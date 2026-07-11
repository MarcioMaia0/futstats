---
title: App Structure
status: Draft
version: 0.9.0
owner: Product Architecture
last_update: 2026-07-06
related_documents:
[]
---

# App Structure

## Organização sugerida

```text
src/
├── app/
├── features/
│   ├── identity/
│   ├── teams/
│   ├── matches/
│   ├── social/
│   └── statistics/
├── components/
├── design-system/
├── hooks/
├── services/
└── i18n/
```

## Regra

Features devem refletir domínios de produto.
