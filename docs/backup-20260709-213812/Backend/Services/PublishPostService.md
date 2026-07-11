---
title: PublishPostService
status: Draft
version: 0.6.0
owner: Product Architecture
last_update: 2026-07-06
related_documents: []
---

# PublishPostService

## Objetivo

Publica conteúdo social no feed.

## Entrada

Definida pelo caso de uso correspondente.

## Saída

Resultado do processamento ou erro de domínio.

## Regras

- Validar permissões.
- Validar integridade.
- Não colocar regra de negócio em controllers.
- Emitir eventos de domínio quando necessário.

## Eventos possíveis

- `MatchCreated`
- `GoalRegistered`
- `StatisticsUpdated`
- `PostPublished`
- `RefereeReviewed`

## Testes

Todo serviço deve possuir testes unitários para regras principais.
