---
title: Screen: Welcome
status: Draft
version: 0.1.3
owner: Product Architecture
last_update: 2026-07-07
related_documents:
  - ../../Domain/Identity.md
  - ../../ADR/ADR_004_Account_User_Player_Separation.md
  - ../../API/Auth_API.md
  - ../Naming_Conventions.md
  - Login.md
  - Sign_Up.md
  - Phone_Otp.md
---

# Screen: Welcome

## Objetivo

Primeira tela na abertura do app. Apresenta a proposta de valor e oferece os caminhos de entrada social, telefone, e-mail ou exploracao sem conta. Componente: `WelcomeScreen`.

## Modelo de entrada

Explorar e permitido sem conta; qualquer acao que gere dado, como criar time, registrar partida, reagir, comentar, seguir ou reivindicar player, dispara o gate de autenticacao (`AuthPromptSheet`). Ver "Eventos".

## Elementos

- Logo e nome do produto.
- Tagline de valor (via i18n).
- Slides de valor opcionais (registrar jogo, montar time, compartilhar resenha).
- Botao "Continuar com Google".
- Botao "Continuar com Apple" visivel apenas no iOS.
- Botao "Continuar com telefone" atras de feature flag; desativado no lancamento atual. Quando habilitado no futuro, o envio do codigo sera por WhatsApp.
- Botao "Continuar com e-mail".
- Link discreto "Explorar sem entrar".
- Aviso de aceite sob os botoes: "Ao continuar, voce aceita os Termos de Uso e a Politica de Privacidade", com links.

## Campos

Nenhum campo de entrada. Tela de navegacao e decisao.

## Regras de UX

- Botoes sociais primeiro; telefone e e-mail em seguida.
- Apple renderizado condicionalmente por plataforma (`Platform.OS === 'ios'`); exigido pela App Store no iOS quando houver outro login social.
- O lancamento atual ativa Google, Apple (iOS) e e-mail; login por telefone via WhatsApp fica fora do lancamento e oculto por feature flag.
- "Explorar sem entrar" visivel, porem discreto, sem competir com os CTAs de entrada.
- Todo texto via camada de i18n; respeitar tema e modo de linguagem.
- Nenhuma cor fixa: usar tokens de tema.
- O fluxo social deve mapear para `POST /api/v1/auth/social/start` e `POST /api/v1/auth/social/complete`.
- O fluxo de telefone deve mapear para `POST /api/v1/auth/phone/request-code` e `POST /api/v1/auth/phone/verify-code` quando a feature flag estiver ativa.
- `Continuar com e-mail` abre `LoginScreen`; a criação de conta por e-mail acontece em `SignUpScreen`, acessada a partir de `LoginScreen`.
- No primeiro acesso social ou por telefone, o aceite exibido aqui deve ser propagado ao endpoint de conclusao do auth como `terms_accepted = true`, para persistir `public.users.terms_accepted_at`.
- Depois da criacao da sessao, a decisao entre Home e `Complete Profile` deve seguir `GET /api/v1/me -> onboarding.requires_complete_profile`.

## Estados

- loading: durante handshake OAuth ou redirecionamento.
- error: falha de OAuth, cancelamento pelo usuario ou rede indisponivel.
- offline: autenticacao indisponivel; permitir "Explorar sem entrar" e desabilitar botoes de login com aviso.
- success: sessao criada; a aplicacao consulta `GET /api/v1/me` e redireciona para `Complete Profile` quando `onboarding.requires_complete_profile = true`, caso contrario segue para a Home.

## Eventos

- Selecao de provedor de login inicia o fluxo correspondente (`Login`, `Phone_Otp` ou OAuth nativo).
- "Explorar sem entrar" entra em modo somente leitura.
- Acao restrita em modo explorar dispara `AuthPromptSheet`.
