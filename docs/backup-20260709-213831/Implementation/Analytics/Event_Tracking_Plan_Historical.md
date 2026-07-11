---
title: Event Tracking Plan Historical
status: Draft
document_type: Historical
version: 1.0.0
owner: Product Architecture
last_update: 2026-07-07
related_documents:
  - ../../Analytics/Event_Tracking_Spec.md
---

# Event Tracking Plan Historical

## Status

Rascunho historico preservado. A referencia oficial do assunto agora e `../../Analytics/Event_Tracking_Spec.md`.

## Objetivo

Definir eventos analíticos.

## Eventos

- `user_signed_up`
- `team_created`
- `quick_match_created`
- `score_updated`
- `goal_added`
- `share_card_generated`
- `share_card_shared`
- `player_created`
- `advanced_scout_started`
- `match_finished`

## Regra

Analytics deve medir adoção casual e evolução para uso avançado.


## Critérios de qualidade

- O fluxo deve funcionar para usuário casual sem exigir cadastro excessivo.
- Recursos avançados devem ser progressivos e opcionais.
- O comportamento deve preservar consistência entre frontend, backend, API e banco.
- Todas as entidades técnicas, payloads, enums e nomes internos devem usar inglês.
- Textos exibidos ao usuário devem passar por camada de linguagem/configuração.

## Regras para IA

Ao usar este documento como contexto para implementação, a IA deve:
1. preservar o princípio de uso casual simples;
2. não criar campos obrigatórios que bloqueiem o MVP;
3. respeitar separação entre dado canônico e texto de interface;
4. manter compatibilidade com evolução futura;
5. sugerir migrations, testes e endpoints quando alterar domínio.
