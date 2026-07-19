---
title: Screen: Forgot Password
status: Draft
version: 0.1.2
owner: Product Architecture
last_update: 2026-07-07
related_documents:
  - ../../Security/Auth_Security.md
  - ../../API/Auth_API.md
  - Login.md
---

# Screen: Forgot Password

## Objetivo

Recuperar o acesso do caminho de e-mail, enviando link ou codigo de redefinicao. Componente: `ForgotPasswordScreen`. Aplica-se apenas a contas com `auth_provider = EMAIL`.

## Elementos

- Campo de e-mail.
- Botao "Enviar link de recuperacao".
- Mensagem de confirmacao.
- Link para voltar a Login.

## Campos

- `email` - obrigatorio, formato de e-mail. Origem: `auth.users.email`.

## Regras de UX

- Mensagem neutra por seguranca: nao revelar se o e-mail existe.
- Rate limit no envio.
- A tela descreve apenas a coleta do e-mail e a resposta esperada da UX; a regra oficial de recuperacao pertence a `POST /api/v1/auth/forgot-password`.
- Textos via i18n; tokens de tema.

## Estados

- loading: enviando.
- success: confirmacao neutra ("se o e-mail existir, enviamos as instrucoes").
- error: rede indisponivel ou rate limit.
- offline: envio indisponivel, com aviso.

## Eventos

- Envio submete `POST /api/v1/auth/forgot-password`.
- A tela nao decide existencia de conta nem politica de seguranca; isso pertence ao contrato da API.
