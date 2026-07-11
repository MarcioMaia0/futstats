---
title: Identity Domain
status: Draft
version: 1.0.0
owner: Product Architecture
last_update: 2026-07-09
related_documents:
  - ../ADR/ADR_007_Event_Driven_Internal_Architecture.md
  - ../ADR/ADR_012_Identity_On_Supabase_Auth.md
  - ../API/Auth_API.md
  - ../Architecture/Domain_Event_Catalog.md
  - ../Implementation/Database/Table_Spec_persons.md
  - ../Implementation/Database/Table_Spec_users.md
  - ../Implementation/Database/Table_Spec_players.md
  - ../Implementation/Database/Table_Spec_accounts.md
---

# Identity Domain

## Objetivo

Definir as fronteiras entre autenticação, pessoa canônica, presença na plataforma, perfil esportivo, arbitragem e papéis contextuais.

## Conceitos

- `account`
  - camada de autenticação;
  - na infraestrutura, corresponde a `auth.users`.
- `person`
  - identidade canônica da pessoa no ecossistema FUTSTATS;
  - pode existir com ou sem conta;
  - pode existir com ou sem perfil esportivo.
- `user`
  - presença daquela `person` dentro da plataforma autenticada;
  - corresponde a `public.users`.
- `player`
  - identidade esportiva opcional daquela `person`.
- `referee`
  - perfil de arbitragem.
- `role`
  - papel contextual, normalmente por time ou contexto operacional.

## Regras

1. `person` é a base canônica de identidade.
2. `user` não é necessariamente `player`.
3. `player` pode existir sem conta.
4. `person` pode existir sem `user`.
5. A pessoa pode ter vários papéis ao longo do tempo.
6. Papel de gestão é contextual; não substitui identidade da pessoa.
7. O histórico esportivo deve sobreviver à saída de membros e à desvinculação de conta.
8. `username` nunca vem do provedor externo.
9. `display_name` e `username` podem ficar incompletos apenas durante onboarding mínimo.

## Cadeia de identidade

- `auth.users`
  - autenticação
- `persons`
  - pessoa canônica
- `users`
  - presença dessa pessoa na plataforma
- `players`
  - identidade esportiva dessa pessoa

## Fluxos principais

- primeiro acesso por e-mail e senha;
- primeiro acesso social;
- primeiro acesso por telefone;
- bootstrap de sessão;
- complete profile;
- recuperação de acesso;
- criação de `person` + `player` para atleta avulso sem conta;
- reivindicação de perfil esportivo.

## Fonte oficial por assunto

- contrato de autenticação e onboarding:
  - `../API/Auth_API.md`
- decisão de modelagem sobre Supabase Auth:
  - `../ADR/ADR_012_Identity_On_Supabase_Auth.md`
- persistência da pessoa canônica:
  - `../Implementation/Database/Table_Spec_persons.md`
- persistência da presença na plataforma:
  - `../Implementation/Database/Table_Spec_users.md`
- persistência da identidade esportiva:
  - `../Implementation/Database/Table_Spec_players.md`

## Impacto técnico

Tabelas relevantes:

- `auth.users` como camada de conta;
- `persons` como camada canônica de pessoa;
- `users` como camada de presença na plataforma;
- `players` para identidade esportiva;
- `user_team_roles` para papéis de gestão por contexto.

Não existe tabela `accounts` própria; `accounts` é apenas camada conceitual mapeada em `auth.users`.

## Casos de uso do domínio Identity

- `SignUpWithEmail`
- `SignInWithEmail`
- `StartSocialAuth`
- `CompleteSocialAuth`
- `RequestPhoneOtp`
- `VerifyPhoneOtp`
- `GetCurrentSession`
- `CompleteProfile`
- `CheckUsernameAvailability`
- `RequestPasswordReset`
- `ResetPassword`
- `SignOut`

## Regra de criação de conta

Ao criar conta nova, o fluxo deve concluir logicamente:

1. criação em `auth.users`;
2. criação de `person`;
3. criação de `user` ligado à `person`.

Não deve existir estado final normal com `user` sem `person`.

## Regra de criação de atleta sem conta

O produto pode criar `person` + `player` sem `user` para casos como:

- atleta avulso escalado na partida;
- técnico sem conta;
- pessoa operacional ainda não autenticada.

## Eventos de domínio Identity

### Eventos principais

- `UserSignedUp`
- `SocialAuthCompleted`
- `PhoneOtpVerified`
- `IdentityLinked`
- `PasswordResetRequested`
- `PasswordResetCompleted`
- `ProfileCompleted`

### Quando cada evento ocorre

- `UserSignedUp`
  - ocorre quando o cadastro por e-mail conclui a criação de autenticação em `auth.users`, de `person`, de `user` e a inicialização obrigatória para uso do produto.

- `SocialAuthCompleted`
  - ocorre quando o callback social é concluído com sucesso e a sessão já está válida;
  - pode representar conta nova ou conta existente.

- `PhoneOtpVerified`
  - ocorre quando o código OTP é validado com sucesso e a sessão por telefone foi estabelecida.

- `IdentityLinked`
  - ocorre quando uma identidade externa é vinculada a uma conta já existente, evitando duplicação de conta.

- `PasswordResetRequested`
  - ocorre quando o pedido de recuperação é aceito pelo sistema, sem revelar existência de conta.

- `PasswordResetCompleted`
  - ocorre quando a senha é efetivamente redefinida com sucesso.

- `ProfileCompleted`
  - ocorre quando o onboarding mínimo da presença na plataforma é concluído, com `username` e `display_name` válidos.

### Eventos que não devem existir como evento de domínio principal

- `GetCurrentSessionCalled`
- `UsernameAvailabilityChecked`
- `WelcomeViewed`
- `AuthScreenOpened`

Esses casos são consulta, telemetria ou UI, não fatos centrais do domínio.

## Efeitos colaterais permitidos

### `UserSignedUp`

- registrar auditoria de criação de conta;
- registrar analytics de cadastro concluído;
- disparar mensagem de boas-vindas ou e-mail transacional, quando aplicável.

Não deve ser efeito colateral:

- decidir onboarding fora do caso de uso principal;
- criar `player` automaticamente.

### `SocialAuthCompleted`

- registrar analytics de login social concluído;
- atualizar trilha de auditoria de autenticação;
- preparar integração de boas-vindas para conta nova.

### `PhoneOtpVerified`

- registrar analytics de autenticação por telefone;
- atualizar trilha de auditoria e segurança;
- preparar comunicação de boas-vindas para conta nova.

### `IdentityLinked`

- registrar auditoria de vinculação;
- invalidar caches derivados de identidade, se existirem;
- alimentar trilha de segurança.

### `PasswordResetRequested`

- disparar fluxo de comunicação de recuperação;
- registrar evento de segurança e rate limit;
- alimentar monitoramento antifraude.

### `PasswordResetCompleted`

- registrar auditoria de alteração de credencial;
- invalidar sessões antigas, se a política de segurança exigir;
- alimentar monitoramento de segurança.

### `ProfileCompleted`

- registrar analytics de onboarding concluído;
- liberar experiências dependentes de perfil mínimo completo;
- disparar indexação leve de perfil para busca, se existir.

## Regra arquitetural

As regras de identidade pertencem ao domínio `Identity` e aos seus casos de uso de application.

- UI não decide onboarding.
- Supabase não decide onboarding.
- `GET /api/v1/me` expõe o estado calculado para a UI.
- `Complete Profile` fecha o onboarding mínimo quando necessário.
- Eventos de domínio não substituem os efeitos síncronos obrigatórios para concluir o fluxo principal.
