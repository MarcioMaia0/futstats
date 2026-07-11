---
title: Table Spec reactions
status: Draft
version: 1.0.0
owner: Product Architecture
last_update: 2026-07-07
related_documents:
  - Table_Spec_comments.md
  - ../../ADR/ADR_005_UI_Language_Modes.md
  - ../../Frontend/Naming_Conventions.md
---

# Table Spec reactions

## Objetivo

Especificar `reactions` — reações a comentários, em dialeto várzea/resenha.

## Campos sugeridos

- `id` (uuid, PK)
- `comment_id` (uuid, FK → `comments.id`)
- `user_id` (uuid, FK → `users.id`)
- `reaction_type` (enum `reaction_type`)
- `created_at`

## Enums

- `reaction_type` (inicial, crescerá): `NAILED_IT` (Mitou), `TALKING_NONSENSE` (Falando groselha), `OFF_TOPIC` (Viajando). Valor canônico; o rótulo é resolvido pelo modo de linguagem (ADR 005).

## Regras

- Uma reação por pessoa por comentário (`unique (comment_id, user_id)`); reagir de novo substitui.
- Exibir contagem agregada; ao tocar, mostrar quem reagiu (estilo WhatsApp).
- Reações podem ser desabilitadas por time (configuração do time / `team_settings`).
- Moderação da diretoria (ocultar/bloquear) se aplica a abuso de reação.

