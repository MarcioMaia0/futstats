---
title: Auth API
status: Draft
version: 1.3.0
owner: Product Architecture
last_update: 2026-07-20
related_documents:
  - ../ADR/ADR_012_Identity_On_Supabase_Auth.md
  - ../Frontend/Screens/Welcome.md
  - ../Frontend/Screens/Login.md
  - ../Frontend/Screens/Sign_Up.md
  - ../Frontend/Screens/Forgot_Password.md
  - ../Frontend/Screens/Phone_Otp.md
  - ../Frontend/Screens/Complete_Profile.md
  - ../Implementation/Database/Table_Spec_persons.md
  - ../Implementation/Database/Table_Spec_users.md
  - ../Implementation/Database/Table_Spec_user_preferences.md
---

# Auth API

## Objetivo

Definir o contrato de autenticacao e bootstrap de sessao do FUTSTATS, cobrindo e-mail, Google, Apple, phone OTP via WhatsApp, perfil minimo inicial e sessao atual.

## Principios

- A camada de conta e `auth.users` do Supabase.
- A camada canonica de pessoa e `persons`.
- A presenca da pessoa na plataforma fica em `public.users`.
- `username` nunca vem do provedor externo.
- Login social ou por telefone pode exigir `Complete Profile` antes da Home.
- O produto deve permitir entrada rapida, sem forcar preenchimento de dados alem do minimo necessario.
- `terms_accepted_at` e dado de app e deve ser persistido em `public.users`.
- Criacao de conta nova deve concluir logicamente: `auth.users` + `persons` + `public.users`.

## Sessao e bootstrap

## Estado implementado no app mobile

Em 2026-07-20, o app mobile implementa autenticação Supabase com:

- login por e-mail e senha;
- Google OAuth;
- login por identificador textual no mesmo campo da tela:
  - valores com `@` são tratados primeiro como e-mail;
  - quando o e-mail não resolve, o app tenta resolver como `username`;
  - valores sem `@` são tratados primeiro como `username` e depois como `contact_phone`;
  - telefone não autentica diretamente, apenas resolve a conta em `public.users`;
- RPC `resolve_login_identifier(identifier text)` para retornar o e-mail autenticável de forma controlada;
- criação de conta com telefone brasileiro de contato normalizado para E.164 quando informado;
- sincronização do avatar de provider social para storage próprio do app.

### `GET /api/v1/me`

Retorna a sessao atual, dados minimos do usuario e o estado de onboarding.

#### Response 200

```json
{
  "session": {
    "authenticated": true,
    "auth_provider": "EMAIL",
    "email_confirmed": true,
    "phone_confirmed": false
  },
  "user": {
    "id": "uuid",
    "person_id": "uuid-person",
    "username": "marcio",
    "display_name": "Marcio",
    "avatar_url": null,
    "contact_phone": null
  },
  "onboarding": {
    "requires_complete_profile": false,
    "requires_email_confirmation_reminder": false
  },
  "permissions": {
    "team_ids": []
  }
}
```

#### Regras

- `requires_complete_profile = true` quando `public.users.username` ou `public.users.display_name` ainda nao estiverem completos.
- Quando `session.authenticated = true` e `onboarding.requires_complete_profile = true`, a UI deve priorizar `Complete Profile` antes da Home.
- `permissions` retorna apenas o necessario para bootstrap; contexto detalhado por time pertence a endpoints especificos.
- Detalhamento de papeis de gestao por time pertence a `GET /api/v1/me/roles`, nao a este endpoint.
- `user.person_id` deve sempre existir para conta valida dentro do dominio.

## E-mail e senha

### `POST /api/v1/auth/sign-up`

Cria conta por e-mail, `person` e o `public.users` minimo.

#### Request

```json
{
  "username": "marcio",
  "display_name": "Marcio",
  "email": "marcio@example.com",
  "password": "secret123",
  "contact_phone": "+5511999999999",
  "terms_accepted": true
}
```

#### Persistencia

- `auth.users.email`
- `auth.users.encrypted_password`
- `persons.nickname`
- `persons.search_name`
- `public.users.username`
- `public.users.person_id`
- `public.users.display_name`
- `public.users.contact_phone`
- `public.users.terms_accepted_at`
- cria `public.user_preferences` com defaults

#### Response 201

```json
{
  "session": {
    "authenticated": true,
    "auth_provider": "EMAIL",
    "email_confirmed": false
  },
  "user": {
    "id": "uuid",
    "person_id": "uuid-person",
    "username": "marcio",
    "display_name": "Marcio"
  },
  "onboarding": {
    "requires_complete_profile": false,
    "requires_email_confirmation_reminder": true
  }
}
```

#### Regras

- `terms_accepted = true` e obrigatorio.
- `username` deve ser unico, tecnico e validado antes da criacao.
- a UI pode gerar a sugestao inicial de `username` a partir de `display_name`, mas o valor final enviado continua sendo explicito no payload.
- `confirm_password` pertence apenas a camada de tela e nunca deve ser persistido nem enviado como campo de dominio.
- `display_name` e obrigatorio.
- `contact_phone` e opcional e nao verificado.
- O cadastro por e-mail nunca cria `player`.
- No cadastro por e-mail:
  - `display_name` alimenta `persons.nickname` como apelido canonico inicial da pessoa;
  - `persons.full_name` pode permanecer `null` nesse fluxo simples;
  - `persons.search_name` deve ser derivado do `nickname` resolvido;
  - `public.users.display_name` continua sendo o nome de contexto da plataforma.

### `POST /api/v1/auth/sign-in`

Autentica conta existente por e-mail e senha.

No app mobile atual, este fluxo também é usado depois da resolução de identificador. O frontend pode receber `username` ou telefone no campo visual, resolver para e-mail via RPC e então chamar Supabase Auth com o e-mail resolvido.

#### Request

```json
{
  "email": "marcio@example.com",
  "password": "secret123"
}
```

#### Response 200

Mesmo shape de `GET /me`.

#### Regras

- Mensagem de erro neutra para credenciais invalidas.
- Rate limit no endpoint.
- A resolução de `username` ou `contact_phone` não deve revelar se uma conta existe para atacantes anônimos.
- `contact_phone` é telefone de contato em `public.users`, não telefone autenticador de Supabase Auth.

### `POST /api/v1/auth/forgot-password`

Dispara recuperacao de senha para contas `EMAIL`.

#### Request

```json
{
  "email": "marcio@example.com"
}
```

#### Response 202

```json
{
  "message": "If the email exists, recovery instructions were sent."
}
```

#### Regras

- Nao revelar se o e-mail existe.
- Rate limit no envio.

### `POST /api/v1/auth/reset-password`

Conclui redefinicao de senha com token ou codigo emitido pelo provedor de auth.

#### Request

```json
{
  "reset_token": "token-or-code",
  "new_password": "newSecret123"
}
```

#### Response 200

```json
{
  "message": "Password updated successfully."
}
```

## Login social

### `POST /api/v1/auth/social/start`

Inicia o fluxo de Google ou Apple.

#### Request

```json
{
  "provider": "GOOGLE",
  "redirect_uri": "futstats://auth/callback"
}
```

#### Response 200

```json
{
  "provider": "GOOGLE",
  "authorization_url": "https://..."
}
```

#### Regras

- Providers validos no lancamento atual: `GOOGLE`, `APPLE`.
- Apple so deve ser oferecido no iOS na camada de tela, mas o contrato aceita ambos.

### `POST /api/v1/auth/social/complete`

Conclui o fluxo social apos callback do provider.

#### Request

```json
{
  "provider": "GOOGLE",
  "authorization_code": "provider-code",
  "redirect_uri": "futstats://auth/callback",
  "terms_accepted": true
}
```

#### Persistencia

- cria ou vincula `auth.users`
- cria `persons` quando for conta nova
- cria `public.users` quando for conta nova
- grava `public.users.terms_accepted_at` quando for o primeiro acesso
- cria `public.user_preferences` com defaults quando for conta nova

#### Response 200

```json
{
  "session": {
    "authenticated": true,
    "auth_provider": "GOOGLE",
    "email_confirmed": true,
    "phone_confirmed": false
  },
  "user": {
    "id": "uuid",
    "username": null,
    "display_name": "Marcio"
  },
  "onboarding": {
    "requires_complete_profile": true,
    "requires_email_confirmation_reminder": false
  }
}
```

#### Regras

- `terms_accepted = true` e obrigatorio no primeiro acesso social.
- Se o login social tiver e-mail verificado igual ao de uma conta existente, o account linking e automatico.
- Se houver tentativa de vincular conta de e-mail ainda nao verificada a uma conta existente, exigir confirmacao de e-mail antes de vincular.
- `Complete Profile` e exigido para conta nova quando `username` ainda nao existir.
- Nome vindo do provedor social nao deve ser tratado como fonte canonica absoluta da pessoa.
- Conta social nova deve concluir criacao de `person` antes de criar `public.users`.
- Quando o provider social disponibilizar foto de perfil, o app pode copiar a imagem para storage próprio em `user-avatars` e gravar a URL pública em `public.users.avatar_url`.
- A URL externa do provider não deve ser tratada como origem final confiável para renderização permanente, porque pode falhar por política de cache, autorização ou expiração.

## Phone OTP

### `POST /api/v1/auth/phone/request-code`

Solicita envio de codigo OTP para telefone.

#### Request

```json
{
  "phone": "+5511999999999",
  "channel": "WHATSAPP"
}
```

#### Response 202

```json
{
  "cooldown_seconds": 60
}
```

#### Regras

- O canal previsto para este fluxo e `WHATSAPP`.
- `channel` permanece no contrato por clareza tecnica, mas a UI nao precisa expor seletor enquanto houver apenas um canal suportado.
- No lancamento atual, o fluxo fica fora da experiencia visivel e atras de feature flag por depender de servico pago.
- Rate limit e cooldown obrigatorios.

### `POST /api/v1/auth/phone/verify-code`

Verifica o codigo OTP e cria ou vincula conta.

#### Request

```json
{
  "phone": "+5511999999999",
  "otp_code": "123456",
  "terms_accepted": true
}
```

#### Persistencia

- `auth.users.phone`
- `auth.users.phone_confirmed_at`
- cria ou vincula `persons`
- cria ou vincula `public.users`
- grava `public.users.terms_accepted_at` quando for o primeiro acesso
- cria `public.user_preferences` com defaults quando for conta nova

#### Response 200

```json
{
  "session": {
    "authenticated": true,
    "auth_provider": "PHONE",
    "email_confirmed": false,
    "phone_confirmed": true
  },
  "user": {
    "id": "uuid",
    "username": null,
    "display_name": null
  },
  "onboarding": {
    "requires_complete_profile": true,
    "requires_email_confirmation_reminder": false
  }
}
```

#### Regras

- `terms_accepted = true` e obrigatorio no primeiro acesso por telefone.
- O cadastro por telefone nunca cria `player`.
- Fluxo novo por telefone deve concluir `person` antes de `public.users`.

## Complete Profile

### `POST /api/v1/auth/complete-profile`

Completa o perfil minimo apos login social ou por telefone.

#### Request

```json
{
  "username": "marcio",
  "display_name": "Marcio"
}
```

#### Persistencia

- `public.users.username`
- `public.users.display_name`

#### Response 200

```json
{
  "user": {
    "id": "uuid",
    "username": "marcio",
    "display_name": "Marcio"
  },
  "onboarding": {
    "requires_complete_profile": false
  }
}
```

#### Regras

- Endpoint exige sessao autenticada.
- `username` e obrigatorio, unico e nunca vem do provedor.
- `display_name` e obrigatorio.
- Este endpoint fecha o estado de onboarding minimo iniciado por login social ou telefone.
- Este endpoint atualiza a presenca da pessoa na plataforma, e nao substitui os campos canonicos de `persons`.

### `GET /api/v1/auth/username-availability?username=marcio`

Verifica disponibilidade do handle publico.

#### Response 200

```json
{
  "username": "marcio",
  "available": true
}
```

#### Regras

- Validar formato antes da consulta.
- Pode retornar `available = false` para handles reservados.
- Este endpoint serve como validacao final da sugestao montada na UI.
- A sugestao inicial pode ser derivada client-side a partir de `display_name` para reduzir atrito.

## Encerramento de sessao

### `POST /api/v1/auth/sign-out`

Encerra a sessao atual.

#### Response 204

Sem corpo.

## Erros padrao

```json
{
  "error": {
    "code": "USERNAME_ALREADY_TAKEN",
    "message": "Username is not available.",
    "details": {}
  }
}
```

## Codigos de erro esperados

- `INVALID_CREDENTIALS`
- `EMAIL_ALREADY_IN_USE`
- `USERNAME_ALREADY_TAKEN`
- `USERNAME_RESERVED`
- `WEAK_PASSWORD`
- `EMAIL_CONFIRMATION_REQUIRED`
- `SOCIAL_LINK_CONFIRMATION_REQUIRED`
- `OTP_INVALID`
- `OTP_EXPIRED`
- `OTP_RATE_LIMITED`
- `AUTH_PROVIDER_DISABLED`
- `TERMS_ACCEPTANCE_REQUIRED`

## Regra final

Auth deve retornar sessao, bootstrap minimo de usuario e estado de onboarding suficientes para a UI decidir entre Home, Complete Profile e lembretes de confirmacao, sem forcar o cliente a deduzir regras de negocio a partir de campos soltos.

## Regra estrutural complementar

- `auth.users` representa autenticacao.
- `persons` representa a pessoa canonica.
- `public.users` representa a presenca dessa pessoa na plataforma.
- Cadastro novo deve concluir essa cadeia antes de considerar a conta pronta para uso normal.
