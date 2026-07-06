---
title: ADR 005 Identity Separation
status: Draft
version: 0.6.0
owner: Product Architecture
last_update: 2026-07-06
related_documents: []
---

# ADR 005 Identity Separation

## Status

Draft

## Decisão

Account, user e player são entidades distintas.

## Contexto

Esta decisão foi tomada para manter o FUTSTATS escalável, simples para o usuário casual e poderoso para usuários avançados.

## Consequências

- Maior clareza arquitetural.
- Menos acoplamento.
- Melhor suporte a crescimento futuro.
- Melhor uso por pessoas e IA.
