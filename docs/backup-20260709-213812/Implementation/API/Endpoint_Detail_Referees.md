---
title: Endpoint Detail Referees
status: Draft
version: 0.9.0
owner: Product Architecture
last_update: 2026-07-06
---

# Endpoint Detail Referees

## Objetivo

Detalhar endpoints de arbitragem.

## Endpoints

```http
POST /referees
GET /referees/{refereeId}
POST /matches/{matchId}/referees
POST /match-referees/{matchRefereeId}/reviews
GET /referees/{refereeId}/history
```

## Regras

- Árbitro manual deve ser permitido.
- Avaliação é por partida.
- Reputação é calculada.


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
