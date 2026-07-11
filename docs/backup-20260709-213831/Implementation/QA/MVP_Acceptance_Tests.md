---
title: MVP Acceptance Tests
status: Review
version: 1.0.0
owner: Product Architecture
last_update: 2026-07-06
related_documents:
  []
---

# MVP Acceptance Tests

## Criar time

Dado que o usuário está autenticado, quando cria um time com nome válido, então o time é salvo e o usuário vira administrador.

## Criar partida rápida

Dado que existe um time, quando o usuário cria uma partida com adversário e placar, então a partida aparece no histórico.

## Registrar gol

Dado que existe uma partida, quando o usuário adiciona um gol, então o placar e artilharia são atualizados.

## Gerar card

Dado que uma partida tem placar, quando o usuário gera card, então uma imagem compartilhável é criada.

## Usuário casual

Dado que o usuário não preenche scout, quando finaliza partida, então o sistema ainda deve entregar histórico e compartilhamento.
