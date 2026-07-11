---
title: Developer Onboarding
status: Approved
version: 1.1.0
owner: Product Architecture
last_update: 2026-07-09
related_documents: []
---

# Developer Onboarding

## Objetivo

Orientar o início do trabalho técnico no FUTSTATS.

## Primeiros passos

1. Ler Product Overview.
2. Ler Product Vision.
3. Ler Product Principles.
4. Ler Domain README.
5. Ler Launch Snapshot Strategy como material histórico de contexto.
6. Ler Database Architecture.
7. Ler API Conventions.
8. Ler Backend Architecture.
9. Ler Frontend Architecture.
10. Ler QA Acceptance Criteria.

## Stack ainda não definida

A documentação não fixa stack final. Ela prepara decisões para:

- backend modular;
- banco relacional;
- APIs REST inicialmente;
- frontend mobile-first;
- geração de cards;
- jobs assíncronos;
- futura IA.

## Primeira implementação recomendada

1. Identity básico.
2. Team básico.
3. Player rápido.
4. Match rápido.
5. Goal registration.
6. Share card.
7. Feed simples.
8. Statistics simples.

## Cuidados

- Não implementar scout avançado antes do fluxo casual estar excelente.
- Não exigir cadastro completo para registrar jogo.
- Não acoplar linguagem de UI aos enums do banco.
- Não misturar `user` e `player`.
