---
title: Opponents Domain
status: Draft
version: 0.5.0
owner: Product Architecture
last_update: 2026-07-06
related_documents: [Teams.md, Matches.md]
---

# Opponents Domain

## Objetivo

Definir como adversários são registrados, isolados, importados e avaliados dentro do FUTSTATS.

## Contexto

Na várzea, o mesmo adversário pode ser conhecido por nomes diferentes. Forçar uma base global única desde o início gera duplicidade, conflito e dados incorretos.

## Solução

Cada time possui sua própria agenda de adversários locais. Um adversário local só se conecta a um time oficial quando esse time se cadastra e valida sua identidade.

## Entidades

### LocalOpponent

Adversário privado de um time.

### OfficialTeamLink

Ligação opcional entre adversário local e time oficial.

### OpponentReliability

Indicadores derivados de presença, cancelamentos e W.O.

## Regras

1. Adversários locais pertencem ao time que os cadastrou.
2. Nome do adversário local não altera nome oficial de outro time.
3. Cancelamentos devem ser mantidos no histórico.
4. Confiabilidade é derivada de partidas.
5. Um adversário pode virar time oficial no futuro.
6. Importação de adversário oficial não deve apagar histórico local.

## Casos de uso

- Cadastrar adversário local.
- Registrar contato do diretor rival.
- Marcar cancelamento do adversário.
- Ver histórico contra adversário.
- Vincular adversário a time oficial.
- Importar time oficial como adversário.

## Impacto no banco

Tabelas prováveis:

- `local_opponents`
- `opponent_reliability_snapshots`
- `opponent_official_links`

## Decisão

Isolamento local é obrigatório para evitar caos de dados.
