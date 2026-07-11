---
title: Component: Auth Prompt Sheet
status: Draft
version: 0.1.1
owner: Product Architecture
last_update: 2026-07-07
related_documents:
  - ../Screens/Welcome.md
  - ../../API/Auth_API.md
  - ../../Domain/Identity.md
  - ../../ADR/ADR_012_Identity_On_Supabase_Auth.md
  - ../Naming_Conventions.md
---

# Component: Auth Prompt Sheet

## Objetivo

Gate contextual de autenticação. Surge quando um visitante não autenticado tenta uma interação que exige conta. Componente: `AuthPromptSheet`.

## Modelo de acesso

- Visitante sem registro tem acesso somente leitura ao macro e ao público.
- Ações de criar ou gerir não são exibidas ao visitante.
- Interações sociais como reagir, comentar e seguir disparam o `AuthPromptSheet`.
- A leitura pública é resolvida por política de acesso; a interação exige autenticação.

## Comportamento

- Apresentação em bottom sheet, dispensável.
- Métodos condensados no lançamento atual: Google, Apple no iOS e e-mail.
- "Outras formas de entrar" leva às telas completas.
- Telefone via WhatsApp fica atrás de feature flag e oculto no lançamento atual.
- Mensagem contextual por ação, com fallback genérico.
- Após autenticar, a aplicação deve consultar `GET /api/v1/me`.
- Se `onboarding.requires_complete_profile = true`, encaminha para `Complete Profile`.
- Caso contrário, retoma a intenção original quando possível.

## Elementos

- Mensagem contextual.
- Botões de método.
- Link "outras formas de entrar".
- Ação de fechar.

## Campos

Sem campos próprios; delega aos métodos de autenticação.

## Estados

- loading: durante o handshake do método escolhido.
- error: falha ou cancelamento do provedor.
- offline: autenticação indisponível.
- success: sessão criada, seguida por consulta a `GET /api/v1/me`.

## Eventos

- Disparado por ação restrita em modo visitante.
- Conclusão bem-sucedida retoma a ação original quando aplicável.
