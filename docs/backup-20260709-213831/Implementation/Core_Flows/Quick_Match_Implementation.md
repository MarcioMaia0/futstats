---
title: Quick Match Implementation
status: Draft
version: 0.9.0
owner: Product Architecture
last_update: 2026-07-06
---

# Quick Match Implementation

## Objetivo

Especificar o fluxo de partida rápida, principal porta de entrada do FUTSTATS para usuários casuais.

## Contexto

A partida rápida deve permitir que qualquer pessoa registre um jogo em poucos segundos. O foco inicial é placar, autores dos gols e compartilhamento. Escalação, scout, quadra, árbitro e adversário completo são camadas opcionais.

## Fluxo base

1. Usuário toca em `New Match`.
2. Seleciona ou cria um time.
3. Informa adversário simples ou usa texto livre.
4. Registra placar.
5. Opcionalmente adiciona autores dos gols.
6. Gera card compartilhável.
7. Finaliza ou salva como rascunho.

## Dados mínimos

- `team_id`
- `opponent_name` ou `local_opponent_id`
- `home_score`
- `opponent_score`
- `match_date`

## Dados opcionais

- venue;
- referee;
- players;
- goal authors;
- assists;
- match type;
- frame;
- media;
- comments.

## API sugerida

```http
POST /matches/quick
PATCH /matches/{matchId}/score
POST /matches/{matchId}/goals
POST /matches/{matchId}/share-card
```

## Decisão

Partida rápida nunca deve exigir scout avançado.


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
