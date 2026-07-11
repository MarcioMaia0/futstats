---
title: Screen: Match Scoreboard
status: Draft
version: 0.9.0
owner: Product Architecture
last_update: 2026-07-09
related_documents:
  - ./Lineup_And_Live_Operation.md
---

# Screen: Match Scoreboard

## Objetivo

Placar e resumo rapido do jogo durante o acompanhamento da partida.

## Elementos

- escudo do proprio time;
- placar;
- escudo do adversario;
- status do quadro;
- tempo do jogo;
- acessos rapidos para gols e eventos simples;
- acesso a superficie completa de operacao ao vivo quando disponivel.

## Campos

- `home_score`
- `opponent_score`
- `frame_type`
- `match_status`
- `analysis_status`

## Regras de UX

- Priorizar clareza e simplicidade.
- Exibir apenas campos essenciais inicialmente.
- Mostrar acoes primarias com destaque.
- Permitir avanco para detalhes.
- Respeitar tema e modo de linguagem.
- Nao deve tentar substituir a superficie operacional completa para quem deseja scout rico.
- Deve funcionar como camada de acesso rapido para usuarios menos analiticos.

## Estados

- loading;
- empty;
- error;
- success;
- offline quando aplicavel.

## Eventos

- registrar gol rapido;
- ajustar placar;
- escolher autor do gol por avatar ou numero da camisa;
- editar gol por acao dedicada na web ou `long press` no mobile;
- abrir superficie operacional completa;
- finalizar quadro ou partida, respeitando permissao.
