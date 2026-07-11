---
title: Quick Match Implementation
status: Draft
version: 1.0.0
owner: Product Architecture
last_update: 2026-07-10
related_documents:
  - ../../API/Matches_API.md
  - ../../Frontend/Screens/Match_Operation.md
  - ../Database/Table_Spec_matches.md
  - ../Database/Table_Spec_match_goals.md
  - ./Share_Card_Implementation.md
---

# Quick Match Implementation

## Objetivo

Especificar o fluxo de partida rapida, principal porta de entrada do FUTSTATS para usuarios casuais.

## Contexto

A partida rapida deve permitir que qualquer pessoa registre um jogo em poucos segundos. O foco inicial e:

- placar;
- autores dos gols quando conhecidos;
- compartilhamento simples do resultado.

Escalacao completa, scout fino, eventos detalhados e operacao colaborativa continuam pertencendo ao fluxo avancado.

## Fluxo base

1. Usuario toca em `Novo jogo`.
2. Seleciona um time ou cria um contexto minimo.
3. Informa adversario simples ou usa texto livre.
4. Registra o placar.
5. Opcionalmente adiciona autores dos gols pelo fluxo rapido.
6. Pode gerar card compartilhavel.
7. Finaliza ou salva para continuar depois, conforme politica operacional.

## Dados minimos

- `team_id`
- `opponent_name` ou referencia operacional equivalente
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
- age category;
- frame label;
- media;
- comments.

## API sugerida

```http
POST /api/v1/matches
PATCH /api/v1/matches/{matchId}
POST /api/v1/matches/{matchId}/goals/quick
POST /api/v1/cards/match-result
```

## Regras

- Partida rapida nunca deve exigir scout avancado.
- O mesmo agregado `matches` atende o fluxo rapido e o avancado.
- O fluxo rapido nao deve recriar rotas paralelas como `POST /matches/quick`.
- Se o usuario depois enriquecer a partida, isso acontece sobre a mesma `match`.
- O compartilhamento visual e derivado da partida, mas a geracao do card pertence ao agregado `cards`.

## Decisao

O fluxo rapido e uma porta de entrada simplificada do mesmo dominio operacional da partida, nao um produto paralelo.

## Criterios de qualidade

- O fluxo deve funcionar para usuario casual sem exigir cadastro excessivo.
- Recursos avancados devem ser progressivos e opcionais.
- O comportamento deve preservar consistencia entre frontend, backend, API e banco.
- Todas as entidades tecnicas, payloads, enums e nomes internos devem usar ingles.
- Textos exibidos ao usuario devem passar por camada de linguagem/configuracao.

## Regras para IA

Ao usar este documento como contexto para implementacao, a IA deve:
1. preservar o principio de uso casual simples;
2. nao criar campos obrigatorios que bloqueiem o primeiro valor operacional;
3. respeitar separacao entre dado canonico e texto de interface;
4. manter compatibilidade com evolucao futura;
5. sugerir migrations, testes e endpoints quando alterar dominio.
