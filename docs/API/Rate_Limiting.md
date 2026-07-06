---
title: Rate Limiting
status: Draft
version: 0.9.0
owner: Product Architecture
last_update: 2026-07-06
---

# Rate Limiting


## Objetivo

Definir estratégia de limite de uso da API.

## Regras

1. Endpoints públicos precisam de limite.
2. Login deve ter proteção contra abuso.
3. Upload e geração de cards devem ter limites específicos.
4. Planos pagos podem ter limites maiores.
5. APIs futuras para parceiros devem ter chaves próprias.

## Respostas

Usar status `429 Too Many Requests` com mensagem clara.
