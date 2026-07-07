---
title: Screen: Welcome
status: Draft
version: 0.1.0
owner: Product Architecture
last_update: 2026-07-07
related_documents:
  - ../../Domain/Identity.md
  - ../../ADR/ADR_004_Account_User_Player_Separation.md
  - ../../API/Auth_API.md
  - ../Naming_Conventions.md
  - Auth.md
  - Phone_Otp.md
---

# Screen: Welcome

## Objetivo

Primeira tela na abertura do app. Apresenta a proposta de valor e oferece os caminhos de entrada (social, telefone, e-mail) ou explorar o app sem conta. Componente: `WelcomeScreen`.

## Modelo de entrada

Explorar é permitido sem conta; qualquer ação que gere dado (criar time, registrar partida, reagir, comentar, seguir, reivindicar player) dispara o gate de autenticação (`AuthPromptSheet`). Ver "Eventos".

## Elementos

- Logo e nome do produto.
- Tagline de valor (via i18n).
- Slides de valor opcionais (registrar jogo, montar time, compartilhar resenha).
- Botão "Continuar com Google".
- Botão "Continuar com Apple" — visível apenas no iOS.
- Botão "Continuar com telefone".
- Botão "Continuar com e-mail".
- Link discreto "Explorar sem entrar".
- Rodapé com links de Termos de Uso e Política de Privacidade.

## Campos

Nenhum campo de entrada. Tela de navegação/decisão.

## Regras de UX

- Botões sociais primeiro; telefone e e-mail em seguida.
- Apple renderizado condicionalmente por plataforma (`Platform.OS === 'ios'`); exigido pela App Store no iOS quando há outro login social.
- "Explorar sem entrar" visível, porém discreto — não competir com os CTAs de entrada.
- Todo texto via camada de i18n; respeitar tema e modo de linguagem.
- Nenhuma cor fixa: usar tokens de tema.

## Estados

- loading: durante handshake OAuth/redirecionamento.
- error: falha de OAuth, cancelamento pelo usuário, ou rede indisponível.
- offline: autenticação indisponível — permitir "Explorar sem entrar", desabilitar botões de login com aviso ("conecte-se para entrar").
- success: sessão criada — redireciona para completar perfil (se faltar `display_name`) ou para a Home.

## Eventos

- Seleção de provedor de login inicia o fluxo correspondente (`Auth`, `Phone_Otp`, OAuth nativo).
- "Explorar sem entrar" entra em modo somente-leitura.
- Ação restrita em modo explorar dispara `AuthPromptSheet` (componente de gate contextual, a especificar em Components).
