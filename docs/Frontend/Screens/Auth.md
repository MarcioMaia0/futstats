---
title: Screen: Auth
status: Draft
version: 0.1.2
owner: Product Architecture
last_update: 2026-07-07
related_documents:
  - ../../Domain/Identity.md
  - ../../ADR/ADR_004_Account_User_Player_Separation.md
  - ../../Security/Auth_Security.md
  - ../../API/Auth_API.md
  - Welcome.md
  - Forgot_Password.md
  - Complete_Profile.md
---

# Screen: Auth

## Objetivo

Criar conta ou entrar pelo caminho de e-mail e senha. Tela unica com alternancia entre "Entrar" e "Criar conta". Componente: `AuthScreen`.

## Elementos

- Alternancia "Entrar" / "Criar conta".
- Campos do modo ativo.
- Botao primario ("Entrar" ou "Criar conta").
- Link "Esqueci a senha" (modo entrar).
- Aceite de Termos e Privacidade (modo criar conta).
- Link para voltar a Welcome.

## Campos

### Modo criar conta

- `username` - obrigatorio, unico (handle publico `@usuario`); regras: minusculas, letras, numeros, `_` e `.`, 3 a 20 caracteres, sem espaco, handles reservados bloqueados; com verificacao de disponibilidade. Origem: `public.users.username`.
- `display_name` - obrigatorio. Origem: `public.users.display_name`.
- `email` - obrigatorio, formato de e-mail. Origem: `auth.users.email`.
- `contact_phone` - opcional, formato E.164 (telefone de contato, nao verificado). Origem: `public.users.contact_phone`.
- `password` - obrigatorio, minimo 8 caracteres; campo unico com botao "mostrar senha". Nunca persistido em claro.
- `terms_accepted` - checkbox obrigatorio. Origem: `public.users.terms_accepted_at`.

### Modo entrar

- `email` - obrigatorio.
- `password` - obrigatorio.

## Regras de UX

- Validacao inline; nao revelar se um e-mail existe em fluxos sensiveis.
- `auth_provider` gravado como `EMAIL`.
- Cadastro cria registro de autenticacao em `auth.users`, cria `persons`, cria perfil minimo em `public.users`; nunca cria `player`.
- Verificacao de e-mail: o usuario entra imediatamente; um lembrete persistente pede a confirmacao, exigida so antes de acoes sensiveis.
- Se o e-mail informado ja pertencer a uma conta social (Google ou Apple), o vinculo exige antes a confirmacao do e-mail; no sentido inverso, login social com e-mail verificado sobre conta de e-mail existente faz vinculo automatico.
- Depois de `sign-up` ou `sign-in`, a decisao entre Home e `Complete Profile` deve seguir `GET /api/v1/me -> onboarding.requires_complete_profile`.
- Textos via i18n; tokens de tema.

## Estados

- loading: durante submit.
- error: credencial invalida, e-mail ja cadastrado, senha fraca ou rate limit.
- offline: submit indisponivel, com aviso.
- success: sessao criada; a aplicacao consulta `GET /api/v1/me` e redireciona para `Complete Profile` quando `onboarding.requires_complete_profile = true`, caso contrario segue para a Home.

## Eventos

- Criar conta submete `POST /api/v1/auth/sign-up`.
- Entrar submete `POST /api/v1/auth/sign-in`.
- Consulta de disponibilidade de `username` usa `GET /api/v1/auth/username-availability`.
- Criar conta com sucesso cria `auth.users`, `persons`, `public.users` e `public.user_preferences` com defaults.
- Verificacao de e-mail segue a politica do provedor de auth.
