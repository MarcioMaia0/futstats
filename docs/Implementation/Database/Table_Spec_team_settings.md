---
title: Table Spec team_settings
status: Draft
version: 1.2.0
owner: Product Architecture
last_update: 2026-07-09
related_documents:
  - Table_Spec_teams.md
  - Table_Spec_themes.md
  - Table_Spec_team_social_connections.md
  - ../../Domain/Experience.md
---

# Table Spec team_settings

## Objetivo

Especificar a tabela `team_settings`, usada para centralizar configuracoes de experiencia e defaults do time.

## Finalidade

Armazenar escolhas do time que afetam tema, linguagem e comportamento social padrao.

## Campos sugeridos

- `team_id` (uuid, PK, FK -> `teams.id`)
- `default_theme_id` (uuid, FK -> `themes.id`, nullable)
- `default_language_mode` (enum `language_mode`, nullable)
- `reactions_enabled` (boolean, default `true`)
- `comments_enabled` (boolean, default `true`)
- `public_feed_enabled` (boolean, default `true`)
- `default_publish_team_events` (boolean, default `false`)
- `ui_primary_color_source` (enum `team_color_source`, nullable)
- `ui_secondary_color_source` (enum `team_color_source`, nullable)
- `ui_background_color_source` (enum `team_color_source`, nullable)
- `created_at`
- `updated_at`

## Enums

- `team_color_source`
  - `FIRST_COLOR`
  - `SECOND_COLOR`
  - `THIRD_COLOR`

## Regras

- Existe no maximo uma linha por time.
- `default_theme_id` deve apontar para um tema `TEAM` do proprio time ou para um tema `SYSTEM`.
- `default_language_mode` define o tom padrao sugerido em experiencias do time, sem sobrescrever a preferencia pessoal do usuario.
- `reactions_enabled` e `comments_enabled` controlam interacoes sociais dentro do contexto do time.
- `public_feed_enabled` controla se resultados e posts do time podem aparecer em superfices publicas quando a politica de privacidade permitir.
- `default_publish_team_events` define a preferencia padrao do time para sugerir publicacao simultanea de eventos em canais conectados, sem substituir a decisao final de cada evento.
- `ui_primary_color_source`, `ui_secondary_color_source` e `ui_background_color_source` nao redefinem as cores oficiais do time.
- esses campos existem apenas para mapear como o app vai aplicar visualmente `first_color`, `second_color` e `third_color`.
- isso permite que a gestao preserve a ordem oficial das cores do time e, ao mesmo tempo, escolha a melhor combinacao visual para a interface.
- a tela de configuracao do time deve oferecer preview visual antes da persistencia final desse mapeamento.
