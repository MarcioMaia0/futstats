---
title: Social API
status: Draft
version: 1.0.0
owner: Product Architecture
last_update: 2026-07-10
related_documents:
  - ../Implementation/API/Endpoint_Detail_Social.md
  - ../Implementation/Core_Flows/Share_Card_Implementation.md
  - ../Implementation/Database/Table_Spec_match_cards.md
  - ./Teams_API.md
  - ./Players_API.md
---

# Social API

## Objetivo

Definir os endpoints sociais do produto e separar claramente:

- feed e interacoes sociais;
- denuncias e moderacao;
- artefatos visuais compartilhaveis;
- distribuicao social derivada de times, atletas e partidas.

## Rotas iniciais

```text
GET /api/v1/feed
POST /api/v1/posts
POST /api/v1/posts/:post_id/reactions
POST /api/v1/posts/:post_id/comments
POST /api/v1/content-reports
POST /api/v1/cards/match-result
POST /api/v1/cards/player
GET /api/v1/cards/:card_id
```

## Regras

- Feed deve priorizar times, atletas e contextos seguidos pelo usuario.
- Conteudo reportado deve entrar em fluxo de moderacao.
- Reacoes devem ser idempotentes por usuario e por alvo.
- Card compartilhavel nao deve nascer como subrota antiga de `matches`.
- O fato esportivo continua em `matches`; o artefato visual derivado vive em `cards` e `match_cards`.
- Card deve respeitar tema visual do time quando disponivel.
- Card nao deve expor dados privados sem permissao.
