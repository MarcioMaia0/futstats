---
title: Table Spec persons
status: Draft
version: 1.0.0
owner: Product Architecture
last_update: 2026-07-09
related_documents:
  - Table_Spec_users.md
  - Table_Spec_players.md
  - ../../Domain/Identity.md
---

# Table Spec persons

## Objetivo

Especificar `persons`: identidade canônica de pessoa no ecossistema FUTSTATS.

## Finalidade

Representar a pessoa-base sobre a qual outras identidades se apoiam, como:

- `users` para presença na plataforma;
- `players` para identidade esportiva.

Uma `person` pode existir:

- sem conta;
- com conta;
- sem perfil esportivo;
- com perfil esportivo;
- como registro rápido de atleta avulso;
- como técnico ou outra pessoa operacional sem login.

## Campos sugeridos

- `id` (uuid, PK)
- `full_name` (text, nullable)
- `nickname` (text, not null)
- `avatar_media_id` (uuid, FK -> `media_assets.id`, nullable)
- `search_name` (text, not null)
- `created_at`
- `updated_at`

## Regras

- `nickname` é obrigatório na persistência final.
- `full_name` é opcional no cadastro rápido.
- Se vier apenas `nickname`:
  - `nickname` recebe o valor informado;
  - `full_name` pode ficar nulo.
- Se vier apenas `full_name`:
  - `full_name` recebe o valor informado;
  - `nickname` deve receber o mesmo valor.
- Se vierem `full_name` e `nickname`:
  - cada campo deve receber seu respectivo valor.
- `search_name` deve ser derivado/normalizado a partir dos nomes disponíveis para facilitar busca global e deduplicação assistida.
- `persons` não é autenticação.
- `persons` não é, por si só, identidade esportiva detalhada.
- `persons` pode existir sem `user`.
- `persons` pode existir sem `player`.

## Casos de uso diretos

- criação de conta:
  - cria `person` e depois `user`;
- cadastro rápido de atleta avulso:
  - cria `person` e depois `player`, sem `user`;
- técnico da partida:
  - pode apontar para `person` sem depender de conta;
- busca global de pessoas/atletas:
  - usa `nickname`, `full_name` e `search_name`.

## Relações esperadas

- `users.person_id`
  - obrigatório e único;
- `players.person_id`
  - obrigatório e único.

