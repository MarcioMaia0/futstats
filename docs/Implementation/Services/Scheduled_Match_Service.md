---
title: Scheduled Match Service
status: Draft
version: 1.0.0
owner: Product Architecture
last_update: 2026-07-10
related_documents:
  - ../Database/Table_Spec_scheduled_matches.md
  - ../Database/Table_Spec_match_attendance_responses.md
  - ../../API/Scheduled_Matches_API.md
---

# Scheduled Match Service

## Objetivo

Especificar o servico de agenda de jogos, separado do servico de partida operacional.

## Responsabilidades

- criar compromisso futuro;
- editar compromisso;
- cancelar compromisso;
- liberar compromisso para o time;
- registrar presenca;
- registrar presenca em nome de outro integrante;
- disparar cobranca de presenca;
- abrir a partida operacional a partir do compromisso;
- emitir eventos de dominio relacionados a agenda.

## Metodos de aplicacao

- `createScheduledMatch`
- `updateScheduledMatch`
- `cancelScheduledMatch`
- `releaseScheduledMatchToTeam`
- `respondAttendance`
- `respondAttendanceOnBehalf`
- `sendAttendanceReminder`
- `createMatchFromScheduledMatch`

## Regras

- `ScheduledMatchService` nao deve registrar gols, eventos ou substituicoes.
- `ScheduledMatchService` nao substitui `MatchService`.
- Presenca deve usar `scheduled_match_id + team_member_id`.
- Liberacao para o time deve respeitar a politica de visibilidade do compromisso.
- O servico deve permitir fluxo normal e fluxo inverso, preservando a ligacao explicita entre agenda e partida.
