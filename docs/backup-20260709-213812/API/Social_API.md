---
title: Social API
status: Draft
version: 0.9.0
owner: Product Architecture
last_update: 2026-07-06
related_documents:
[]
---

# Social API

## Rotas iniciais

```text
GET /feed
POST /posts
POST /posts/:post_id/reactions
POST /posts/:post_id/comments
POST /content-reports
POST /matches/:match_id/share-card
```

## Regras

- Feed deve priorizar times e jogadores seguidos.
- Cards devem respeitar tema do time.
- Conteúdo reportado deve entrar em fluxo de moderação.
