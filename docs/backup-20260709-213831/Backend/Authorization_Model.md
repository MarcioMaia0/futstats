---
title: Authorization Model
status: Draft
version: 0.9.0
owner: Product Architecture
last_update: 2026-07-06
related_documents:
[]
---

# Authorization Model

## Objetivo

Definir autorização.

## Conceitos

- Permissão global.
- Permissão por time.
- Permissão por partida.
- Permissão por conteúdo.
- Dono do recurso.

## Exemplos

- Apenas diretor pode editar dados oficiais do time.
- Atleta pode editar seu perfil.
- Técnico pode lançar scout quando autorizado.
- Moderador pode ocultar conteúdo reportado.
- Usuário pode definir preferências pessoais.

## Regra

Autorização deve ser aplicada no backend, mesmo que o frontend oculte botões.
