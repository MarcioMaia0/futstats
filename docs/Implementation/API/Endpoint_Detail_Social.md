---
title: Endpoint Detail Social
status: Draft
version: 1.0.0
owner: Product Architecture
last_update: 2026-07-10
related_documents:
  - ../../API/Social_API.md
  - ../Core_Flows/Share_Card_Implementation.md
  - ../Database/Table_Spec_match_cards.md
---

# Endpoint Detail Social

## Objetivo

Detalhar a familia de endpoints sociais e manter a fronteira correta entre:

- interacao social;
- moderacao;
- geracao de cards compartilhaveis.

## Endpoints

```http
GET /api/v1/feed
POST /api/v1/posts
POST /api/v1/posts/{postId}/comments
POST /api/v1/posts/{postId}/reactions
POST /api/v1/content-reports
POST /api/v1/cards/match-result
POST /api/v1/cards/player
GET /api/v1/cards/{cardId}
```

## Regras

- Feed respeita privacidade, contexto seguido e disponibilidade do conteudo.
- Reacoes devem ser idempotentes por usuario.
- Denuncias devem gerar fila de moderacao.
- `POST /api/v1/cards/match-result`
  - gera artefato visual derivado de uma partida;
  - persiste registro em `match_cards` quando houver politica de armazenamento.
- `POST /api/v1/cards/player`
  - gera card de atleta em contexto suportado pelo produto.
- `GET /api/v1/cards/{cardId}`
  - devolve metadados e acesso ao artefato renderizado.
- O dominio social nao deve reabrir regras operacionais de agenda, presenca ou escalacao.

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
