---
title: Screen: Privacy Settings
status: Draft
version: 0.1.0
owner: Product Architecture
last_update: 2026-07-07
related_documents:
  - Settings.md
  - ../../Security/Privacy_Model.md
  - ../../Implementation/Database/Table_Spec_user_preferences.md
  - ../../Implementation/Database/Table_Spec_users.md
  - ../../UX/UX_Principles.md
---

# Screen: Privacy Settings

## Objetivo

Sub-tela de privacidade dentro de Settings: visibilidade do perfil, exibição de nome por audiência e região (opcional). Componente: `PrivacySettingsScreen`.

## Elementos

- Seletor de visibilidade do perfil: Todos / Seguidores / Integrantes do time.
- Exibição de nome por audiência: três seletores (Público, Seguidores, Time), cada um Nome / Apelido / Ambos.
- Seção Região (opcional): seletores dependentes estado → cidade → zona (zona apenas para cidades grandes com divisão por zona).

## Campos

- `profile_visibility` — enum `PUBLIC | FOLLOWERS | TEAM_MEMBERS`. Origem: `user_preferences.profile_visibility`.
- `name_display_public` / `name_display_followers` / `name_display_team` — enum `NAME | NICKNAME | BOTH`. Origem: `user_preferences`.
- `region_state`, `region_city`, `region_zone` — opcionais. Origem: `users`.

## Regras de UX

- Visibilidade default `PUBLIC` (perfil aberto a todos).
- Região é opcional e informada manualmente (sem GPS, sem inferência de time); seleção dependente estado → cidade → zona; zona só aparece para cidades grandes.
- Nunca mencionar anúncios/publicidade na copy; enquadrar o valor em experiência e em conteúdo/times/pessoas próximos (ver `UX_Principles.md`).
- Um modal pode oferecer o preenchimento de região após 15 dias do primeiro login; se recusado ("não perguntar novamente"), grava `user_preferences.region_prompt_dismissed_at` e não repete.
- Textos via i18n; tokens de tema.

## Estados

- loading: carregando/salvando preferências.
- error: falha ao salvar.
- offline: alterações indisponíveis, com aviso.
- success: preferência salva.

## Eventos

- Salvar atualiza `user_preferences` e/ou os campos de região em `users`.
