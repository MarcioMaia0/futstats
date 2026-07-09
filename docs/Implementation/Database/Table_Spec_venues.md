---
title: Table Spec venues
status: Draft
version: 0.4.0
owner: Product Architecture
last_update: 2026-07-09
related_documents:
  - ../../Domain/Venues.md
  - Table_Spec_teams.md
---

# Table Spec venues

## Objetivo

Especificar tabela `venues`: locais e quadras de jogo.

## Finalidade

Representar locais usados por times e partidas, inclusive a quadra principal de um time quando existir.

## Campos sugeridos

- `id` (uuid, PK)
- `name` (text, obrigatorio)
- `owner_team_id` (uuid, FK -> `teams.id`, nullable)
- `created_by_user_id` (uuid, FK -> `users.id`, nullable)
- `region_state` (text, nullable)
- `region_city` (text, nullable)
- `region_zone` (text, nullable)
- `address_line` (text, nullable)
- `address_number` (text, nullable)
- `address_complement` (text, nullable)
- `postal_code` (text, nullable)
- `latitude` (numeric, nullable)
- `longitude` (numeric, nullable)
- `external_place_provider` (text, nullable)
- `external_place_id` (text, nullable)
- `surface_type` (enum `surface_type`, nullable)
- `coverage_type` (enum `coverage_type`, nullable)
- `created_at`
- `updated_at`

## Enums

- `surface_type`: `WOOD | CONCRETE | SYNTHETIC | SOCIETY | OTHER`
- `coverage_type`: `INDOOR | OUTDOOR | PARTIAL`

## Regras

- `name` e obrigatorio.
- `owner_team_id` e opcional, porque uma quadra pode ser neutra ou nao vinculada a um unico time.
- `created_by_user_id` e recomendavel para rastrear criacao em fluxos reutilizados, inclusive quando a quadra ainda nao estiver vinculada a um time.
- para o fluxo de criacao de time, a quadra principal pode ser criada com dados minimos.
- dados de piso e cobertura continuam opcionais.
- localidade macro da quadra usa:
  - `region_state`
  - `region_city`
  - `region_zone` opcional.
- endereco micro da quadra pode usar:
  - `address_line`
  - `address_number`
  - `address_complement`
  - `postal_code`
  - `latitude`
  - `longitude`.
- a quadra pode nascer com dados externos previamente encontrados em provedor de mapas.
- a primeira integração sugerida para busca inteligente é `Google Places`.
- a busca inteligente pode considerar:
  - nome da quadra;
  - nome do campo;
  - endereço.
- `external_place_provider` e `external_place_id` servem como referencia externa, nao como unica fonte de verdade.
- o sistema deve persistir copia local dos dados escolhidos, mesmo quando vierem de fonte externa.
- quando a busca externa encontrar um local, os dados continuam editaveis antes da persistencia final.
- se a busca externa nao encontrar o local, o cadastro manual continua obrigatoriamente disponivel.
- localidade deve ser compativel com autocomplete quando o produto suportar isso.
- o time pode existir sem quadra principal.
