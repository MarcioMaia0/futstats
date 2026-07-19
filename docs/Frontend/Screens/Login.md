---
title: Screen: Login
status: Draft
version: 0.1.0
owner: Product Architecture
last_update: 2026-07-17
related_documents:
  - ../../Domain/Identity.md
  - ../../ADR/ADR_004_Account_User_Player_Separation.md
  - ../../Security/Auth_Security.md
  - ../../API/Auth_API.md
  - Welcome.md
  - Forgot_Password.md
  - Complete_Profile.md
  - Sign_Up.md
---

# Screen: Login

## Objetivo

Autenticar uma conta existente pelo caminho de e-mail e senha. Componente: `LoginScreen`.

## Elementos

- título e contexto visual de entrada;
- campo de e-mail;
- campo de senha;
- botão primário `Entrar`;
- link `Esqueci a senha`;
- link para `Criar conta`;
- link para voltar à `Welcome`.

## Campos

- `email` - obrigatório, formato de e-mail. Origem: `auth.users.email`.
- `password` - obrigatório. Nunca persistido em claro.

## Regras de UX

- validação inline;
- mensagem neutra para credenciais inválidas;
- textos via i18n;
- usar tokens de tema;
- a tela não deve exibir campos de cadastro;
- depois de `sign-in`, a decisão entre Home e `Complete Profile` deve seguir `GET /api/v1/me -> onboarding.requires_complete_profile`.

## Estados

- loading: durante submit.
- error: credencial inválida, rate limit ou falha de rede.
- offline: submit indisponível, com aviso.
- success: sessão criada; a aplicação consulta `GET /api/v1/me` e redireciona para `Complete Profile` quando `onboarding.requires_complete_profile = true`, caso contrário segue para a Home.

## Eventos

- entrar submete `POST /api/v1/auth/sign-in`.

## Regras de navegação

- `Esqueci a senha` abre `ForgotPasswordScreen`.
- `Criar conta` abre `SignUpScreen`.
- voltar retorna para `WelcomeScreen`.
