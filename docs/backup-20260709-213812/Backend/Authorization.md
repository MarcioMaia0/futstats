---
title: Authorization
status: Draft
version: 1.0.0
owner: Product Architecture
last_update: 2026-07-06
related_documents:
  []
---

# Authorization

## Objetivo

Definir autorização por contexto.

## Regras

1. Permissões são avaliadas por time.
2. Dono do time pode conceder papéis.
3. Atleta pode editar seu perfil, mas não estatísticas históricas.
4. Diretor pode editar jogos do time.
5. Conteúdo público respeita configurações de privacidade.
6. Admin da plataforma possui permissões globais.

## Exemplos

- `TEAM_OWNER`
- `TEAM_MANAGER`
- `COACH`
- `PLAYER`
- `ANALYST`
- `SUPPORTER`
