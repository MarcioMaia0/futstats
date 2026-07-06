---
title: Identity API
status: Draft
version: 0.9.0
owner: Product Architecture
last_update: 2026-07-06
related_documents:
[]
---

# Identity API

## Rotas iniciais

```text
POST /auth/sign-in
POST /auth/sign-out
GET /me
PATCH /me
PATCH /me/preferences
GET /me/roles
```

## Regras

- `/me` retorna o usuário da plataforma, não apenas autenticação.
- Preferências de experiência pertencem ao usuário.
- Papéis devem ser resolvidos por contexto.
