---
title: Offline First Strategy
status: Draft
version: 0.9.0
owner: Product Architecture
last_update: 2026-07-06
---

# Offline First Strategy


## Objetivo

Definir como o FUTSTATS deve lidar com conexão instável durante jogos.

## Contexto

Jogos de várzea frequentemente acontecem em quadras, escolas e ginásios com internet ruim. O produto não pode depender totalmente de conexão contínua.

## Regras

1. Registro de placar e gols deve funcionar offline quando possível.
2. Dados devem ser sincronizados quando a conexão voltar.
3. Conflitos devem ser resolvidos com logs claros.
4. Usuário deve saber se algo ainda não sincronizou.
5. Modo offline deve priorizar dados mínimos: partida, placar, gols e jogadores.

## Estratégia

- Cache local no app.
- Fila local de ações.
- Sincronização incremental.
- Identificadores temporários no cliente.
- Reconciliação no servidor.

## Risco

Offline aumenta complexidade. Deve ser planejado desde cedo, mas implementado progressivamente.
