---
title: Table Spec team_social_connections
status: Draft
version: 1.1.0
owner: Product Architecture
last_update: 2026-07-16
related_documents:
  - Table_Spec_team_settings.md
  - Table_Spec_social_connection_secrets.md
  - ../../API/Teams_API.md
  - ../../Domain/Social.md
---

# Table Spec team_social_connections

## Objetivo

Especificar `team_social_connections`: conexoes do time com plataformas sociais externas.

## Finalidade

Permitir que o time:

- vincule suas contas oficiais;
- controle quais plataformas estao aptas para publicacao;
- publique eventos do time simultaneamente no app e nas redes conectadas.

## Campos sugeridos

- `id` (uuid, PK)
- `team_id` (uuid, FK -> `teams.id`)
- `platform` (enum `social_platform`)
- `handle` (text, nullable)
- `channel_url` (text, nullable)
- `connection_status` (enum `social_connection_status`)
- `external_account_id` (text, nullable)
- `access_token_ref` (text, nullable) - referencia segura para credencial armazenada fora da tabela principal
- `refresh_token_ref` (text, nullable)
- `token_expires_at` (timestamptz, nullable)
- `publish_events_enabled` (boolean, default `false`)
- `last_validated_at` (timestamptz, nullable)
- `last_publish_at` (timestamptz, nullable)
- `created_by_user_id` (uuid, FK -> `users.id`, nullable)
- `created_at`
- `updated_at`

## Enums

- `social_platform`: `YOUTUBE | INSTAGRAM | TIKTOK`
- `social_connection_status`: `PENDING | CONNECTED | EXPIRED | REVOKED | ERROR`

## Regras

- Deve existir no maximo uma conexao por (`team_id`, `platform`) no estado atual do produto.
- `handle` e `channel_url` podem existir mesmo antes da conexao OAuth completa.
- Publicacao automatica so deve ocorrer quando:
  - `connection_status = CONNECTED`; e
  - `publish_events_enabled = true`.
- O banco deve impedir `publish_events_enabled = true` quando `connection_status <> CONNECTED`.
- Tokens nao devem ser persistidos em texto puro nesta tabela.
- `access_token_ref` e `refresh_token_ref` devem apontar para armazenamento seguro de segredos.
- `access_token_ref` e `refresh_token_ref` devem referenciar `social_connection_secrets.secret_ref` quando preenchidos.
- O time pode cadastrar ou editar os identificadores publicos das redes no fluxo de criacao sem concluir a conexao completa naquele momento.
- A conexao real com a plataforma pode ser finalizada depois em configuracoes do time.
