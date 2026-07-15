---
title: Table Spec teams
status: Draft
version: 1.4.0
owner: Product Architecture
last_update: 2026-07-14
related_documents:
  - ../../API/Teams_API.md
  - Table_Spec_media_assets.md
  - Table_Spec_team_modalities.md
  - Table_Spec_team_settings.md
  - Table_Spec_user_team_roles.md
  - Table_Spec_venues.md
---

# Table Spec teams

## Objetivo

Especificar tabela `teams`.

## Finalidade

Representar times e sua identidade bÃ¡sica.

## Campos sugeridos

- `id` (uuid, PK)
- `name` (text, obrigatÃ³rio)
- `slug` (text, Ãºnico)
- `crest_media_id` (uuid, FK -> `media_assets.id`, nullable)
- `founded_year` (smallint, nullable)
- `founded_month` (smallint, nullable)
- `founded_day` (smallint, nullable)
- `first_color` (text, nullable)
- `second_color` (text, nullable)
- `third_color` (text, nullable)
- `home_match_capability` (enum `home_match_capability`, default `NOT_DEFINED_YET`)
- `region_state` (text, nullable)
- `region_city` (text, nullable)
- `region_zone` (text, nullable)
- `primary_venue_id` (uuid, FK -> `venues.id`, nullable)
- `created_by_user_id` (uuid, FK -> `users.id`)
- `created_at`
- `updated_at`

## Enums

- `home_match_capability`
  - `HAS_HOME_VENUE`
  - `NO_HOME_VENUE`
  - `NOT_DEFINED_YET`

## Regras

- `name` Ã© obrigatÃ³rio.
- `slug` Ã© tÃ©cnico e derivado; nÃ£o deve ser digitado pela pessoa no wizard.
- `crest_media_id` é opcional.
- `crest_media_id` aponta para o ativo final do escudo do time em `media_assets`.
- `crest_url` pode aparecer em respostas de API como URL de leitura derivada de `crest_media_id`, mas não deve ser a fonte canônica persistida em `teams`.
- `founded_year`, `founded_month` e `founded_day` representam a data histórica de fundação do time com precisão parcial quando necessário.
- o produto deve aceitar fundação conhecida apenas por ano.
- o produto deve aceitar fundação conhecida por mês e ano.
- o produto deve aceitar fundação conhecida por dia, mês e ano.
- `founded_month` não deve existir sem `founded_year`.
- `founded_day` não deve existir sem `founded_month` e `founded_year`.
- `first_color`, `second_color` e `third_color` representam as cores oficiais do time.
- as cores oficiais sÃ£o opcionais.
- esse modelo conversa melhor com a linguagem real da vÃ¡rzea do que `primary/secondary/accent`.
- times podem ter duas ou trÃªs cores oficiais.
- quando nÃ£o preenchidas, as cores podem permanecer `null`.
- a ordem oficial das cores do time nÃ£o deve ser distorcida por necessidade de layout da interface.
- `teams` nÃ£o deve limitar o time a uma Ãºnica modalidade operacional.
- as modalidades preferenciais do time devem ser persistidas em `team_modalities`, e não em uma única coluna singular em `teams`.
- `home_match_capability` representa a capacidade estrutural do time de mandar jogos, e nÃ£o o papel do time em uma partida especÃ­fica.
- `primary_venue_id` Ã© opcional.
- tÃ©cnico padrÃ£o do time nÃ£o deve ser persistido em `teams`; esse contrato pertence a `team_staff_defaults`, apontando para `person_id`.
- `created_by_user_id` registra quem concluiu a criaÃ§Ã£o.
- histÃ³rico pertence ao time.
- o time sÃ³ deve ser persistido ao final do wizard, nunca em etapas intermediÃ¡rias.
- ao remover um time, os registros dependentes diretos em `team_settings`, `team_modalities`, `team_social_connections`, `team_members`, `team_players`, `user_team_roles`, `team_join_requests` e `venues` com `owner_team_id` devem ser removidos em cascata.
- ao remover um time com `crest_media_id` preenchido, o ativo correspondente em `media_assets` com `purpose = 'TEAM_CREST'` deve ser removido pelo fluxo de limpeza do backend.

