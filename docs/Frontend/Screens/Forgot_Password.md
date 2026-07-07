---
title: Screen: Forgot Password
status: Draft
version: 0.1.0
owner: Product Architecture
last_update: 2026-07-07
related_documents:
  - ../../Security/Auth_Security.md
  - ../../API/Auth_API.md
  - Auth.md
---

# Screen: Forgot Password

## Objetivo

Recuperar o acesso do caminho de e-mail, enviando link/código de redefinição. Componente: `ForgotPasswordScreen`. Aplica-se apenas a contas com `auth_provider` = `EMAIL`.

## Elementos

- Campo de e-mail.
- Botão "Enviar link de recuperação".
- Mensagem de confirmação.
- Link para voltar à Auth.

## Campos

- `email` — obrigatório, formato de e-mail. Origem: `accounts.email`.

## Regras de UX

- Mensagem neutra por segurança: não revelar se o e-mail existe.
- Rate limit no envio (Auth Security).
- Textos via i18n; tokens de tema.

## Estados

- loading: enviando.
- success: confirmação neutra ("se o e-mail existir, enviamos as instruções").
- error: rede indisponível ou rate limit.
- offline: envio indisponível, com aviso.

## Eventos

- Envio dispara o fluxo de recuperação do Supabase Auth.
