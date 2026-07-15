---
title: Auth Service Spec
status: Draft
version: 1.1.0
owner: Product Architecture
last_update: 2026-07-07
related_documents:
  - ../../Architecture/Architecture_Principles.md
  - ../../Domain/Identity.md
  - ../../API/Auth_API.md
  - ../../ADR/ADR_012_Identity_On_Supabase_Auth.md
  - ../../Implementation/Database/Table_Spec_users.md
---

# Auth Service Spec

## Objetivo

Especificar o serviço de autenticação e bootstrap de sessão do domínio `Identity`, alinhando backend, API, UX e persistência.

## Papel arquitetural

No padrão de monólito modular com clean architecture:

- `domain` define invariantes de identidade e contratos;
- `application` orquestra os casos de uso de autenticação e onboarding;
- `infra` integra com Supabase Auth, banco e provedores externos;
- `presentation` expõe endpoints e traduz requests e responses.

O `Auth Service` não é uma tela nem um SDK. Ele é a porta de entrada do backend para os casos de uso de `Identity`.

## Regra central

> O FUTSTATS nunca deve exigir comportamento analítico para entregar valor.

No auth, isso significa:

- entrada rápida;
- perfil mínimo;
- onboarding progressivo;
- nada além do necessário antes da pessoa chegar à Home.

## Casos de uso obrigatórios

- `SignUpWithEmail`
- `SignInWithEmail`
- `RequestPasswordReset`
- `ResetPassword`
- `StartSocialAuth`
- `CompleteSocialAuth`
- `RequestPhoneOtp`
- `VerifyPhoneOtp`
- `GetCurrentSession`
- `CompleteProfile`
- `CheckUsernameAvailability`
- `SignOut`

## Responsabilidades

- autenticar por e-mail e senha;
- iniciar e concluir login social;
- iniciar e concluir OTP por telefone;
- criar ou vincular `auth.users`, `persons` e `public.users`;
- calcular estado de onboarding retornado por `GET /api/v1/me`;
- concluir `Complete Profile`;
- expor disponibilidade de `username`;
- recuperar acesso;
- encerrar sessão.

## Regras específicas

- Deve respeitar o princípio casual-first.
- Deve funcionar com o menor número possível de dados obrigatórios.
- Deve permitir aprofundamento posterior sem refatoração estrutural.
- Deve preservar consistência entre produto, domínio, API, banco e UX.
- A decisão entre Home e `Complete Profile` pertence ao estado retornado por `GetCurrentSession`.
- `username` nunca vem do provedor externo.
- `terms_accepted_at` pertence a `public.users`, não a `auth.users`.

## Portas esperadas

- `AuthProviderPort`
- `PersonRepository`
- `UserRepository`
- `UserPreferencesRepository`
- `UsernameAvailabilityPort`
- `SessionReader`
- `PhoneOtpProviderPort`

## Critérios de aceite

- Fluxo principal documentado.
- Regras de erro previstas.
- Impacto no usuário casual considerado.
- Impacto no usuário avançado considerado.
- Casos de uso mapeados 1:1 com o contrato de `Auth_API.md`.
- Separação explícita entre regra de aplicação e detalhe de infraestrutura.
