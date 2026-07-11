---
title: OpenAPI Strategy
status: Draft
version: 1.0.0
owner: Product Architecture
last_update: 2026-07-06
related_documents:
  []
---

# OpenAPI Strategy

## Objetivo

Definir que a API deverá ser documentada em formato OpenAPI.

## Regras

1. Toda rota pública deve estar no contrato.
2. DTOs devem ser versionados.
3. Códigos de erro devem ser documentados.
4. Rotas devem usar inglês.
5. Payloads não devem carregar textos de interface quando puderem usar códigos canônicos.

## Versionamento

Rotas iniciais podem usar `/v1`.
