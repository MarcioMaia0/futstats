---
title: Statistics Recalculation Service
status: Draft
version: 0.9.0
owner: Product Architecture
last_update: 2026-07-06
---

# Statistics Recalculation Service


## Objetivo

Definir o serviço de recálculo estatístico.

## Entradas

- eventos de partida;
- escalação;
- substituições;
- gols;
- presença;
- quadra;
- adversário.

## Saídas

- estatísticas por partida;
- estatísticas por atleta;
- estatísticas por time;
- rankings;
- snapshots.

## Regras

1. Deve ser possível recalcular uma partida.
2. Deve ser possível recalcular uma temporada.
3. Métricas avançadas só aparecem quando dados suficientes existem.
4. Recálculos devem preservar versão da métrica.
