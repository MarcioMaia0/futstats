---
title: Data Integrity Rules
status: Draft
version: 0.9.0
owner: Product Architecture
last_update: 2026-07-06
---

# Data Integrity Rules


## Objetivo

Definir regras de integridade de dados.

## Regras

1. Partida finalizada não deve perder placar.
2. Evento de gol deve refletir no placar.
3. Jogador removido de time não apaga estatísticas antigas.
4. Árbitro avaliado mantém histórico mesmo se perfil for editado.
5. Adversários locais são privados por time até validação oficial.
6. Preferências de UI não alteram dados canônicos.

## Estratégia

Combinar constraints, serviços de domínio, testes automatizados e jobs de verificação.
