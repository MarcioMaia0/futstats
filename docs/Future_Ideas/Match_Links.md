---
title: Future Idea - Match Links
status: Idea
version: 1.0.0
owner: Product Architecture
last_update: 2026-07-09
related_documents:
  - ../Domain/Matches.md
  - ../Implementation/Database/Table_Spec_matches.md
  - ../Implementation/Database/Table_Spec_scheduled_matches.md
---

# Future Idea: Match Links

## Objetivo

Avaliar uma camada dedicada para relacionar partidas entre si quando houver vinculos esportivos, operacionais ou narrativos.

## Problema que a ideia resolve

Nem toda relacao entre jogos cabe naturalmente em um unico campo simples.

Em alguns casos, pode haver necessidade de dizer que duas ou mais partidas estao conectadas.

## Exemplos de uso

- segundo quadro ligado ao primeiro quadro;
- revanche ligada ao confronto anterior;
- ida e volta;
- jogo substituto de outro cancelado;
- partida derivada de um mesmo evento esportivo;
- relacionamento entre partida operacional e desdobramentos futuros.

## Valor potencial

- navegacao contextual;
- relatorios compostos;
- leitura historica mais rica;
- agrupamento de partidas relacionadas.

## Status

Ideia valida para evolucao futura, mas ainda nao e tabela canonica do modelo atual.
