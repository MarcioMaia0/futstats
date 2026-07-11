---
title: Screen: Phone OTP
status: Draft
version: 0.1.4
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

Autenticar por telefone com codigo de uso unico (OTP). Componente: `PhoneOtpScreen`. Fluxo em dois passos: informar telefone e verificar codigo.

## Dependencia de provedor

O envio de codigo depende de um provedor externo contratado para WhatsApp, por exemplo WhatsApp Business API via Twilio Verify.

No produto, o canal previsto para OTP por telefone e `WHATSAPP`.

No lancamento atual, o login por telefone fica fora do fluxo visivel porque depende de servico pago. O fluxo pode permanecer documentado e implementado atras de feature flag, mas nao deve aparecer para o usuario neste recorte.

## Elementos

### Passo 1 - telefone

- Seletor de DDI ou pais.
- Campo de telefone.
- Botao "Enviar codigo".

### Passo 2 - codigo

- Campo de codigo de 6 digitos.
- Botao "Verificar".
- Acao "Reenviar codigo" com cooldown.
- Acao "Editar numero".

## Campos

- `phone` - obrigatorio, formato E.164. Origem: `auth.users.phone`.
- `channel` - valor tecnico enviado como `WHATSAPP`. Nao precisa ser exposto como campo editavel na UI.
- `otp_code` - obrigatorio, 6 digitos. Verificacao bem-sucedida grava `auth.users.phone_confirmed_at`.

## Regras de UX

- `auth_provider` gravado como `PHONE`.
- Cooldown de reenvio para evitar abuso; rate limit no envio.
- Autofill de OTP quando a plataforma suportar.
- Cadastro por telefone cria ou vincula `auth.users`, cria ou vincula `persons`, cria perfil minimo em `public.users`; nunca cria `player`.
- No primeiro acesso, o fluxo deve propagar `terms_accepted = true` para a verificacao do codigo.
- O canal da UX e sempre WhatsApp quando o recurso estiver habilitado; nao ha seletor de canal no estado atual do produto.
- Depois da verificacao bem-sucedida, a decisao entre Home e `Complete Profile` deve seguir `GET /api/v1/me -> onboarding.requires_complete_profile`.
- Textos via i18n; tokens de tema.

## Estados

- loading: enviando codigo ou verificando.
- error: numero invalido, codigo incorreto, codigo expirado ou rate limit.
- cooldown: reenvio temporariamente indisponivel.
- offline: envio ou verificacao indisponivel, com aviso.
- success: sessao criada; a aplicacao consulta `GET /api/v1/me` e redireciona para `Complete Profile` quando `onboarding.requires_complete_profile = true`, caso contrario segue para a Home.

## Eventos

- Envio de codigo submete `POST /api/v1/auth/phone/request-code`.
- Verificacao submete `POST /api/v1/auth/phone/verify-code`.
- Verificacao bem-sucedida cria ou vincula `auth.users`, cria ou vincula `persons`, cria `public.users` quando necessario e inicializa `public.user_preferences` com defaults quando for conta nova.
