---
title: Match Operation Phase 1 Checklist
status: Draft
version: 1.0.0
owner: Product Architecture
last_update: 2026-07-09
related_documents:
  - Match_Operation_Technical_Contract.md
  - Database/Table_Spec_matches.md
  - Database/Table_Spec_match_players.md
  - Database/Table_Spec_match_substitutions.md
  - ../API/Matches_API.md
  - Services/Match_Service.md
---

# Match Operation Phase 1 Checklist

## Objetivo

Transformar a `Fase tecnica 1: Base operacional minima` em um checklist executavel de implementacao.

Esta fase deve colocar a partida operacional basica em funcionamento com:

- criacao de `match`;
- salvamento de escalacao por quadro;
- gol rapido;
- substituicao basica;
- finalizacao da partida.

## Decisao de primeiro pacote

O primeiro pacote de codigo deve ser o contrato backend minimo de Match Operation.

Escopo do primeiro pacote:

- migrations ou schema equivalente para `matches`, `match_players`, `match_events` e `match_substitutions`;
- metodos minimos do `MatchOperationService`;
- endpoints minimos de `Matches API`;
- testes de caso de uso e integracao para o fluxo feliz da Fase 1.

Fora do primeiro pacote:

- prancheta visual;
- drag and drop;
- atores adversarios identificados;
- operadores colaborativos;
- microfluxos ricos;
- revisao por video;
- campos espaciais obrigatorios.

## Checklist de banco

- [ ] Confirmar enums minimos usados pela Fase 1:
  - `match_status`;
  - `match_analysis_status`;
  - `opponent_type`;
  - `frame_type`;
  - `participant_side`;
  - `event_completion_stage`.
- [ ] Implementar ou validar `matches` com campos minimos:
  - `id`;
  - `team_id`;
  - `scheduled_match_id`;
  - `opponent_type`;
  - `opponent_team_id`;
  - `local_opponent_id`;
  - `venue_id`;
  - `match_date`;
  - `status`;
  - `analysis_status`;
  - `match_type`;
  - `modality`;
  - `starters_count`;
  - `frame_type`;
  - `home_score`;
  - `opponent_score`;
  - `video_url`;
  - `created_at`;
  - `updated_at`.
- [ ] Implementar ou validar `match_players` com:
  - uma linha por atleta relacionado por `match_id + team_id + player_id + frame_type`;
  - `is_starter`;
  - `shirt_number`;
  - suporte a jogador avulso via `is_team_player = false`.
- [ ] Implementar ou validar `match_events` para gol rapido com:
  - `event_type`;
  - `participant_side`;
  - `frame_type`;
  - `clock_second`;
  - `primary_match_player_id`;
  - `primary_match_opponent_player_id`;
  - `completion_stage`;
  - `is_quick_mode`;
  - `metadata`.
- [ ] Implementar ou validar `match_substitutions` para troca basica do proprio time:
  - `match_id`;
  - `participant_side`;
  - `team_id`;
  - `player_in_match_player_id`;
  - `player_out_match_player_id`;
  - `clock_second`.
- [ ] Adicionar indices minimos para:
  - timeline de eventos por `match_id + frame_type + clock_second + event_order`;
  - relacionados por `match_id + team_id + frame_type`;
  - substituicoes por `match_id + clock_second`.
- [ ] Garantir que campos avancados da Fase 4+ permanecam opcionais.

## Checklist de servico

- [ ] Criar `MatchOperationService` ou consolidar em `MatchService` sem duplicar regra.
- [ ] Implementar `createMatch`.
- [ ] Implementar `saveFrameLineup`.
- [ ] Implementar `registerQuickGoal`.
- [ ] Implementar `registerSubstitution`.
- [ ] Implementar `finishMatch`.
- [ ] Implementar `cancelMatch`, se o endpoint ja estiver exposto no mesmo pacote.
- [ ] Emitir eventos de dominio minimos:
  - `MatchCreated`;
  - `MatchLineupSaved`;
  - `MatchQuickGoalRegistered`;
  - `MatchSubstitutionRecorded`;
  - `MatchFinished`;
  - `MatchCancelled`, quando aplicavel.
- [ ] Centralizar recalculo de placar no servico, nao na UI.
- [ ] Validar que gol rapido pode existir sem autor.
- [ ] Validar que substituicao nao cria nem remove relacionado; apenas registra a troca.

## Checklist de API

- [ ] `POST /matches`
  - cria partida operacional minima;
  - aceita fluxo sem agendamento previo;
  - inicializa `status` e `analysis_status`.
- [ ] `GET /matches/:match_id`
  - retorna partida, relacionados, eventos de gol rapido e substituicoes basicas.
- [ ] `PATCH /matches/:match_id`
  - atualiza campos simples permitidos antes da finalizacao.
- [ ] `POST /matches/:match_id/lineups/:frame_type/save`
  - salva relacionados, titulares e reservas do quadro.
- [ ] `POST /matches/:match_id/goals/quick`
  - registra gol do proprio time ou adversario;
  - atualiza placar;
  - aceita autor nulo.
- [ ] `POST /matches/:match_id/substitutions`
  - registra quem saiu, quem entrou, tempo e quadro.
- [ ] `POST /matches/:match_id/finish`
  - muda `status` para `COMPLETED`;
  - dispara consolidacao basica.
- [ ] `POST /matches/:match_id/cancel`
  - muda `status` para `CANCELLED`;
  - preserva historico.

## Contratos de payload minimos

### Criar partida

```json
{
  "team_id": "uuid",
  "scheduled_match_id": "uuid|null",
  "opponent_type": "APP_TEAM|LOCAL_OPPONENT",
  "opponent_team_id": "uuid|null",
  "local_opponent_id": "uuid|null",
  "venue_id": "uuid|null",
  "match_date": "ISO-8601",
  "match_type": "string|null",
  "modality": "FUTSAL|SOCIETY|FIELD",
  "starters_count": 5,
  "frame_type": "UNIQUE_FRAME|SECOND_FRAME|FIRST_FRAME"
}
```

### Salvar escalacao

```json
{
  "players": [
    {
      "player_id": "uuid",
      "shirt_number": 10,
      "is_starter": true,
      "is_team_player": true
    }
  ]
}
```

### Gol rapido

```json
{
  "participant_side": "HOME|OPPONENT",
  "frame_type": "UNIQUE_FRAME|SECOND_FRAME|FIRST_FRAME",
  "clock_second": 742,
  "primary_match_player_id": "uuid|null",
  "primary_match_opponent_player_id": "uuid|null"
}
```

### Substituicao basica

```json
{
  "participant_side": "HOME",
  "frame_type": "UNIQUE_FRAME|SECOND_FRAME|FIRST_FRAME",
  "clock_second": 1200,
  "player_out_match_player_id": "uuid",
  "player_in_match_player_id": "uuid"
}
```

## Regras de validacao da Fase 1

- [ ] Nao exigir escalacao para criar uma partida.
- [ ] Nao exigir autor para registrar gol rapido.
- [ ] Nao exigir dados espaciais para gol rapido.
- [ ] Nao permitir alterar placar diretamente de forma divergente dos eventos, salvo endpoint administrativo futuro.
- [ ] Nao permitir substituicao entre atletas de partidas diferentes.
- [ ] Nao permitir substituicao entre quadros diferentes.
- [ ] Nao permitir finalizar partida cancelada.
- [ ] Nao permitir cancelar partida ja finalizada sem regra explicita posterior.
- [ ] Ao finalizar, manter `analysis_status = NOT_STARTED` quando nao houver revisao iniciada.

## Testes minimos

- [ ] Cria partida minima sem agenda.
- [ ] Cria partida com adversario local.
- [ ] Salva escalacao de quadro unico com titulares e reservas.
- [ ] Registra gol rapido do proprio time com autor.
- [ ] Registra gol rapido do adversario sem autor.
- [ ] Atualiza placar a partir de gols rapidos.
- [ ] Registra substituicao basica do proprio time.
- [ ] Barra substituicao com jogadores de outra partida.
- [ ] Finaliza partida em andamento.
- [ ] Cancela partida em rascunho ou em andamento.
- [ ] Garante que campos de scout rico continuam opcionais.

## Criterio de pronto

A Fase 1 esta pronta quando uma partida puder ser criada, receber uma escalacao simples, registrar gols rapidos, registrar substituicoes basicas e ser finalizada por API e servico, sem depender da UI de prancheta e sem exigir scout avancado.
