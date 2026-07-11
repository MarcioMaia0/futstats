---
title: Source of Truth Map
status: Approved
version: 1.0.2
owner: Product Architecture
last_update: 2026-07-08
related_documents:
  - ../API/Auth_API.md
  - ../Frontend/Screens/Auth.md
  - ../Frontend/Screens/Welcome.md
  - ../Frontend/Screens/Complete_Profile.md
  - ../Frontend/Screens/Start_Path_Selection.md
  - ../Frontend/Reusable_Building_Blocks.md
  - ../Implementation/Database/Table_Spec_users.md
---

# Source of Truth Map

## Objetivo

Definir onde cada assunto deve ser documentado.

| Assunto | Fonte oficial |
|---|---|
| Visao geral | Product/Product_Overview.md |
| Visao estrategica | Product/Product_Vision.md |
| Principios | Product/Product_Principles.md |
| Pilares | Product/Product_Pillars.md |
| Personas | Product/Personas.md |
| Jornadas | Product/User_Journeys.md |
| Dominios | Domain/README.md |
| Banco | Database/Database_Architecture.md |
| Backend | Backend/Backend_Architecture.md |
| API | API/API_Conventions.md |
| Contrato de autenticacao | API/Auth_API.md |
| Bootstrap de sessao e onboarding | API/Auth_API.md (`GET /api/v1/me`) |
| Tela de entrada social e e-mail | Frontend/Screens/Welcome.md |
| Tela de e-mail e senha | Frontend/Screens/Auth.md |
| Tela de recuperacao de senha | Frontend/Screens/Forgot_Password.md |
| Tela de OTP por telefone | Frontend/Screens/Phone_Otp.md |
| Tela de perfil minimo inicial | Frontend/Screens/Complete_Profile.md |
| Tela de intencao inicial | Frontend/Screens/Start_Path_Selection.md |
| Componentes, fluxos e metodos reutilizaveis de frontend | Frontend/Reusable_Building_Blocks.md |
| Estado minimo do usuario | Implementation/Database/Table_Spec_users.md |
| Frontend | Frontend/Frontend_Architecture.md |
| UX | UX/UX_Principles.md |
| IA | AI/AI_Strategy.md |
| Seguranca | Security/README.md |
| QA | QA/README.md |
| Operacoes | Operations/README.md |
| Monetizacao | Monetization/README.md |
| Analytics | Analytics/README.md |
| ADRs | ADR/README.md |
| MVP | Product/PRD_MVP.md |
| Implementacao | Implementation/README.md |

## Regra

Evitar duplicacao. Quando um documento precisar citar outro assunto, deve referenciar a fonte oficial.

## Regra complementar para onboarding

- Regras de decisao de fluxo apos autenticacao pertencem ao contrato em `API/Auth_API.md`.
- Telas devem descrever UX e campos, sem redefinir a regra de roteamento fora de `GET /api/v1/me`.
- A tela `Start_Path_Selection` define a intencao inicial de uso, mas nao substitui contratos de persistencia, API ou autorizacao.
- A tela `Forgot_Password` deve apontar para `POST /api/v1/auth/forgot-password` sem redefinir politicas de seguranca.
- A tela `Phone_Otp` deve apontar para `POST /api/v1/auth/phone/request-code`, `POST /api/v1/auth/phone/verify-code` e usar `GET /api/v1/me` para a decisao de onboarding.
- Persistencia de `username` e `display_name` pertence a `Implementation/Database/Table_Spec_users.md`.
- Antes de criar novo componente, hook ou fluxo visual, consultar `Frontend/Reusable_Building_Blocks.md`.
