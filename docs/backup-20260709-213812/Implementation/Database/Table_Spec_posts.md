---
title: Table Spec posts
status: Draft
version: 1.1.0
owner: Product Architecture
last_update: 2026-07-08
---

# Table Spec posts

## Objetivo

Especificar tabela `posts`.

## Finalidade

Representar conteúdo social, inclusive posts automáticos do sistema para movimentar a comunidade do time.

## Campos sugeridos

- `id`
- `author_user_id`
- `team_id`
- `match_id`
- `post_type`
- `content`
- `visibility`
- `metadata` (jsonb, nullable)
- `created_at`

## Enums

- `post_type`: `TEXT | MATCH_RESULT | TEAM_EVENT | SYSTEM_ANNOUNCEMENT`

## Regras

- Visibilidade deve ser respeitada.
- Conteúdo pode ser denunciado.
- `TEAM_EVENT` representa evento social do time publicado no feed.
- `TEAM_EVENT` pode nascer sem texto manual, desde que `metadata` carregue os dados necessários para renderização do template.
- Comentários em `TEAM_EVENT` devem ser permitidos quando o tipo de evento assim exigir, como no caso de boas-vindas.

## Tipos iniciais dentro de `TEAM_EVENT`

Esses tipos vivem em `metadata.event_type` ou estrutura equivalente:

- `PLAYER_WELCOME`

## Regra inicial de `PLAYER_WELCOME`

- `PLAYER_WELCOME` representa evento social automático de apresentação/boas-vindas de jogador.
- Pode usar banner/template pré-configurado.
- Deve aceitar comentários para iniciar a resenha.
