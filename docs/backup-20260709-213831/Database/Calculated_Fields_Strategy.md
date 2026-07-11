---
title: Calculated Fields Strategy
status: Draft
version: 0.9.0
owner: Product Architecture
last_update: 2026-07-06
---

# Calculated Fields Strategy


## Objetivo

Definir como campos calculados devem ser tratados.

## Tipos

- calculados em tempo real;
- materializados;
- snapshots históricos;
- agregados assíncronos.

## Regras

1. Placar pode ser persistido para consulta rápida.
2. Ranking pode ser materializado.
3. Plus/Minus deve ser recalculável a partir de eventos.
4. Snapshots preservam histórico de cálculo.
5. Métricas devem possuir versão.

## Decisão

Usar dados derivados para performance, mas preservar eventos originais como fonte de verdade.
