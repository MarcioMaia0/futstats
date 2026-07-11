---
title: Table Spec match events
status: Draft
version: 1.4.0
owner: Product Architecture
last_update: 2026-07-09
related_documents:
  - Table_Spec_match_players.md
  - Table_Spec_match_opponent_players.md
  - Table_Spec_match_substitutions.md
---

# Table Spec match events

## Objetivo

Especificar tabela `match_events`.

## Finalidade

Registrar eventos granulares de partida.

Esta tabela serve para camada mais fina de eventos taticos e operacionais, como:

- gols;
- assistencias;
- cartoes;
- faltas;
- defesas;
- eventos futuros de scout.

## Campos sugeridos

- `id`
- `match_id`
- `frame_type`
- `period_phase`
- `event_type`
- `occurred_at`
- `clock_second`
- `event_order`
- `participant_side`
- `context_side`
- `time_confidence`
- `is_time_reviewed`
- `canonicalized_at`
- `primary_match_player_id`
- `secondary_match_player_id`
- `primary_match_opponent_player_id`
- `secondary_match_opponent_player_id`
- `origin_x`
- `origin_y`
- `target_x`
- `target_y`
- `body_part`
- `shot_outcome`
- `save_difficulty`
- `marking_failure_match_player_id`
- `raw_clock_second`
- `completion_stage`
- `is_quick_mode`
- `metadata`
- `created_at`

## Regras

- `primary_match_player_id` e `secondary_match_player_id` permitem capturar o contexto do atleta do proprio time na partida.
- `primary_match_opponent_player_id` e `secondary_match_opponent_player_id` permitem apontar atores adversarios quando o fluxo usar memoria privada do adversario.
- `frame_type` deve registrar em qual quadro o evento ocorreu.
- `clock_second` deve representar o tempo canonico do evento dentro do quadro ou periodo.
- `event_order` deve resolver a ordenacao oficial da linha do tempo quando dois eventos ficarem temporalmente muito proximos.
- `participant_side` deve indicar se o ator principal pertence ao proprio time ou ao adversario.
- `context_side` deve guardar o pre-filtro semantico `Ataque (ATTACK)` ou `Defesa (DEFENSE)`.
- `time_confidence` deve registrar o grau de confianca do tempo consolidado do evento.
- `is_time_reviewed` deve indicar se houve revisao manual do tempo daquele evento.
- `canonicalized_at` deve registrar quando o evento teve seu tempo consolidado.
- `origin_x/origin_y` guardam a origem espacial do lance quando houver dado de prancheta.
- `target_x/target_y` guardam destino espacial da bola ou da acao, quando aplicavel.
- `body_part`, `shot_outcome` e `save_difficulty` nao sao obrigatorios em todo evento; existem para microfluxos ricos.
- `marking_failure_match_player_id` permite registrar quem falhou na marcacao em lances relevantes.
- `raw_clock_second` pode guardar o tempo bruto de captura para auditoria leve, sem persistir toda a telemetria de sincronizacao.
- `completion_stage` deve indicar o quanto daquele microfluxo foi preenchido no momento do salvamento.
- `is_quick_mode = true`
  - evento criado pelo fluxo casual rapido.
- `metadata` pode armazenar detalhes avancados que nao merecam coluna dedicada.
- Evento pode nao ter player no modo casual.
- Evento pode ser salvo de forma parcial, desde que o nucleo minimo daquele tipo de evento tenha sido preenchido.
- Alteracoes devem recalcular dependentes.
- Esta tabela nao substitui `match_substitutions`.
- `match_substitutions` registra trocas; `match_events` registra lances e acontecimentos.
- nenhum evento pode ficar canonicamente depois do encerramento do mesmo periodo ou quadro.
- sequencias temporalmente implausiveis devem ser ajustadas automaticamente quando houver seguranca, ou marcadas para revisao manual.
- eventos de marco forte, como `PERIOD_START`, `PERIOD_END`, `CLOCK_PAUSE`, `CLOCK_RESUME` e `MATCH_END`, devem ancorar a linha do tempo oficial.
- `event_order` deve ser obrigatorio na consolidacao quando dois ou mais eventos compartilham o mesmo `clock_second`.

## Enums sugeridos

- `participant_side`
  - `HOME`
  - `OPPONENT`
- `event_context_side`
  - `ATTACK`
  - `DEFENSE`
- `event_completion_stage`
  - `MINIMAL`
  - `PARTIAL`
  - `DETAILED`
  - `REVIEWED`
- `body_part`
  - `RIGHT_FOOT`
  - `LEFT_FOOT`
  - `HEAD`
  - `OTHER`
- `shot_outcome`
  - `GOAL`
  - `SAVED`
  - `OFF_TARGET`
  - `BLOCKED`
- `save_difficulty`
  - `EASY`
  - `MEDIUM`
  - `HARD`
  - `MIRACLE`
