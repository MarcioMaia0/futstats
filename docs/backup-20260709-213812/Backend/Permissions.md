---
title: Backend Permissions
status: Draft
version: 0.4.0
owner: Product Architecture
last_update: 2026-07-06
related_documents: []
---

# Backend Permissions

## Objetivo

Definir modelo de permissões.

## Princípio

Permissão é contextual. Um usuário pode ser diretor em um time e atleta em outro.

## Papéis

- `TEAM_OWNER`
- `TEAM_MANAGER`
- `COACH`
- `ANALYST`
- `PLAYER`
- `SUPPORTER`
- `REFEREE`
- `ADMIN`

## Exemplos de permissão

| Ação | Permissão |
|---|---|
| Editar time | TEAM_OWNER ou TEAM_MANAGER |
| Criar partida | TEAM_OWNER, TEAM_MANAGER ou COACH |
| Registrar scout | COACH ou ANALYST |
| Avaliar companheiro | PLAYER participante |
| Editar tema do time | TEAM_OWNER ou TEAM_MANAGER |

## Regra

Permissões devem ser validadas no backend, mesmo que o frontend esconda botões.
