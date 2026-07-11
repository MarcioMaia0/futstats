---
title: Backend Validation
status: Draft
version: 0.4.0
owner: Product Architecture
last_update: 2026-07-06
related_documents: []
---

# Backend Validation

## Objetivo

Definir estratégia de validação.

## Tipos

### Validação de entrada

Formato, obrigatoriedade e tipos.

### Validação de negócio

Regras do domínio.

### Validação de permissão

Quem pode fazer.

## Exemplos

- Não finalizar partida já finalizada.
- Não avaliar árbitro sem vínculo com partida.
- Não registrar Plus/Minus sem escalações suficientes.
- Não permitir tema com mais de três cores.
- Não aceitar enum fora do padrão canônico.

## Regra

Erro deve ser explícito e útil para frontend.
