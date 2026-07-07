---
title: Component: Auth Prompt Sheet
status: Draft
version: 0.1.0
owner: Product Architecture
last_update: 2026-07-07
related_documents:
  - ../Screens/Welcome.md
  - ../../Domain/Identity.md
  - ../../ADR/ADR_012_Identity_On_Supabase_Auth.md
  - ../Naming_Conventions.md
---

# Component: Auth Prompt Sheet

## Objetivo

Gate contextual de autenticação. Surge quando um visitante não autenticado (torcedor) tenta uma interação que exige conta. Componente: `AuthPromptSheet`.

## Modelo de acesso (torcedor)

- Visitante sem registro = torcedor: acesso somente-leitura ao macro/público — anúncios na Home, notícias e destaques de todos os times, buscar time, ver o feed de um time, buscar player.
- Ações de criar/gerir (partida, elenco) não são exibidas ao torcedor.
- Interações sociais (responder/reagir a feed, comentar, seguir) disparam o `AuthPromptSheet`.
- Torcedor é o papel-base (ausência de vínculo com time) e não requer registro de auth — leitura pública resolvida via RLS.

## Comportamento

- Apresentação: bottom sheet, dispensável (fechar volta ao modo leitura, sem perder o contexto da tela).
- Métodos condensados no MVP: Google, Apple (iOS) e e-mail; "outras formas de entrar" leva às telas completas. Telefone/WhatsApp atrás de feature flag, ocultos no MVP.
- Mensagem contextual por ação ("entre para responder", "entre para seguir"), com fallback genérico.
- Após autenticar: se faltar `display_name`/`username`, encaminha para `Complete Profile`; caso contrário, retoma a intenção original (aplica a reação/o seguir) quando possível.

## Elementos

- Mensagem contextual.
- Botões de método (condensados).
- Link "outras formas de entrar".
- Ação de fechar.

## Campos

Sem campos próprios; delega aos métodos de autenticação.

## Estados

- loading: durante o handshake do método escolhido.
- error: falha/cancelamento do provedor.
- offline: autenticação indisponível ("conecte-se para participar").
- success: sessão criada → completar perfil ou retomar a ação.

## Eventos

- Disparado por ação restrita em modo torcedor.
- Conclusão bem-sucedida retoma a ação original quando aplicável.
