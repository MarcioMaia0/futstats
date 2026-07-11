---
title: Table Spec matches
status: Draft
version: 2.1.0
owner: Product Architecture
last_update: 2026-07-10
related_documents:
  - Table_Spec_scheduled_matches.md
  - Table_Spec_match_players.md
  - Table_Spec_match_events.md
  - Table_Spec_match_goals.md
  - Table_Spec_match_substitutions.md
  - Table_Spec_match_operator_assignments.md
  - ../../Domain/Matches.md
  - ../../API/Matches_API.md
  - ../../Implementation/Match_Operation_Technical_Contract.md
  - ../../Implementation/Services/Match_Service_Spec.md
---

# Table Spec matches

## Objetivo

Documentar `partidas operacionais (matches)` em nível técnico.

## Finalidade

`matches` representa a partida operacional real, aberta para escalação, cronômetro, placar, eventos e revisão posterior.

Ela existe para sustentar:

- operação do jogo na beira da quadra ou campo;
- abertura da partida a partir da agenda;
- operação por quadro;
- placar oficial da partida operacional;
- ponte para scout ao vivo e revisão por vídeo;
- consolidação do contexto factual onde os eventos do jogo acontecem.

## O que `matches` é

- entidade operacional do jogo;
- contexto factual onde a partida realmente acontece;
- contêiner do quadro em operação;
- origem dos relacionamentos, eventos, gols, substituições e staff da partida.

## O que `matches` não é

- não é agenda do time;
- não é resposta de presença;
- não é telemetria transitória de sincronização do cronômetro;
- não é a tabela final das estatísticas agregadas do atleta.

## Responsabilidade na cadeia do domínio

No fluxo correto:

1. o jogo pode existir antes na agenda em `scheduled_matches`;
2. a gestão abre a partida operacional;
3. nasce uma `match` para o quadro que vai operar;
4. escalação, placar, cronômetro e eventos passam a viver nesse contexto;
5. depois do encerramento operacional, a partida ainda pode receber revisão e enriquecimento analítico.

Logo:

- agenda pertence a `scheduled_matches`;
- presença declarada pertence a `match_attendance_responses`;
- partida real pertence a `matches`;
- fatos detalhados pertencem às tabelas filhas de partida.

## Quando nasce

`matches` pode nascer em dois contextos válidos:

1. abertura a partir de um `scheduled_match`;
2. criação direta para jogo que surgiu sem agendamento prévio.

## Quem grava

`matches` é gravada pela aplicação.

Casos de uso relevantes:

- `CreateMatchFromScheduledMatch`
- `CreateDirectMatch`
- `StartMatchOperation`
- `CompleteMatchOperation`
- `CancelMatch`
- `AttachDerivedScheduledMatch`

## Estrutura física sugerida

- schema: `public`
- nome da tabela: `matches`

## Colunas

### `id`

- tipo físico: `uuid`
- nulidade: `not null`
- default sugerido: `gen_random_uuid()`
- PK: sim

### `team_id`

- tipo físico: `uuid`
- nulidade: `not null`
- FK: `teams.id`
- `on update`: `cascade`
- `on delete`: `restrict`
- finalidade:
  - apontar o time dono da operação da partida.

### `scheduled_match_id`

- tipo físico: `uuid`
- nulidade: `nullable`
- FK: `scheduled_matches.id`
- `on update`: `cascade`
- `on delete`: `set null`
- finalidade:
  - ligar a partida operacional ao compromisso agendado quando ele existir.

### `opponent_type`

- tipo físico: `match_opponent_type`
- nulidade: `not null`
- finalidade:
  - distinguir se o adversário é um time oficial do app ou adversário local.

### `opponent_team_id`

- tipo físico: `uuid`
- nulidade: `nullable`
- FK: `teams.id`
- `on update`: `cascade`
- `on delete`: `restrict`
- finalidade:
  - apontar o time adversário quando ele existir como entidade oficial do app.

### `local_opponent_id`

- tipo físico: `uuid`
- nulidade: `nullable`
- FK: `local_opponents.id`
- `on update`: `cascade`
- `on delete`: `restrict`
- finalidade:
  - apontar o adversário privado/local quando aplicável.

### `opponent_name_snapshot`

- tipo físico: `text`
- nulidade: `not null`
- finalidade:
  - snapshot operacional do nome do adversário no momento da abertura da partida.

### `venue_id`

- tipo físico: `uuid`
- nulidade: `nullable`
- FK: `venues.id`
- `on update`: `cascade`
- `on delete`: `restrict`
- finalidade:
  - apontar o local formal conhecido quando houver.

### `venue_name_snapshot`

- tipo físico: `text`
- nulidade: `nullable`
- finalidade:
  - snapshot do nome do local da partida.

### `venue_address_snapshot`

- tipo físico: `text`
- nulidade: `nullable`
- finalidade:
  - snapshot do endereço do local da partida.

### `match_date`

- tipo físico: `date`
- nulidade: `not null`
- finalidade:
  - dia operacional da partida.

### `match_time`

- tipo físico: `time`
- nulidade: `nullable`
- finalidade:
  - horário operacional ou horário originalmente conhecido da partida.

### `status`

- tipo físico: `match_status`
- nulidade: `not null`
- default sugerido: `DRAFT`
- finalidade:
  - resumir o estado macro operacional do quadro.

### `operation_phase`

- tipo físico: `match_operation_phase`
- nulidade: `not null`
- default sugerido: `READY_TO_START`
- finalidade:
  - representar a fase detalhada oficial do quadro para UI, cronômetro e regras de operação.

### `analysis_status`

- tipo físico: `match_analysis_status`
- nulidade: `not null`
- default sugerido: `NOT_STARTED`
- finalidade:
  - resumir o estado da camada analítica pós-jogo.

### `match_type`

- tipo físico: `scheduled_match_type`
- nulidade: `not null`
- finalidade:
  - classificar a natureza do jogo.

### `modality`

- tipo físico: `sport_modality`
- nulidade: `not null`
- default sugerido: `FUTSAL`
- finalidade:
  - modalidade da partida operacional.

### `age_category`

- tipo físico: `scheduled_match_age_category`
- nulidade: `nullable`
- finalidade:
  - categoria etária do evento, quando aplicável.

### `organization_name`

- tipo físico: `text`
- nulidade: `nullable`
- finalidade:
  - registrar a liga, copa, festival ou organizador relacionado ao jogo.

### `starters_count`

- tipo físico: `integer`
- nulidade: `not null`
- finalidade:
  - quantidade de titulares esperados para aquela modalidade ou configuração do jogo.

### `frame_type`

- tipo físico: `frame_type`
- nulidade: `not null`
- finalidade:
  - identificar qual quadro essa partida representa.

### `home_score`

- tipo físico: `integer`
- nulidade: `not null`
- default sugerido: `0`
- finalidade:
  - placar atual/oficial do time dono da operação.

### `opponent_score`

- tipo físico: `integer`
- nulidade: `not null`
- default sugerido: `0`
- finalidade:
  - placar atual/oficial do adversário.

### `started_at`

- tipo físico: `timestamptz`
- nulidade: `nullable`
- finalidade:
  - registrar quando a operação do quadro começou.

### `ended_at`

- tipo físico: `timestamptz`
- nulidade: `nullable`
- finalidade:
  - registrar quando a operação do quadro foi encerrada.

### `cancelled_at`

- tipo físico: `timestamptz`
- nulidade: `nullable`
- finalidade:
  - registrar quando a partida foi cancelada.

### `created_by_user_id`

- tipo físico: `uuid`
- nulidade: `not null`
- FK: `users.id`
- `on update`: `cascade`
- `on delete`: `restrict`
- finalidade:
  - registrar quem abriu a partida.

### `cancelled_by_user_id`

- tipo físico: `uuid`
- nulidade: `nullable`
- FK: `users.id`
- `on update`: `cascade`
- `on delete`: `set null`
- finalidade:
  - registrar quem cancelou a partida, quando aplicável.

### `video_url`

- tipo físico: `text`
- nulidade: `nullable`
- finalidade:
  - link principal de vídeo usado como apoio operacional ou revisão posterior.

### `notes`

- tipo físico: `text`
- nulidade: `nullable`
- finalidade:
  - observação operacional livre.

### `created_at`

- tipo físico: `timestamptz`
- nulidade: `not null`
- default sugerido: `now()`

### `updated_at`

- tipo físico: `timestamptz`
- nulidade: `not null`
- default sugerido: `now()`
- manutenção sugerida:
  - trigger de atualização automática no update

## Enums físicos

### `match_status`

- `DRAFT`
- `IN_PROGRESS`
- `COMPLETED`
- `CANCELLED`

### `match_operation_phase`

- `READY_TO_START`
- `FIRST_HALF_LIVE`
- `FIRST_HALF_PAUSED`
- `HALFTIME`
- `SECOND_HALF_LIVE`
- `SECOND_HALF_PAUSED`
- `COMPLETED`
- `CANCELLED`

### `match_analysis_status`

- `NOT_STARTED`
- `IN_REVIEW`
- `FINALIZED`

### `match_opponent_type`

- `APP_TEAM`
- `LOCAL_OPPONENT`

### `frame_type`

- `UNIQUE_FRAME`
- `SECOND_FRAME`
- `FIRST_FRAME`

### `sport_modality`

- `FUTSAL`
- `SOCIETY`
- `FIELD`

### `scheduled_match_type`

- `FRIENDLY`
- `FESTIVAL`
- `LEAGUE`
- `TOURNAMENT`

### `scheduled_match_age_category`

- `YOUTH`
- `U17`
- `U20`
- `OPEN`
- `O35`
- `O40`
- `O50`
- `O55`

## Regras dos enums

### `match_status`

- `DRAFT`
  - partida criada, mas ainda sem quadro em andamento.

- `IN_PROGRESS`
  - quadro em andamento operacional em qualquer fase viva ou pausada.

- `COMPLETED`
  - operação do quadro encerrada.

- `CANCELLED`
  - partida cancelada sem apagar histórico.

### `match_operation_phase`

- `READY_TO_START`
  - a `match` já existe, a escalação do quadro foi salva, mas o cronômetro ainda não começou.

- `FIRST_HALF_LIVE`
  - o primeiro tempo está em andamento.

- `FIRST_HALF_PAUSED`
  - o primeiro tempo está pausado por interrupção operacional, mas não encerrado.

- `HALFTIME`
  - o primeiro tempo terminou e o segundo ainda não começou.

- `SECOND_HALF_LIVE`
  - o segundo tempo está em andamento.

- `SECOND_HALF_PAUSED`
  - o segundo tempo está pausado por interrupção operacional, mas não encerrado.

- `COMPLETED`
  - o quadro foi encerrado oficialmente.

- `CANCELLED`
  - o quadro foi cancelado oficialmente.

### `match_analysis_status`

- `NOT_STARTED`
  - sem revisão posterior iniciada.

- `IN_REVIEW`
  - revisão ou enriquecimento analítico em andamento.

- `FINALIZED`
  - camada analítica considerada fechada naquele momento.

### `frame_type`

- `UNIQUE_FRAME`
  - jogo de quadro único.

- `SECOND_FRAME`
  - partida operacional do segundo quadro.

- `FIRST_FRAME`
  - partida operacional do primeiro quadro.

## Constraints sugeridas

## Primary key

- `pk_matches`
  - colunas: `id`

## Foreign keys

- `fk_matches_team`
  - coluna: `team_id`
  - referência: `teams.id`
  - `on update cascade`
  - `on delete restrict`

- `fk_matches_scheduled_match`
  - coluna: `scheduled_match_id`
  - referência: `scheduled_matches.id`
  - `on update cascade`
  - `on delete set null`

- `fk_matches_opponent_team`
  - coluna: `opponent_team_id`
  - referência: `teams.id`
  - `on update cascade`
  - `on delete restrict`

- `fk_matches_local_opponent`
  - coluna: `local_opponent_id`
  - referência: `local_opponents.id`
  - `on update cascade`
  - `on delete restrict`

- `fk_matches_venue`
  - coluna: `venue_id`
  - referência: `venues.id`
  - `on update cascade`
  - `on delete restrict`

- `fk_matches_created_by_user`
  - coluna: `created_by_user_id`
  - referência: `users.id`
  - `on update cascade`
  - `on delete restrict`

- `fk_matches_cancelled_by_user`
  - coluna: `cancelled_by_user_id`
  - referência: `users.id`
  - `on update cascade`
  - `on delete set null`

## Check constraints sugeridas

- `ck_matches_opponent_name_snapshot_not_blank`
  - `btrim(opponent_name_snapshot) <> ''`

- `ck_matches_notes_not_blank_when_present`
  - se `notes is not null`, então `btrim(notes) <> ''`

- `ck_matches_video_url_not_blank_when_present`
  - se `video_url is not null`, então `btrim(video_url) <> ''`

- `ck_matches_score_non_negative`
  - `home_score >= 0 and opponent_score >= 0`

- `ck_matches_starters_count_positive`
  - `starters_count > 0`

- `ck_matches_time_order`
  - se `started_at is not null` e `ended_at is not null`, então `ended_at >= started_at`

- `ck_matches_cancelled_time_consistency`
  - se `status = 'CANCELLED'`, então `cancelled_at is not null`

- `ck_matches_completed_time_consistency`
  - se `status = 'COMPLETED'`, então `ended_at is not null`

- `ck_matches_in_progress_time_consistency`
  - se `status = 'IN_PROGRESS'`, então `started_at is not null`

- `ck_matches_operation_phase_vs_status`
  - se `operation_phase in ('READY_TO_START')`, então `status = 'DRAFT'`
  - se `operation_phase in ('FIRST_HALF_LIVE', 'FIRST_HALF_PAUSED', 'HALFTIME', 'SECOND_HALF_LIVE', 'SECOND_HALF_PAUSED')`, então `status = 'IN_PROGRESS'`
  - se `operation_phase = 'COMPLETED'`, então `status = 'COMPLETED'`
  - se `operation_phase = 'CANCELLED'`, então `status = 'CANCELLED'`

- `ck_matches_opponent_type_consistency`
  - se `opponent_type = 'APP_TEAM'`, então `opponent_team_id is not null` e `local_opponent_id is null`
  - se `opponent_type = 'LOCAL_OPPONENT'`, então `opponent_team_id is null`

- `ck_matches_frame_type_vs_scheduled_match`
  - validação semântica preferencialmente no serviço:
  - se `scheduled_match.match_frame_count = 1`, `frame_type` deve ser `UNIQUE_FRAME`
  - se `scheduled_match.match_frame_count = 2`, `frame_type` deve ser `SECOND_FRAME` ou `FIRST_FRAME`

## Unicidade

Não deve existir unicidade rígida simples por:

- `team_id + match_date + opponent_name_snapshot`

Porque pode haver mais de um quadro no mesmo dia contra o mesmo adversário.

Regras corretas:

1. se houver `scheduled_match_id`, deve existir no máximo uma `match` por `scheduled_match_id + frame_type`
2. se não houver `scheduled_match_id`, a prevenção de duplicidade deve acontecer no serviço de domínio

Nome sugerido:

- `uq_matches_scheduled_match_frame`
  - colunas: (`scheduled_match_id`, `frame_type`)
  - condição: `scheduled_match_id is not null`

## Índices sugeridos

- `idx_matches_team_id`
  - colunas: `team_id`
  - finalidade:
    - listar partidas do time.

- `idx_matches_scheduled_match_id`
  - colunas: `scheduled_match_id`
  - finalidade:
    - navegar da agenda para a partida.

- `idx_matches_match_date`
  - colunas: `match_date`
  - finalidade:
    - filtros por período.

- `idx_matches_team_id_status`
  - colunas: (`team_id`, `status`)
  - finalidade:
    - operação e listagens por estado.

- `idx_matches_team_id_modality`
  - colunas: (`team_id`, `modality`)
  - finalidade:
    - filtros por modalidade.

- `idx_matches_frame_type`
  - colunas: `frame_type`
  - finalidade:
    - leitura operacional por quadro.

- `idx_matches_analysis_status`
  - colunas: `analysis_status`
  - finalidade:
    - fila de revisão pós-jogo.

## Regras de negócio centrais

1. `matches` representa a partida operacional, não a agenda.
2. `scheduled_match_id` pode ser nulo para jogo criado sem agendamento prévio.
3. `status = COMPLETED` não significa que todos os dados analíticos estejam fechados.
4. `operation_phase` é a fonte mais detalhada da fase oficial do quadro.
5. `status` é a camada macro e não substitui `operation_phase`.
6. Fim de tempo e fim de partida não são pausas; são transições de período/fase.
7. Após o encerramento operacional, a partida pode continuar recebendo:
  - scout por vídeo;
  - correções de eventos;
  - enriquecimento estatístico;
  - revisão de autoria.
8. `modality` e `starters_count` podem nascer herdados da agenda ou do padrão da modalidade, mas podem ser sobrescritos na criação.
9. `modality` é independente de `match_type`.
10. `frame_type` representa o quadro daquela partida operacional.
11. Se um mesmo compromisso tiver segundo e primeiro quadro, cada quadro deve existir como partida operacional independente.
12. Quando o compromisso tiver dois quadros, o fluxo padrão do produto escala e opera primeiro o `SECOND_FRAME`; ao encerrar esse quadro, a UI pode oferecer a montagem do `FIRST_FRAME`.

## Regras de `Quantidade de titulares (starters_count)`

- `FUTSAL`
  - valor esperado: `5`
- `FIELD`
  - valor esperado: `11`
- `SOCIETY`
  - valor inicial padrão: `6`
  - ajuste operacional permitido: `7`

Regras:

- `starters_count` deve ser persistido na própria `match`;
- quando a `match` estiver vinculada a uma agenda, o ajuste também deve refletir em `scheduled_matches.starters_count`;
- a alteração operacional de `SOCIETY` não deve apagar a escalação já montada;
- o backend deve validar que a quantidade oficial de titulares em `match_players` respeita `matches.starters_count`.

## Regras de cronômetro

- O cronômetro oficial do quadro deve existir como camada operacional `local-first`.
- A telemetria transitória de sincronização, como `clock_heartbeat`, `clock_sync_state`, `offline_event_queue` e `blind_window`, não precisa ser persistida nesta tabela.
- O que pertence a `matches` é apenas o contexto operacional macro da partida, não os batimentos técnicos de sincronização.

## Regras de adversário

### Adversário oficial do app

Quando `opponent_type = APP_TEAM`:

- usar `opponent_team_id`
- manter `opponent_name_snapshot` como leitura congelada amigável
- não usar `local_opponent_id`

### Adversário local

Quando `opponent_type = LOCAL_OPPONENT`:

- usar `local_opponent_id` quando houver
- manter `opponent_name_snapshot` como verdade operacional mínima

## Relações com outras tabelas

## Relação com `scheduled_matches`

- tipo: `N -> 0..1`
- chave: `matches.scheduled_match_id -> scheduled_matches.id`
- regra:
  - uma partida pode nascer da agenda;
  - jogos sem agenda prévia podem ser religados depois a um `scheduled_match` derivado.

## Relação com `match_players`

- tipo: `1 -> N`
- regra:
  - jogadores relacionados pertencem ao contexto factual desta partida.

## Relação com `match_events`

- tipo: `1 -> N`
- regra:
  - eventos factuais da partida nascem dentro desta partida.

## Relação com `match_goals`

- tipo: `1 -> N`
- regra:
  - gols pertencem a este contexto de partida e quadro.

## Relação com `match_substitutions`

- tipo: `1 -> N`
- regra:
  - substituições pertencem a esta partida e ao seu quadro operacional.

## Relação com `match_operator_assignments`

- tipo: `1 -> N`
- regra:
  - a operação colaborativa ao vivo depende da atribuição de papéis sobre esta partida.

## Relação com `match_staff` e `match_referees`

- staff, técnico e arbitragem da partida são registrados em tabelas filhas contextualizadas nesta `match`.

## Regras operacionais por fluxo

### Criação a partir da agenda

Fluxo:

- receber `scheduled_match_id`
- validar `frame_type` compatível com `match_frame_count`
- montar escalação localmente na UI sem criar `match`
- criar `match` apenas quando a gestão salvar a escalação do quadro
- nascer com:
  - `status = DRAFT`
  - `operation_phase = READY_TO_START`

### Criação sem agenda

Fluxo:

- criar `match` com dados mínimos
- operar normalmente
- se necessário, criar depois `scheduled_match` derivado e religar

### Encerramento operacional

Fluxo:

- marcar `status = COMPLETED`
- marcar `operation_phase = COMPLETED`
- preencher `ended_at`
- manter aberta a possibilidade de revisão posterior

## Regras de transição por ação do cronômetro

### `Começar 1º tempo`

- grava evento:
  - `PERIOD_START`
  - `period_phase = FIRST_HALF`
- atualiza:
  - `status = IN_PROGRESS`
  - `operation_phase = FIRST_HALF_LIVE`
- se `started_at` estiver nulo:
  - preencher `started_at`

### `Pausa técnica`

- grava evento:
  - `CLOCK_PAUSE`
  - `metadata.pause_type = TECHNICAL_TIMEOUT`
- atualiza:
  - `FIRST_HALF_LIVE -> FIRST_HALF_PAUSED`
  - `SECOND_HALF_LIVE -> SECOND_HALF_PAUSED`

### `Pausa`

- grava evento:
  - `CLOCK_PAUSE`
  - `metadata.pause_type = GENERIC_PAUSE`
- atualiza:
  - `FIRST_HALF_LIVE -> FIRST_HALF_PAUSED`
  - `SECOND_HALF_LIVE -> SECOND_HALF_PAUSED`

### `Retomar 1º tempo`

- grava evento:
  - `CLOCK_RESUME`
  - `period_phase = FIRST_HALF`
- atualiza:
  - `operation_phase = FIRST_HALF_LIVE`

### `Fim do 1º tempo`

- grava evento:
  - `PERIOD_END`
  - `period_phase = FIRST_HALF`
- atualiza:
  - `status = IN_PROGRESS`
  - `operation_phase = HALFTIME`

### `Começar 2º tempo`

- grava evento:
  - `PERIOD_START`
  - `period_phase = SECOND_HALF`
- atualiza:
  - `status = IN_PROGRESS`
  - `operation_phase = SECOND_HALF_LIVE`

### `Retomar 2º tempo`

- grava evento:
  - `CLOCK_RESUME`
  - `period_phase = SECOND_HALF`
- atualiza:
  - `operation_phase = SECOND_HALF_LIVE`

### `Terminar partida`

- grava evento:
  - `MATCH_END`
  - `period_phase = POST_MATCH`
- atualiza:
  - `status = COMPLETED`
  - `operation_phase = COMPLETED`
  - `ended_at`

## Regras de segurança de transição

- não pode retomar se a partida não estiver pausada;
- não pode começar o 2º tempo fora de `HALFTIME`;
- não pode encerrar o 1º tempo fora de:
  - `FIRST_HALF_LIVE`
  - `FIRST_HALF_PAUSED`
- não pode terminar a partida se ela já estiver:
  - `COMPLETED`
  - `CANCELLED`

### Cancelamento

Fluxo:

- marcar `status = CANCELLED`
- marcar `operation_phase = CANCELLED`
- preencher `cancelled_at`
- preencher `cancelled_by_user_id`, quando ação humana
- preservar histórico

## O que não deve ficar em `matches`

Não devem ficar aqui:

- lista detalhada de atletas relacionados;
- eventos individuais;
- gols detalhados;
- substituições detalhadas;
- telemetria bruta de sincronização do cronômetro;
- estatísticas agregadas finais por atleta.

Esses dados pertencem, respectivamente, a:

- `match_players`
- `match_events`
- `match_goals`
- `match_substitutions`
- camada operacional transitória de sincronização
- tabelas derivadas como `player_match_statistics`

## Dependências diretas desta tabela

Esta tabela conversa diretamente com:

- `scheduled_matches`
- `teams`
- `local_opponents`
- `venues`
- `users`
- `match_players`
- `match_events`
- `match_goals`
- `match_substitutions`
- `match_operator_assignments`
- `Matches_API`

## Riscos de alteração futura

Mudanças em:

- semântica de `status`;
- cardinalidade entre agenda e quadros operacionais;
- regra de `frame_type`;
- separação entre operação e revisão analítica;
- modelagem de adversário

impactam em cascata:

- abertura de partida a partir da agenda;
- escalação;
- placar;
- eventos;
- substituições;
- estatísticas e revisão por vídeo.

## Resumo estrutural

`matches` é a partida de verdade no sistema. Quando a bola vai rolar, é aqui que o jogo passa a existir operacionalmente, quadro por quadro, sem misturar agenda, presença e telemetria transitória com o contexto factual principal da partida.
