---
title: Table Spec local_opponents
status: Draft
version: 0.2.0
owner: Product Architecture
last_update: 2026-07-09
related_documents:
  - ../../Domain/Teams.md
  - ../../Domain/Matches.md
---

# Table Spec local_opponents

## Objetivo

Especificar tabela `local_opponents`, usada para adversarios cadastrados na agenda privada de um time.

## Finalidade

Permitir que um time registre memoria operacional sobre adversarios que podem ou nao existir como times oficiais dentro do app.

## Campos sugeridos

- `id` (uuid, PK)
- `team_id` (uuid, FK -> `teams.id`)
- `name` (text, not null)
- `crest_media_asset_id` (uuid, FK -> `media_assets.id`, nullable)
- `contact_name` (text, nullable)
- `contact_phone` (text, nullable)
- `notes` (text, nullable)
- `claimed_team_id` (uuid, FK -> `teams.id`, nullable)
- `created_at`
- `updated_at`

## Regras

- `local_opponents` pertence ao time que cadastrou o adversario.
- `local_opponents` nao cria automaticamente um `team` oficial no produto.
- o adversario local pode ser usado em:
  - agenda;
  - historico de confrontos;
  - operacao de partida;
  - memoria privada da diretoria.
- `claimed_team_id`, quando existir no futuro, representa que o historico daquele adversario local foi reivindicado por um time oficial.
- a existencia de `claimed_team_id` nao obriga que o mecanismo de reivindicacao esteja fechado agora.
- a reivindicacao futura deve preservar rastreabilidade entre:
  - quem cadastrou o adversario local;
  - qual time oficial reivindicou o historico;
  - quais confrontos anteriores passaram a ser lidos como pertencentes a esse time.
