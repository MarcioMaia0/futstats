---
title: Table Spec comments
status: Draft
version: 1.0.0
owner: Product Architecture
last_update: 2026-07-07
related_documents:
  - Table_Spec_reactions.md
  - Table_Spec_team_blocks.md
  - ../../ADR/ADR_005_UI_Language_Modes.md
---

# Table Spec comments

## Objetivo

Especificar `comments` — comentários no feed, com respostas em thread e ocultação moderada.

## Campos sugeridos

- `id` (uuid, PK)
- `post_id` (uuid, FK → `posts.id`)
- `author_user_id` (uuid, FK → `users.id`)
- `parent_comment_id` (uuid, FK → `comments.id`, nullable) — resposta em thread
- `body` (text)
- `hidden_by_user_id` (uuid, FK → `users.id`, nullable)
- `hidden_at` (timestamptz, nullable)
- `hidden_reason_code` (enum `hidden_reason`, nullable)
- `created_at`, `updated_at`
- `deleted_at` (nullable, soft delete)

## Enums

- `hidden_reason`: lista curada de mensagens prontas da diretoria (ex.: `NONSENSE`, `COOL_OFF`, `OFF_TOPIC`). Código canônico; o rótulo ("vai esfriar a cabeça") é resolvido pelo modo de linguagem (ADR 005).

## Regras

- `parent_comment_id` = resposta; responder ou mencionar gera notificação ao autor original (ver `notifications`).
- Ocultar é soft: preenche `hidden_*`. O conteúdo fica invisível para torcida/jogadores, que veem o placeholder com o `hidden_reason_code` renderizado; **diretores do mesmo time veem o conteúdo + `hidden_by`** (transparência de moderação).
- `hidden_reason_code` é mensagem pronta curada (não texto livre), para evitar exposição/humilhação.

