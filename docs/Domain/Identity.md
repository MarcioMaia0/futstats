---
title: Identity Domain
status: Draft
version: 0.3.0
owner: Product Architecture
last_update: 2026-07-06
related_documents: []
---

# Identity Domain

## Objetivo

Separar autenticação, usuário, atleta, árbitro e papéis.

## Conceitos

- `account`: autenticação.
- `user`: pessoa na plataforma.
- `player`: perfil esportivo.
- `referee`: perfil de arbitragem.
- `role`: papel contextual.

## Regras

1. User não é necessariamente player.
2. Player pode existir sem conta.
3. Usuário pode ter vários papéis.
4. Papel é contextual por time.
5. Histórico esportivo deve sobreviver à saída de membros.

## Fluxos

- Primeiro acesso casual.
- Cadastro de atleta.
- Criação de time por diretor.
- Reivindicação de perfil.

## Impacto técnico

Tabelas prováveis: `accounts`, `users`, `roles`, `user_team_roles`, `players`, `referees`.

## Mapeamento Supabase

A camada `account` é o `auth.users` do Supabase; `public.users` referencia-o 1:1 (sem tabela `accounts` própria). Enum `auth_provider`: `EMAIL | GOOGLE | APPLE | PHONE`. Torcedor (visitante sem registro) tem leitura pública do macro; interação social exige conta. Ver `../ADR/ADR_012_Identity_On_Supabase_Auth.md`.
