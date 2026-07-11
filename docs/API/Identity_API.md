---
title: Identity API
status: Draft
version: 1.5.0
owner: Product Architecture
last_update: 2026-07-09
related_documents:
  - Auth_API.md
  - ../Domain/Identity.md
  - ../Implementation/Database/Table_Spec_persons.md
  - ../Implementation/Database/Table_Spec_users.md
  - ../Implementation/Database/Table_Spec_user_preferences.md
  - ../Implementation/Database/Table_Spec_user_team_roles.md
  - ../Frontend/Screens/Theme_Settings.md
  - ../Frontend/Screens/Language_Settings.md
---

# Identity API

## Objetivo

Definir o escopo da API do domínio `Identity` e evitar sobreposição com contratos já fechados em outros documentos.

## Fonte oficial atual

O contrato oficial de autenticação, bootstrap de sessão e onboarding do domínio `Identity` está em `Auth_API.md`.

Isso inclui:

- `GET /api/v1/me`
- `POST /api/v1/auth/sign-up`
- `POST /api/v1/auth/sign-in`
- `POST /api/v1/auth/forgot-password`
- `POST /api/v1/auth/reset-password`
- `POST /api/v1/auth/social/start`
- `POST /api/v1/auth/social/complete`
- `POST /api/v1/auth/phone/request-code`
- `POST /api/v1/auth/phone/verify-code`
- `POST /api/v1/auth/complete-profile`
- `GET /api/v1/auth/username-availability`
- `POST /api/v1/auth/sign-out`

## Escopo complementar de Identity

Além de autenticação e onboarding, o domínio `Identity` cobre:

- atualização da presença da pessoa na plataforma;
- preferências de experiência e privacidade;
- resolução de papéis por contexto;
- leitura de permissões e vínculos da pessoa com times.

## Contratos fechados neste documento

### `PATCH /api/v1/me/preferences`

Atualiza preferências da pessoa autenticada. O endpoint deve aceitar patch parcial: apenas os campos enviados são alterados.

#### Request

```json
{
  "preferred_language_mode": "VARZEA",
  "preferred_theme_id": "theme-dark",
  "profile_visibility": "FOLLOWERS",
  "name_display_public": "NAME",
  "name_display_followers": "BOTH",
  "name_display_team": "NICKNAME",
  "region_prompt_dismissed": true
}
```

#### Persistência

- `public.user_preferences.preferred_language_mode`
- `public.user_preferences.preferred_theme_id`
- `public.user_preferences.profile_visibility`
- `public.user_preferences.name_display_public`
- `public.user_preferences.name_display_followers`
- `public.user_preferences.name_display_team`
- `public.user_preferences.region_prompt_dismissed_at`

#### Regras

- Endpoint exige sessão autenticada.
- O patch é parcial: campo ausente significa "não alterar".
- `preferred_language_mode` deve aceitar apenas enums válidos de `language_mode`.
- `preferred_theme_id` pode ser `null` para remover escolha explícita da pessoa e voltar ao comportamento padrão da aplicação.
- `profile_visibility` deve aceitar apenas `PUBLIC`, `FOLLOWERS` ou `TEAM_MEMBERS`.
- `name_display_*` devem aceitar apenas `NAME`, `NICKNAME` ou `BOTH`.
- `region_prompt_dismissed = true` grava `region_prompt_dismissed_at` com timestamp atual quando ainda estiver nulo.
- `region_prompt_dismissed = false` não reabre automaticamente o prompt; esse campo funciona como dismiss operacional, não como toggle visual reversível por padrão.
- O endpoint não deve alterar dados de `public.users`; apenas `public.user_preferences`.
- Alterações de linguagem e tema afetam apresentação da experiência, não dados canônicos do produto.

#### Response 200

```json
{
  "preferences": {
    "preferred_language_mode": "VARZEA",
    "preferred_theme_id": "theme-dark",
    "profile_visibility": "FOLLOWERS",
    "name_display_public": "NAME",
    "name_display_followers": "BOTH",
    "name_display_team": "NICKNAME",
    "region_prompt_dismissed_at": "2026-07-07T12:00:00Z"
  }
}
```

#### Efeitos na UI

- Alteração de linguagem deve recarregar o bundle de vocabulário ativo.
- Alteração de tema deve reidratar o tema ativo da sessão.
- Mudanças de privacidade e exibição de nome devem valer para leituras futuras, sem exigir mudança imediata de dados históricos persistidos.

#### Erros esperados

- `UNAUTHENTICATED`
- `INVALID_LANGUAGE_MODE`
- `INVALID_THEME`
- `INVALID_PROFILE_VISIBILITY`
- `INVALID_NAME_DISPLAY`

### `GET /api/v1/me/roles`

Retorna os papéis contextuais de time da pessoa autenticada e os vínculos mínimos necessários para decisões de permissão no cliente.

#### Response 200

```json
{
  "roles": [
    {
      "team_id": "uuid-team-1",
      "role": "PRESIDENT",
      "granted_at": "2026-07-01T10:00:00Z"
    },
    {
      "team_id": "uuid-team-2",
      "role": "COMMITTEE",
      "granted_at": "2026-07-02T09:00:00Z"
    }
  ],
  "permissions": {
    "manageable_team_ids": ["uuid-team-1"]
  }
}
```

#### Regras

- Endpoint exige sessão autenticada.
- O retorno representa papéis contextuais de time da pessoa, não papéis esportivos.
- No estado atual do produto, os valores válidos de `role` são `DIRECTOR`, `PRESIDENT` e `COMMITTEE`.
- `PRESIDENT` tem o mesmo peso operacional de `DIRECTOR`; a diferença é de nomenclatura de negócio.
- `COMMITTEE` representa integrante interno do time sem gestão.
- `granted_at` corresponde a `user_team_roles.created_at`.
- `manageable_team_ids` é derivado apenas das linhas em `user_team_roles` com `DIRECTOR` ou `PRESIDENT`.
- O endpoint não deve inferir "jogador" ou "torcedor" como `role`.
- Ser `player` ligado ao time pertence a outro recorte do domínio e não substitui papel contextual.
- O endpoint pode retornar lista vazia quando a pessoa não tiver papéis contextuais em time.
- `GET /api/v1/me` continua sendo a fonte de bootstrap mínimo; `GET /api/v1/me/roles` existe para detalhamento contextual quando a UI precisar.

#### Erros esperados

- `UNAUTHENTICATED`

### `PATCH /api/v1/me`

Atualiza os dados da presença da pessoa autenticada na plataforma em `public.users`. O endpoint deve aceitar patch parcial.

#### Request

```json
{
  "display_name": "Marcio",
  "avatar_url": "https://cdn.example.com/avatar.jpg",
  "contact_phone": "+5511999999999",
  "region_state": "SP",
  "region_city": "Sao Paulo",
  "region_zone": "Leste"
}
```

#### Persistência

- `public.users.display_name`
- `public.users.avatar_url`
- `public.users.contact_phone`
- `public.users.region_state`
- `public.users.region_city`
- `public.users.region_zone`

#### Regras

- Endpoint exige sessão autenticada.
- O patch é parcial: campo ausente significa "não alterar".
- O endpoint não atualiza `username`; `username` pertence a `POST /api/v1/auth/complete-profile` no onboarding mínimo e a um contrato futuro específico se houver edição posterior.
- `display_name` pode ser atualizado aqui, desde que continue respeitando preenchimento obrigatório no estado final do perfil.
- `avatar_url` é opcional e deve apontar para mídia previamente validada pela infraestrutura.
- `contact_phone` é telefone de contato da pessoa, não telefone de autenticação.
- `region_zone` só faz sentido quando houver divisão aplicável na cidade; fora disso pode ser `null`.
- O endpoint não altera `public.user_preferences`.
- O endpoint não altera papéis, vínculos de time nem identidade esportiva.
- O endpoint também não substitui os campos canônicos de `persons`, como `full_name` e `nickname`.
- Se o produto quiser editar `persons.full_name`, `persons.nickname` ou `persons.avatar_media_id`, isso deve acontecer em contrato específico da camada de pessoa/atleta, não em `PATCH /api/v1/me`.

#### Response 200

```json
{
  "user": {
    "id": "uuid",
    "person_id": "uuid-person",
    "username": "marcio",
    "display_name": "Marcio",
    "avatar_url": "https://cdn.example.com/avatar.jpg",
    "contact_phone": "+5511999999999",
    "region_state": "SP",
    "region_city": "Sao Paulo",
    "region_zone": "Leste"
  }
}
```

#### Erros esperados

- `UNAUTHENTICATED`
- `INVALID_DISPLAY_NAME`
- `INVALID_AVATAR_URL`
- `INVALID_CONTACT_PHONE`
- `INVALID_REGION`

## Regras

- `GET /api/v1/me` retorna a presença da pessoa na plataforma, não apenas o estado bruto de autenticação.
- Preferências de experiência pertencem à presença daquela pessoa no app e devem refletir `user_preferences`.
- Papéis devem ser resolvidos por contexto, sem confundir papel contextual com identidade esportiva da pessoa.
- Campos canônicos de identidade-base pertencem a `persons`.
- Este documento não deve duplicar o contrato já oficializado em `Auth_API.md`.

## Diretriz documental

`Auth_API.md` continua sendo a única fonte oficial para fluxo de entrada, sessão e onboarding. Este documento complementa o domínio `Identity` com perfil, preferências e papéis contextuais.
