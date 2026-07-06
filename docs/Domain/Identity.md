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
