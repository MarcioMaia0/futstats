---
title: Table Spec accounts
status: Draft
version: 1.0.0
owner: Product Architecture
last_update: 2026-07-07
related_documents:
  - ../../ADR/ADR_012_Identity_On_Supabase_Auth.md
  - ../../ADR/ADR_004_Account_User_Player_Separation.md
  - Table_Spec_users.md
---

# Table Spec accounts

## Objetivo

Documentar a camada de conta (autenticação) do FUTSTATS.

## Decisão de modelagem (Opção A)

Não há tabela `accounts` própria. A camada de conta é o `auth.users` do Supabase (schema `auth`, gerido pelo Supabase). A tabela `public.users` referencia `auth.users` 1:1. Ver `ADR_012_Identity_On_Supabase_Auth.md`.

## Campos gerenciados pelo Supabase (auth.users)

- `id` (uuid) — referenciado por `users.id`.
- `email` (nullable) — nulo em login por telefone/social.
- `phone` (nullable) — nulo em login por e-mail/social.
- `encrypted_password` — apenas provider `EMAIL`.
- identidades de provider (`auth.identities`) — `GOOGLE`, `APPLE`.
- `email_confirmed_at`, `phone_confirmed_at`.
- `last_sign_in_at`, `created_at`.

## Enum auth_provider

`EMAIL | GOOGLE | APPLE | PHONE`. WhatsApp não é provider; é canal do `PHONE`.

## Campos de app (fora do auth.users)

- `terms_accepted_at` → em `public.users`.

## Regras

- Não confundir account (`auth.users`) com user (`public.users`) nem com player.
- Provider externo único por provedor; um provider por conta no MVP.
- Desativação/exclusão de conta não apaga histórico: players preservam registros com o vínculo de user anulado (regra central da ADR 004).

