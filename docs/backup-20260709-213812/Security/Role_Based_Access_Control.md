---
title: Role Based Access Control
status: Draft
version: 0.9.0
owner: Product Architecture
last_update: 2026-07-06
---

# Role Based Access Control


## Objetivo

Definir controle de acesso por papéis.

## Papéis

- `TEAM_OWNER`
- `TEAM_MANAGER`
- `COACH`
- `PLAYER`
- `ANALYST`
- `SUPPORTER`
- `REFEREE`
- `ADMIN`

## Regras

1. Permissão é contextual.
2. Dono do time pode delegar.
3. Atleta não pode editar estatística oficial sem permissão.
4. Torcedor não pode acessar dados privados.
