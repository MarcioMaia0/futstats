---
title: State Management
status: Draft
version: 1.0.0
owner: Product Architecture
last_update: 2026-07-06
related_documents:
  []
---

# State Management

## Objetivo

Definir abordagem de estado no frontend.

## Tipos de estado

- Estado de servidor.
- Estado local de UI.
- Estado de sessão.
- Estado de formulário.
- Estado de tema/experiência.

## Regra

Dados persistentes vêm da API. Interface pode manter cache, mas não deve ser fonte da verdade.
