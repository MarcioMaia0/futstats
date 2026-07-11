---
title: ADR 012 Identity On Supabase Auth
status: Draft
version: 1.0.0
owner: Product Architecture
last_update: 2026-07-07
related_documents:
  - ADR_004_Account_User_Player_Separation.md
  - ../Domain/Identity.md
  - ../Implementation/Database/Table_Spec_accounts.md
  - ../Implementation/Database/Table_Spec_users.md
---

# ADR 012: Identity On Supabase Auth

## Status

Draft

## Contexto

A ADR 004 define a separação conceitual Account/User/Player. A stack usa Supabase, que sempre mantém a tabela `auth.users` (gerida por ele) com credenciais, identidades de provider e verificação. Era preciso decidir como a camada de conta se materializa: uma tabela `accounts` própria ou o `auth.users` direto.

## Decisão

1. **Opção A**: não há tabela `accounts` própria. A camada de conta é o `auth.users` do Supabase. A tabela `public.users` referencia `auth.users` 1:1 (`users.id` = `auth.users.id`).
2. Enum canônico `auth_provider`: `EMAIL | GOOGLE | APPLE | PHONE`. WhatsApp não é provider — é canal do `PHONE`.
3. Account linking por e-mail verificado é suportado no MVP: ao entrar com Google/Apple (e-mail verificado pelo provider) cujo e-mail coincide com uma conta existente, as identidades são vinculadas automaticamente, evitando conta duplicada. No sentido inverso — novo e-mail/senha ainda não verificado coincidindo com conta existente — exigir a confirmação do e-mail (prova de posse) antes de vincular, para não abrir vetor de tomada de conta.
4. Relação `users` ↔ `players` é 1:1 nullable, estabelecida pela reivindicação (claim).
5. Soft delete em `users`; ao excluir a conta, os `players` preservam os registros com o vínculo de user anulado (regra central da ADR 004).
6. Dados de app que não pertencem à credencial (ex.: `terms_accepted_at`) ficam em `public.users`.

## Consequências

- Menos duplicação e sem descompasso de sincronização; padrão idiomático do Supabase.
- A separação conceitual das três camadas é preservada: `auth.users` = account, `public.users` = user, `players` = player.
- Portabilidade: sair do Supabase é um esforço de migração de credenciais em qualquer modelagem, pois as credenciais vivem em `auth.users` de todo modo. A Opção B não reduziria esse custo.
- Os dados de perfil (display_name, username, avatar) permanecem 100% sob controle da aplicação em `public.users`.
- Account linking por e-mail verificado evita contas duplicadas; a condição de posse verificada evita tomada de conta.
