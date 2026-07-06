---
title: Venues Domain
status: Draft
version: 0.5.0
owner: Product Architecture
last_update: 2026-07-06
related_documents: [Matches.md, Statistics.md]
---

# Venues Domain

## Objetivo

Definir como locais de jogo e quadras são registrados e usados para organização e análise.

## Contexto

O local influencia o jogo. Piso, cobertura, dimensão e ambiente podem alterar desempenho.

## Entidades

### Venue

Local ou complexo esportivo.

### Court

Quadra específica dentro de um local.

### VenueAttributes

Características como piso, cobertura e tipo.

## Regras

1. Local é independente de adversário.
2. Uma partida pode ter local opcional.
3. Tipo de piso deve ser canônico.
4. Cobertura deve ser registrada quando conhecida.
5. Estatísticas por local devem ser derivadas.
6. O uso casual não exige cadastro de quadra.

## Tipos iniciais

- `WOOD`
- `CONCRETE`
- `SYNTHETIC`
- `SOCIETY`
- `OTHER`

## Cobertura

- `INDOOR`
- `OUTDOOR`
- `PARTIAL`

## Casos de uso

- Cadastrar local.
- Cadastrar quadra.
- Associar partida ao local.
- Ver desempenho por piso.
- Ver desempenho por quadra.

## Decisão

Quadra não deve ser atributo do adversário. Ela é entidade própria.
