---
title: Auth API
status: Draft
version: 0.4.0
owner: Product Architecture
last_update: 2026-07-06
related_documents: []
---

# Auth API

## Rotas

```text
POST /api/v1/auth/sign-in
POST /api/v1/auth/sign-out
GET /api/v1/me
PATCH /api/v1/me/preferences
```

## Regras

1. Auth retorna usuário e permissões básicas.
2. Preferências de linguagem e tema pertencem ao usuário.
3. Permissões por time devem ser consultadas por contexto.
