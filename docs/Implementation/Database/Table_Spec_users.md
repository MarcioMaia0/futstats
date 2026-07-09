---
title: Table Spec users
status: Draft
version: 1.2.0
owner: Product Architecture
last_update: 2026-07-09
related_documents:
  - ../../ADR/ADR_012_Identity_On_Supabase_Auth.md
  - ../../API/Auth_API.md
  - Table_Spec_persons.md
  - Table_Spec_accounts.md
---

# Table Spec users

## Objetivo

Especificar tabela `users`.

## Finalidade

Representar a presença de uma `person` dentro da plataforma. Referencia `auth.users` do Supabase em relacao 1:1.

## Campos sugeridos

- `id` (uuid, PK, referencia `auth.users.id`)
- `person_id` (uuid, FK -> `persons.id`, unico)
- `username` (text, unico, nullable durante onboarding) - handle publico (`@usuario`)
- `display_name` (text, nullable durante onboarding)
- `avatar_url` (text, nullable)
- `contact_phone` (text, nullable) - telefone de contato opcional, nao verificado; distinto do telefone de auth (`auth.users.phone`, usado no login por OTP)
- `region_state` (text, nullable)
- `region_city` (text, nullable)
- `region_zone` (text, nullable) - apenas para cidades grandes com divisao por zona
- `terms_accepted_at` (timestamptz)
- `start_path_completed_at` (timestamptz, nullable) - marca que a pessoa ja passou pela tela de intencao inicial
- `last_start_path_choice` (enum `start_path_choice`, nullable) - ultima escolha explicita feita na tela de intencao inicial
- `created_at`
- `updated_at`
- `deleted_at` (nullable, soft delete)

## Enums

- `start_path_choice`: `CREATE_TEAM | JOIN_TEAM | EXPLORE`

## Regras

- `users` representa a presenca daquela `person` na plataforma, e nao a identidade canonica base.
- `person_id` e obrigatorio e unico em `users`.
- Toda conta `user` deve apontar para uma `person`.
- User pode nao ser player; relacao efetiva passa a ser `persons` -> `players` 1:1 nullable.
- `username` e unico e obrigatorio no estado final do perfil minimo, mas pode nascer `null` durante onboarding social ou telefone ate a conclusao de `Complete Profile`.
- `display_name` e obrigatorio no estado final do perfil minimo, mas pode nascer `null` ou incompleto durante onboarding ate a conclusao de `Complete Profile`.
- `display_name` e nome de contexto da plataforma; nao substitui `persons.full_name` nem `persons.nickname`.
- Preferencias como idioma, tema, visibilidade de perfil e exibicao de nome ficam em `user_preferences` (1:1).
- `contact_phone` e opcional e nao verificado; nao e o telefone de auth. Se um dia servir para recuperacao ou 2FA, exigira verificacao.
- Regiao e opcional e informada manualmente, sem GPS nem inferencia de time.
- `start_path_completed_at` e `last_start_path_choice` nao definem tipo fixo de usuario; apenas registram a passagem pela etapa e a ultima escolha explicita conhecida.
- A aplicacao deve tratar `username` e `display_name` nulos como estado transitorio de onboarding, sinalizado por `GET /api/v1/me -> onboarding.requires_complete_profile = true`.
- Atualizacoes via API devem permitir patch parcial em `PATCH /api/v1/me` para os campos de perfil da pessoa, sem misturar preferencias nem papeis contextuais.
- Soft delete preserva o historico esportivo.
