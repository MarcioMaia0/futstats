---
title: Match Operation Reusables
status: Draft
version: 1.0.0
owner: Product Architecture
last_update: 2026-07-09
related_documents:
  - ./Screens/Lineup_And_Live_Operation.md
  - ../Implementation/Match_Operation_Technical_Contract.md
---

# Match Operation Reusables

## Objetivo

Centralizar componentes, hooks e metodos reutilizaveis da superficie operacional de partida sem depender do catalogo legado enquanto ele nao for normalizado.

## Reaproveitados

### ConfirmationModal

- usar em edicao rapida de gol e confirmacoes sensiveis.

### ImagePreviewCard

- usar em foto opcional de jogador adversario local.

### ImageAcquisitionFlow

- usar quando o operador quiser foto de jogador adversario local.

### EntitySearchInput

- pode ser evoluido para busca de atleta e adversario em fluxos auxiliares.

### ToggleField

- pode ser reaproveitado em preferencias operacionais simples.

## Novos componentes

### MatchScoreStrip

- escudos, placar e cronometro;
- suporte a gol rapido e edicao rapida.

### MatchBoardCanvas

- superficie isometrica de quadra ou campo.

### MatchActorCardGrid

- grid de cards dos atletas fora da quadra.

### MatchActorToken

- avatar ou circulo com numero para atores em quadra.

### QuickGoalAttributionSheet

- atribuicao rapida do autor do gol por avatar ou numero.

### ContextualRadialMenu

- menu radial com `Ataque (ATTACK)` e `Defesa (DEFENSE)`.

### BallTargetBoard

- destino espacial da bola em fluxos ricos.

### BenchSwapTray

- substituicao por selecao do banco.

### PartialSaveActionBar

- `Salvar`, `Cancelar` e `Desfazer` em qualquer etapa do microfluxo.

### OperatorScopePanel

- configuracao visual de responsabilidades dos operadores.

## Novos hooks e metodos

### useMatchBoardActors

- hidrata atores da partida para a superficie.

### useLineupSelection

- controla relacionados, titulares e banco.

### useCasualGoalRegistration

- registra gol por toque no escudo e abre atribuicao rapida.

### useContextualMicroflow

- controla o estado do microfluxo contextual.

### usePartialEventDraft

- salva o nucleo minimo e permite enriquecimento posterior.

### useBenchSubstitution

- trata o gesto de substituicao.

### useMatchOperatorAssignments

- carrega e valida responsabilidades dos operadores.

### useMatchClockControl

- controla o cronometro no operador autorizado.
