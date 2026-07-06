---
title: API Overview
status: Draft
version: 0.4.0
owner: Product Architecture
last_update: 2026-07-06
related_documents: []
---

# API Overview

## Objetivo

Definir visão geral das APIs do FUTSTATS.

## Princípios

- REST simples inicialmente.
- Payloads em inglês.
- Erros padronizados.
- Versionamento.
- Permissões no backend.
- Recursos avançados opcionais.

## Versionamento

Rotas devem iniciar com:

```text
/api/v1
```

## Exemplo

```text
POST /api/v1/matches
GET /api/v1/teams/:teamId
POST /api/v1/matches/:matchId/goals
```
