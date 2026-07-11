---
title: Auth Service
status: Draft
version: 1.0.0
owner: Product Architecture
last_update: 2026-07-07
related_documents:
  - ../../Architecture/Architecture_Principles.md
  - ../../Domain/Identity.md
  - ../../API/Auth_API.md
  - ../../Implementation/Services/Auth_Service.md
---

# Auth Service

## Objetivo

Documentar a visão de backend para o serviço de autenticação do domínio `Identity`.

## Papel no monólito modular

O serviço pertence ao módulo `Identity` dentro do monólito modular.

Ele não deve espalhar regra de autenticação por controllers, telas, triggers ou SQL ad hoc. O backend deve concentrar esse comportamento em casos de uso claros.

## Casos de uso esperados

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

## Responsabilidades de backend

- integrar com Supabase Auth;
- persistir e consultar `public.users`;
- inicializar `public.user_preferences`;
- consolidar estado de onboarding;
- devolver bootstrap mínimo para a UI;
- garantir consistência entre autenticação e perfil mínimo.

## Regra estrutural

- Controllers apenas recebem request e chamam caso de uso.
- Caso de uso decide onboarding e regras de identidade.
- Infraestrutura implementa integração com Supabase e provedores externos.
- Nenhuma regra principal deve depender de trigger como orquestrador central.
