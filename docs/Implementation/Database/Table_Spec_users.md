---
title: Table Spec users
status: Draft
version: 1.0.0
owner: Product Architecture
last_update: 2026-07-07
related_documents:
  - ../../ADR/ADR_012_Identity_On_Supabase_Auth.md
  - Table_Spec_accounts.md
---

# Table Spec users

## Objetivo

Especificar tabela `users`.

## Finalidade

Representar a pessoa dentro da plataforma. Referencia o `auth.users` do Supabase 1:1 (ver `ADR_012_Identity_On_Supabase_Auth.md`).

## Campos sugeridos

- `id` (uuid, PK, referencia `auth.users.id`)
- `username` (text, único, obrigatório) — handle público (`@usuario`)
- `display_name` (text, obrigatório)
- `nickname` (text, nullable) — apelido/alias exibido conforme as preferências de nome
- `avatar_url` (text, nullable)
- `contact_phone` (text, nullable) — telefone de contato opcional, não verificado; distinto do telefone de auth (`auth.users.phone`, usado no login por OTP)
- `region_state` (text, nullable)
- `region_city` (text, nullable)
- `region_zone` (text, nullable) — apenas para cidades grandes com divisão por zona
- `terms_accepted_at` (timestamptz)
- `created_at`
- `updated_at`
- `deleted_at` (nullable, soft delete)

## Regras

- User pode não ser player; relação `users` ↔ `players` é 1:1 nullable, via claim.
- `username` é único e obrigatório no cadastro (handle público para o social); nunca vem do provedor.
- `nickname` (apelido) é atributo da pessoa em `users`; sua exibição por audiência é controlada em `user_preferences`.
- Preferências (idioma/tema), visibilidade de perfil e exibição de nome ficam em `user_preferences` (1:1).
- `contact_phone` é opcional e não verificado; não é o telefone de auth (login por OTP). Se um dia servir para recuperação/2FA, exigirá verificação.
- Região é opcional e informada manualmente (sem GPS; sem inferência de time, que geraria dado falso para torcedores).
- Soft delete preserva o histórico esportivo.

