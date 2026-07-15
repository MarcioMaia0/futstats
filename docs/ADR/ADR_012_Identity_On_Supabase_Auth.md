---
title: ADR 012 Identity On Supabase Auth
status: Draft
version: 1.1.0
owner: Product Architecture
last_update: 2026-07-14
related_documents:
  - ADR_004_Account_User_Player_Separation.md
  - ../Domain/Identity.md
  - ../Implementation/Database/Table_Spec_accounts.md
  - ../Implementation/Database/Table_Spec_users.md
  - ../Implementation/Database/Table_Spec_persons.md
  - ../Implementation/Database/Table_Spec_players.md
---

# ADR 012: Identity On Supabase Auth

## Status

Draft

## Contexto

A ADR 004 define a separação conceitual entre conta (`account`), usuário (`user`), pessoa (`person`) e jogador (`player`).

A stack usa Supabase, que mantém a tabela `auth.users` no schema `auth` com credenciais, identidades de provider e verificações. Era preciso decidir como a camada de conta se materializa no FUTSTATS: uma tabela `accounts` própria ou o uso direto de `auth.users`.

Também ficou definido que a pessoa real do produto não é o usuário autenticado nem o jogador. A pessoa real é representada por `persons`.

## Decisão

1. Não haverá tabela `accounts` própria no schema `public`.
2. A camada conceitual de conta (`account`) será materializada por `auth.users` do Supabase.
3. A tabela `public.users` referencia `auth.users` em relação 1:1, usando `users.id = auth.users.id`.
4. A tabela `public.users` representa a presença autenticada da pessoa na plataforma, não a pessoa canônica.
5. A pessoa canônica fica em `persons`.
6. A ligação física entre usuário (`users`) e pessoa (`persons`) acontece por `users.person_id -> persons.id`.
7. Jogador (`players`) não se vincula diretamente a `users`.
8. Jogador (`players`) se vincula a pessoa (`persons`) por `players.person_id -> persons.id`.
9. A ponte correta entre usuário autenticado e jogador é indireta: `auth.users -> public.users -> persons -> players`.
10. Enum canônico `auth_provider`: `EMAIL | GOOGLE | APPLE | PHONE`. WhatsApp não é provider; é canal do `PHONE`.
11. Account linking por e-mail verificado é suportado no estado atual do produto: ao entrar com Google/Apple cujo e-mail verificado coincida com uma conta existente, as identidades podem ser vinculadas evitando conta duplicada.
12. No sentido inverso, novo e-mail/senha ainda não verificado coincidindo com conta existente exige confirmação de posse antes de qualquer vínculo.
13. Dados de app que não pertencem à credencial, como `terms_accepted_at`, ficam em `public.users`.

## Regra De Separação

O FUTSTATS deve tratar as camadas assim:

```text
auth.users
  -> public.users
    -> persons
      -> players
```

Onde:

- `auth.users` é a conta de autenticação;
- `public.users` é a presença autenticada da pessoa no app;
- `persons` é a pessoa real/canônica;
- `players` é a identidade esportiva opcional dessa pessoa.

## Reivindicação De Histórico

Quando uma pessoa entra no app e reivindica histórico esportivo criado operacionalmente por um time:

- o sistema não deve anexar `user_id` diretamente em `players`;
- o sistema deve consolidar a identidade em torno de `persons` e `players.person_id`;
- se necessário, registros esportivos operacionais devem ser reatribuídos ao `player` canônico da pessoa real;
- o histórico esportivo deve sobreviver à exclusão ou desativação da presença autenticada (`public.users`).

## Consequências

- Menos duplicação e menor risco de descompasso com Supabase Auth.
- A separação conceitual é preservada: `auth.users` = conta, `public.users` = presença no app, `persons` = pessoa real, `players` = identidade esportiva.
- Sair do Supabase continua sendo um esforço de migração de credenciais, pois as credenciais vivem em `auth.users` de qualquer forma.
- Dados de perfil de plataforma, como `display_name`, `username`, `avatar_url`, `contact_phone` e aceite de termos, permanecem sob controle da aplicação em `public.users`.
- Dados canônicos da pessoa, como `full_name`, `nickname`, `avatar_media_id` e `search_name`, ficam em `persons`.
- Dados esportivos ficam em `players` e tabelas filhas.
- Account linking por e-mail verificado evita contas duplicadas.
- A condição de posse verificada evita tomada de conta.

## O Que Não Deve Ser Implementado

- Não criar tabela `accounts` própria no schema `public`.
- Não criar FK direta de `users` para `players`.
- Não criar FK direta de `players` para `users`.
- Não tratar `public.users` como a pessoa real.
- Não criar `player` automaticamente apenas porque a pessoa fez login.
- Não apagar `persons`, `players` ou histórico esportivo quando a conta autenticada for desativada.
