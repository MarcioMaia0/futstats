---
title: Table Spec social_connection_secrets
status: Draft
version: 1.0.0
owner: Product Architecture
last_update: 2026-07-16
related_documents:
  - Table_Spec_team_social_connections.md
  - Table_Spec_person_social_connections.md
  - ../../API/Teams_API.md
---

# Table Spec social_connection_secrets

## Objetivo

Especificar `social_connection_secrets`, usada para armazenar com seguranca as credenciais sensiveis ligadas a conexoes sociais.

## Finalidade

Separar do registro principal de conexao:

- token de acesso;
- token de refresh;
- metadados operacionais de segredo;
- ciclo de revogacao e uso.

## O que esta tabela e

- um cofre tecnico de credenciais referenciado por `*_token_ref`;
- uma estrutura reutilizavel para conexoes sociais de time e de pessoa;
- uma tabela privada de backend, nunca de leitura publica do app.

## O que esta tabela nao e

- fonte de verdade da identidade publica da conta social;
- lugar para handle, URL publica ou preferencia de publicacao;
- tabela de historico de tentativas de distribuicao.

## Campos

- `id` (uuid, PK)
- `secret_ref` (text, unique, not null)
- `platform` (enum `social_platform`, not null)
- `secret_kind` (enum `social_secret_kind`, not null)
- `encrypted_secret` (text, not null)
- `key_version` (text, nullable)
- `metadata` (jsonb, not null, default `{}`)
- `created_by_user_id` (uuid, FK -> `users.id`, nullable)
- `last_used_at` (timestamptz, nullable)
- `revoked_at` (timestamptz, nullable)
- `created_at`
- `updated_at`

## Enums

- `social_secret_kind`
  - `ACCESS_TOKEN`
  - `REFRESH_TOKEN`

## Regras

- `encrypted_secret` nunca pode guardar segredo em texto puro.
- `secret_ref` e o identificador opaco exposto para tabelas de dominio como `team_social_connections`.
- `secret_ref` deve ser estavel o suficiente para permitir rotacao por troca de referencia.
- `key_version` deve permitir rastrear qual chave de criptografia foi usada.
- `revoked_at` marca segredo inutilizavel sem exigir remocao fisica imediata.
- `last_used_at` serve apenas para observabilidade operacional.
- o app cliente autenticado nao deve ter leitura direta dessa tabela.

## Relacoes

- `team_social_connections.access_token_ref -> social_connection_secrets.secret_ref`
- `team_social_connections.refresh_token_ref -> social_connection_secrets.secret_ref`
- futuro:
  - `person_social_connections.access_token_ref -> social_connection_secrets.secret_ref`
  - `person_social_connections.refresh_token_ref -> social_connection_secrets.secret_ref`

## Observacoes de implementacao

- a criptografia pode acontecer antes da persistencia, no backend.
- a tabela pode conviver com provider-specific secret stores no futuro, desde que `secret_ref` continue sendo a referencia canonica para o dominio.
