---
title: Offline UI
status: Draft
version: 0.9.0
owner: Product Architecture
last_update: 2026-07-06
---

# Offline UI


## Objetivo

Definir comportamento visual quando o app estiver offline.

## Regras

1. Usuário deve saber que está offline.
2. Ações pendentes devem ter indicador.
3. Registro rápido de jogo deve continuar quando possível.
4. Falha de sincronização deve oferecer retry.
5. Dados não sincronizados não devem parecer publicados.

## Componentes

- banner offline;
- fila de sincronização;
- status por partida;
- alerta de conflito.
