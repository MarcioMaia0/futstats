---
title: Players Domain
status: Draft
version: 0.3.0
owner: Product Architecture
last_update: 2026-07-06
related_documents: []
---

# Players Domain

## Objetivo

Representar atletas e seu histórico esportivo.

## Regras

1. Player é diferente de user.
2. Player pode nascer incompleto.
3. Jogador pode atuar em vários times.
4. Avulsos devem ser aceitos sem burocracia.
5. Estatísticas permanecem no histórico.

## Casos de uso

- Criar jogador rápido.
- Reivindicar perfil.
- Vincular a time.
- Registrar avulso.
- Ver estatísticas.

## Tipos de player e pool de pessoas

Quatro tipos, conforme a relação com user e time:

1. É user e no elenco (1+ times) — interage plenamente (nota, comentário).
2. É user, fora do elenco — pode ser avulso numa partida; interage como player só naquela partida, torcedor nas demais.
3. Não é user, no elenco fixo — recebe notas/comentários nomeado, mas não interage.
4. Não é user nem no elenco — avulso da partida; recebe só nota.

`players` é um **pool único de pessoas do time**: o mesmo registro serve como jogador, técnico ou árbitro — o papel é atribuição por partida. Pessoas sem conta são registros do time (`owner_team_id`), reutilizáveis e buscáveis; pessoas com conta são globais (`user_id`). Técnico e árbitro seguem a mesma mecânica por partida (`match_appearances` com `role = COACH`; `match_referees`). Ver `../Implementation/Database/Table_Spec_players.md`.
