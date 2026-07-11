---
title: Screen: Complete Profile
status: Draft
version: 0.1.2
owner: Product Architecture
last_update: 2026-07-07
related_documents:
  - ../../Domain/Identity.md
  - ../../ADR/ADR_004_Account_User_Player_Separation.md
  - ../../API/Auth_API.md
  - Welcome.md
  - Phone_Otp.md
---

# Screen: Complete Profile

## Objetivo

Capturar o handle publico e o nome de exibicao logo apos o primeiro auth via social ou telefone. Componente: `CompleteProfileScreen`. Passo minimo, sem pedir dados alem do necessario.

## Elementos

- Saudacao de boas-vindas.
- Campo de username.
- Campo de nome de exibicao.
- Botao "Continuar".

## Campos

- `username` - obrigatorio, unico, com verificacao de disponibilidade. Origem: `public.users.username`.
- `display_name` - obrigatorio, pre-preenchido com o nome do provedor social quando houver. Origem: `public.users.display_name`.

## Regras de UX

- Exibida sempre que `GET /api/v1/me` retornar `onboarding.requires_complete_profile = true`.
- Isso normalmente acontece em login social ou telefone para conta nova, porque o `username` nunca vem do provedor.
- Em login por e-mail, os dados ja foram coletados na `Auth`, entao esta tela deve ser pulada.
- Se o login apenas vincular a uma conta ja existente, esta tela deve ser pulada.
- Se a sessao for restaurada e o perfil minimo ainda estiver incompleto, a aplicacao deve voltar para esta tela antes da Home.
- `username` usa a mesma validacao e a mesma verificacao de disponibilidade da tela `Auth`.
- Nao pedir foto, apelido esportivo, posicao ou time favorito aqui; tudo isso fica para depois.
- Textos via i18n; tokens de tema.

## Estados

- loading: salvando.
- error: validacao ou rede.
- success: perfil minimo completo e redirecionamento para a Home.

## Eventos

- Salvar submete `POST /api/v1/auth/complete-profile`.
- Consulta de disponibilidade de `username` usa `GET /api/v1/auth/username-availability`.
- Salvar atualiza `public.users.username` e `public.users.display_name`.
