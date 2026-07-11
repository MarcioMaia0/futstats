---
title: Error Handling
status: Draft
version: 0.9.0
owner: Product Architecture
last_update: 2026-07-06
related_documents:
[]
---

# Error Handling

## Objetivo

Padronizar erros.

## Categorias

- ValidationError.
- AuthenticationError.
- AuthorizationError.
- NotFoundError.
- ConflictError.
- BusinessRuleViolation.
- ExternalServiceError.
- RateLimitError.

## Regra

Erro de regra de negócio deve explicar o motivo em português na UI, mas usar código técnico estável na API.
