---
title: Jobs and Queues
status: Draft
version: 0.9.0
owner: Product Architecture
last_update: 2026-07-06
---

# Jobs and Queues


## Objetivo

Documentar jobs assíncronos.

## Jobs iniciais

- recalcular estatísticas;
- gerar cards;
- enviar notificações;
- atualizar rankings;
- processar denúncias;
- gerar relatórios;
- limpar arquivos temporários;
- consolidar reputação de árbitros.

## Regras

1. Jobs devem ser idempotentes.
2. Falhas devem ser registradas.
3. Jobs críticos devem ter retry.
4. Jobs não devem bloquear fluxo casual.
