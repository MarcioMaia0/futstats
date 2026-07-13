---
title: Match Service
status: Draft
version: 1.1.0
owner: Product Architecture
last_update: 2026-07-13
---

# Match Service

## Objetivo

Especificar o servico da partida operacional.

Planejamento, liberacao da agenda e presenca pertencem a `Scheduled_Match_Service.md`.

## Responsabilidades

- criar partidas rapidas;
- criar partidas avancadas;
- salvar escalacao por quadro;
- atualizar placar;
- registrar gol rapido;
- registrar evento parcial;
- enriquecer evento salvo parcialmente;
- controlar status;
- finalizar partida;
- cancelar partida;
- registrar substituições;
- montar leitura de momentum da partida;
- registrar operadores da partida;
- vincular quadros;
- emitir eventos de dominio.

Este servico nao deve concentrar:

- criacao de compromisso futuro;
- liberacao do jogo para o time;
- resposta de presenca;
- cobranca de presenca.

## Metodos de aplicacao

- `createMatch`
- `saveFrameLineup`
- `registerQuickGoal`
- `createPartialMatchEvent`
- `enrichMatchEvent`
- `registerSubstitution`
- `getMatchMomentum`
- `registerMatchOpponentPlayer`
- `assignMatchOperatorScope`
- `updateScore`
- `finishMatch`
- `cancelMatch`

## Eventos emitidos

- `MatchCreated`
- `MatchLineupSaved`
- `MatchScoreUpdated`
- `MatchQuickGoalRegistered`
- `MatchEventRecorded`
- `MatchEventEnriched`
- `MatchSubstitutionRecorded`
- `MatchOperatorAssigned`
- `MatchFinished`
- `MatchCancelled`
- `MatchFrameLinked`

## Regras

- Nao exigir dados avancados no fluxo rapido.
- Nao assumir responsabilidade de agenda que pertence a `ScheduledMatchService`.
- Preservar historico de cancelamento.
- Recalcular estatisticas ao finalizar.
- Permitir edicoes controladas apos finalizacao.
- Permitir que o mesmo evento seja salvo em estagio minimo e enriquecido depois.
- Validar escopo operacional no backend para acoes ao vivo.
- Distinguir ator do próprio time e ator adversário quando o scout usar memória privada do adversário.
- Derivar a `Timeline de pressão do jogo` de eventos, gols e substituições canônicas, sem criar fonte factual paralela.

## Criterios de qualidade

- O fluxo deve funcionar para usuario casual sem exigir cadastro excessivo.
- Recursos avancados devem ser progressivos e opcionais.
- O comportamento deve preservar consistencia entre frontend, backend, API e banco.
- Todas as entidades tecnicas, payloads, enums e nomes internos devem usar ingles.
- Textos exibidos ao usuario devem passar por camada de linguagem/configuracao.

## Regras para IA

Ao usar este documento como contexto para implementacao, a IA deve:
1. preservar o principio de uso casual simples;
2. nao criar campos obrigatorios que bloqueiem o primeiro valor operacional;
3. respeitar separacao entre dado canonico e texto de interface;
4. manter compatibilidade com evolucao futura;
5. sugerir migrations, testes e endpoints quando alterar dominio.
