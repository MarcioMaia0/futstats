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
  - ../../ADR/ADR_012_Identity_On_Supabase_Auth.md
---

# Auth Service

## Objetivo

Especificar autenticação, bootstrap de sessão e onboarding mínimo do domínio `Identity`.

## Responsabilidades

- login;
- refresh ou restauração de sessão;
- logout;
- provedores externos;
- vinculação entre camada de conta e camada de pessoa;
- recuperação de acesso;
- bootstrap de sessão para a UI;
- conclusão do perfil mínimo inicial.

## Regras

- `account` é autenticação e, na infraestrutura, corresponde a `auth.users`.
- `user` é perfil da pessoa em `public.users`.
- `player` é perfil esportivo opcional.
- Nunca acoplar autenticação diretamente ao `player`.
- UI consulta `GET /api/v1/me` para decidir entre Home e `Complete Profile`.
- `Complete Profile` existe para fechar o estado transitório de onboarding.

## Mapeamento por camada

### Domain

- invariantes de identidade;
- regras de completude de perfil mínimo;
- contratos para leitura de sessão e persistência de pessoa.

### Application

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

### Infrastructure

- adaptador de `auth.users`;
- persistência em `public.users`;
- provedor social;
- provedor de OTP por WhatsApp;
- inicialização de `public.user_preferences`.

### Presentation

- endpoints REST;
- validação de payload;
- mapeamento entre response interna e contrato público da API.

## Critérios de qualidade

- O fluxo deve funcionar para usuário casual sem exigir cadastro excessivo.
- Recursos avançados devem ser progressivos e opcionais.
- O comportamento deve preservar consistência entre frontend, backend, API e banco.
- Todas as entidades técnicas, payloads, enums e nomes internos devem usar inglês.
- Textos exibidos ao usuário devem passar por camada de linguagem ou configuração.

## Regras para IA

Ao usar este documento como contexto para implementação, a IA deve:

1. preservar o princípio de uso casual simples;
2. não criar campos obrigatórios que bloqueiem o primeiro valor operacional;
3. respeitar separação entre dado canônico e texto de interface;
4. manter compatibilidade com evolução futura;
5. sugerir migrations, testes e endpoints quando alterar domínio;
6. manter a decisão de onboarding centralizada em `GetCurrentSession`.
