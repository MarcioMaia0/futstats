---
title: Screen: Sign Up
status: Draft
version: 0.3.0
owner: Product Architecture
last_update: 2026-07-20
related_documents:
  - ../../Domain/Identity.md
  - ../../ADR/ADR_004_Account_User_Player_Separation.md
  - ../../Security/Auth_Security.md
  - ../../API/Auth_API.md
  - Welcome.md
  - Login.md
  - Complete_Profile.md
---

# Screen: Sign Up

## Objetivo

Criar uma conta nova pelo caminho de e-mail e senha. Componente: `SignUpScreen`.

## Elementos

- título e contexto visual de criação de conta;
- campos de cadastro com explicação no placeholder;
- sugestão editável de `@usuario` gerada a partir do nome de exibição;
- botão primário `Criar conta`;
- aceite de Termos e Privacidade;
- link para `Entrar`;
- link para voltar à `Welcome`.

## Campos visíveis

- `display_name` - obrigatório. Origem: `public.users.display_name`.
- `email` - obrigatório, formato de e-mail. Origem: `auth.users.email`.
- `contact_phone` - opcional, mas quando informado deve conter DDD e ser normalizado para E.164 brasileiro. Origem: `public.users.contact_phone`.
- `password` - obrigatório, mínimo 8 caracteres; campo com botão `mostrar senha`. Nunca persistido em claro.
- `confirm_password` - obrigatório na UI; usado apenas para confirmação visual da pessoa; nunca persistido nem enviado como campo de domínio.
- `terms_accepted` - checkbox obrigatório. Origem: `public.users.terms_accepted_at`.

## Campo técnico derivado

- `username` - obrigatório no submit, único, técnico e persistido em `public.users.username`.
- A tela não precisa começar pedindo esse valor como campo primário.
- A UI deve:
  - derivar uma sugestão inicial a partir de `display_name`;
  - mostrar essa sugestão como `@usuario`;
  - permitir edição manual;
  - consultar disponibilidade antes do submit final.

### Regras do `username`

- minúsculas;
- letras, números, `_` e `.`;
- 3 a 20 caracteres;
- sem espaço;
- handles reservados bloqueados;
- verificação de disponibilidade obrigatória antes do submit.

## Regras de UX

- validação inline;
- `display_name` é o campo semântico principal do bloco de identidade;
- a primeira sugestão de `username` deve nascer no front a partir de `display_name`, sem depender do backend para aparecer;
- o backend continua sendo a fonte final de verdade sobre unicidade e disponibilidade;
- `username` deve ser validado e consultado antes do submit final;
- `confirm_password` deve bloquear avanço quando não corresponder a `password`;
- `auth_provider` gravado como `EMAIL`;
- cadastro cria registro de autenticação em `auth.users`, cria `persons`, cria perfil mínimo em `public.users`; nunca cria `player`;
- verificação de e-mail: a pessoa entra imediatamente; um lembrete persistente pede a confirmação, exigida só antes de ações sensíveis;
- se o e-mail informado já pertencer a uma conta social (Google ou Apple), o vínculo exige antes a confirmação do e-mail; no sentido inverso, login social com e-mail verificado sobre conta de e-mail existente faz vínculo automático;
- depois de `sign-up`, a decisão entre Home e `Complete Profile` deve seguir `GET /api/v1/me -> onboarding.requires_complete_profile`;
- textos via i18n; tokens de tema.
- labels visuais dos campos podem ser ocultados quando o placeholder e o ícone deixarem o significado claro.
- o fundo deve preservar a marca d'água do app quando usada no padrão visual da tela.
- telefone sem DDD deve bloquear submit quando o campo estiver preenchido.

## Estados

- loading: durante submit.
- error: e-mail já cadastrado, username indisponível, senha fraca, confirmação divergente ou rate limit.
- offline: submit indisponível, com aviso.
- success: sessão criada; a aplicação consulta `GET /api/v1/me` e redireciona para `Complete Profile` quando `onboarding.requires_complete_profile = true`, caso contrário segue para a Home.

## Eventos

- criar conta submete `POST /api/v1/auth/sign-up`;
- consulta de disponibilidade de `username` usa `GET /api/v1/auth/username-availability`;
- geração inicial de sugestão de `username` acontece no front;
- criar conta com sucesso cria `auth.users`, `persons`, `public.users` e `public.user_preferences` com defaults;
- verificação de e-mail segue a política do provedor de auth.

## Regras de navegação

- `Entrar` abre `LoginScreen`.
- voltar retorna para `WelcomeScreen`.
