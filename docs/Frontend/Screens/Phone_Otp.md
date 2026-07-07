---
title: Screen: Phone OTP
status: Draft
version: 0.1.0
owner: Product Architecture
last_update: 2026-07-07
related_documents:
  - ../../Domain/Identity.md
  - ../../Security/Auth_Security.md
  - ../../API/Auth_API.md
  - Welcome.md
  - Complete_Profile.md
---

# Screen: Phone OTP

## Objetivo

Autenticar por telefone com código de uso único (OTP). Componente: `PhoneOtpScreen`. Fluxo em dois passos: informar telefone e verificar código.

## Dependência de provedor

O envio de código depende de um provedor externo contratado (o Supabase Auth não envia mensagem por conta própria). SMS via Twilio/MessageBird/Vonage; WhatsApp via WhatsApp Business API (ex.: Twilio Verify). Custo por mensagem em qualquer canal. A tela é agnóstica ao canal: trata "telefone" e "código", e SMS-vs-WhatsApp é configuração do provedor.

No MVP, o login por telefone (SMS e WhatsApp) fica construído porém atrás de feature flag, desativado no lançamento.

## Elementos

### Passo 1 — telefone

- Seletor de DDI/país.
- Campo de telefone.
- Botão "Enviar código".

### Passo 2 — código

- Campo de código de 6 dígitos.
- Botão "Verificar".
- Ação "Reenviar código" com cooldown.
- Ação "Editar número".

## Campos

- `phone` — obrigatório, formato E.164. Origem: `accounts.phone`.
- `otp_code` — obrigatório, 6 dígitos. Verificação bem-sucedida grava `accounts.phone_verified_at`.

## Regras de UX

- `auth_provider` gravado como `PHONE`.
- Cooldown de reenvio para evitar abuso; rate limit no envio (Auth Security).
- Autofill de OTP quando a plataforma suportar.
- Cadastro por telefone cria `account` + `user`; nunca cria `player`.
- Textos via i18n; tokens de tema.

## Estados

- loading: enviando código / verificando.
- error: número inválido, código incorreto, código expirado, rate limit.
- cooldown: reenvio temporariamente indisponível (contagem regressiva).
- offline: envio/verificação indisponível, com aviso.
- success: sessão criada → completar perfil (falta `display_name`, pois telefone não fornece nome) ou Home.

## Eventos

- Envio de código dispara chamada ao provedor.
- Verificação bem-sucedida cria/vincula `account` e `user`.
