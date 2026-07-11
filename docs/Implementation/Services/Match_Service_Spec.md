---
title: Match Service Spec
status: Review
version: 1.13.0
owner: Product Architecture
last_update: 2026-07-10
related_documents: []
---

# Match Service Spec

## Objetivo

Este documento complementa a documentacao do FUTSTATS e deve ser usado como referencia durante produto, design, implementacao, QA e operacao.

## Contexto

O FUTSTATS deve entregar valor desde o primeiro jogo, priorizando entrada simples, social e compartilhavel, sem impedir que usuarios avancados explorem gestao, scout e inteligencia esportiva.

## Regra central

> O FUTSTATS nunca deve exigir comportamento analitico para entregar valor.

## Implicacao

Qualquer implementacao precisa funcionar em camadas: uso casual primeiro, profundidade opcional depois.

## Regras especificas

- Deve respeitar o principio casual-first.
- Deve funcionar com o menor numero possivel de dados obrigatorios.
- Deve permitir aprofundamento posterior sem refatoracao estrutural.
- Deve preservar consistencia entre produto, dominio, API, banco e UX.

## Criterios de aceite

- Fluxo principal documentado.
- Regras de erro previstas.
- Impacto no usuario casual considerado.
- Impacto no usuario avancado considerado.

## Contrato minimo para operacao ao vivo

### Objetivo

Permitir coleta colaborativa em tempo real com internet instavel, sem perder referencia confiavel do cronometro e sem impedir revisao posterior.

### Principios

- o cronometro da partida deve ser `local-first`;
- um aparelho assume o papel de `clock master`;
- outros aparelhos operam como clientes de captura;
- eventos podem ser registrados offline e sincronizados depois;
- divergencia pequena e aceitavel;
- janela cega longa deve ser detectada, sinalizada e tratada;
- o banco principal deve persistir a linha do tempo canonica dos eventos, e nao o historico detalhado da conectividade.

## Fases oficiais da partida operacional

Para cada `match` de um quadro especifico, o servico deve respeitar:

- `READY_TO_START`
- `FIRST_HALF_LIVE`
- `FIRST_HALF_PAUSED`
- `HALFTIME`
- `SECOND_HALF_LIVE`
- `SECOND_HALF_PAUSED`
- `COMPLETED`
- `CANCELLED`

Regras:

- `Fim do 1º tempo` e `Terminar partida` sao transicoes de periodo/fase;
- `Pausa tecnica` e `Pausa` sao interrupcoes do periodo atual;
- `status` macro da `match` e derivado da fase detalhada:
  - `READY_TO_START` -> `DRAFT`
  - fases de jogo e intervalo -> `IN_PROGRESS`
  - `COMPLETED` -> `COMPLETED`
  - `CANCELLED` -> `CANCELLED`

## Regras de transicao do cronometro

### `Comecar 1º tempo`

- criar evento `PERIOD_START` em `FIRST_HALF`;
- mudar `operation_phase` para `FIRST_HALF_LIVE`;
- preencher `started_at` quando ainda estiver nulo.

### `Pausa tecnica`

- criar evento `CLOCK_PAUSE`;
- marcar `metadata.pause_type = TECHNICAL_TIMEOUT`;
- mover a fase viva correspondente para a fase pausada correspondente.

### `Pausa`

- criar evento `CLOCK_PAUSE`;
- marcar `metadata.pause_type = GENERIC_PAUSE`;
- mover a fase viva correspondente para a fase pausada correspondente.

### `Retomar 1º tempo`

- criar evento `CLOCK_RESUME` em `FIRST_HALF`;
- mudar `operation_phase` para `FIRST_HALF_LIVE`.

### `Fim do 1º tempo`

- criar evento `PERIOD_END` em `FIRST_HALF`;
- mudar `operation_phase` para `HALFTIME`.

### `Comecar 2º tempo`

- criar evento `PERIOD_START` em `SECOND_HALF`;
- mudar `operation_phase` para `SECOND_HALF_LIVE`.

### `Retomar 2º tempo`

- criar evento `CLOCK_RESUME` em `SECOND_HALF`;
- mudar `operation_phase` para `SECOND_HALF_LIVE`.

### `Terminar partida`

- criar evento `MATCH_END` em `POST_MATCH`;
- mudar `operation_phase` para `COMPLETED`;
- mudar `status` para `COMPLETED`;
- preencher `ended_at`.

## Guard rails de transicao

- nao permitir `Retomar 1º tempo` fora de `FIRST_HALF_PAUSED`;
- nao permitir `Retomar 2º tempo` fora de `SECOND_HALF_PAUSED`;
- nao permitir `Comecar 2º tempo` fora de `HALFTIME`;
- nao permitir `Fim do 1º tempo` fora de:
  - `FIRST_HALF_LIVE`
  - `FIRST_HALF_PAUSED`
- nao permitir `Terminar partida` quando a partida ja estiver:
  - `COMPLETED`
  - `CANCELLED`

## Regras de salvamento da escalação

- o serviço deve validar `Quantidade de titulares (starters_count)` por modalidade:
  - `FUTSAL = 5`
  - `FIELD = 11`
  - `SOCIETY = 6` por padrão
- em `SOCIETY`, o serviço pode aceitar ajuste operacional para `7`;
- ao salvar a escalação:
  - relacionados precisam ser `>= starters_count`;
  - titulares precisam ser `= starters_count`;
  - todo titular precisa estar dentro do conjunto de relacionados;
- nao existe limite maximo de relacionados;
- todo relacionado sem `is_starter = true` deve ser tratado como reserva;
- todo relacionado deve possuir `shirt_number`;
- o banco pode ficar vazio quando a lista total for igual ao minimo configurado;
- a posicao inicial nao precisa ser exigida por padrao, exceto para o goleiro titular;
- o servico deve exigir exatamente um goleiro titular configurado;
- o `shirt_number` recebido pelo servico deve ser tratado como numero confirmado para aquele quadro, mesmo quando existir numero pre-configurado no cadastro do atleta;
- quando `SOCIETY` mudar `starters_count`, o serviço deve persistir:
  - `matches.starters_count`;
  - `scheduled_matches.starters_count`, quando houver vínculo;
- a alteração de `starters_count` não deve apagar a escalação já montada;
- quando a partida já começou:
  - o serviço deve bloquear alteração retroativa da escalação inicial de titulares;
  - mas deve permitir edição do elenco relacionado para:
    - jogador atrasado;
    - inclusão de avulso;
    - correção de camisa;
- após `status = COMPLETED`, esses ajustes continuam permitidos em modo de revisão por vídeo.

## Separação de comandos do serviço

- `saveInitialLineup`
  - persiste apenas a escalação inicial antes do cronômetro;
- `updateRelatedPlayers`
  - mantém o elenco relacionado depois da escalação inicial.
- `updateOpponentPlayers`
  - mantém os jogadores adversários operacionais da partida.

### Regras do `updateRelatedPlayers`

- `ADD`
  - cria `match_player` com `is_starter = false`;
- `ADD_GUEST`
  - cria ou reaproveita `person + player` antes de criar `match_player`;
- `UPDATE_SHIRT_NUMBER`
  - altera apenas a camisa confirmada naquele quadro;
- `REMOVE`
  - sem fatos dependentes, pode remover fisicamente;
  - com fatos dependentes, deve marcar remoção lógica;
- toda operação deve preservar a integridade de:
  - eventos;
  - gols;
  - substituições;
  - avaliações;
  - demais vínculos factuais da partida.

Para `REMOVE`, contam como fatos dependentes que bloqueiam exclusão física:

- `eventos da partida (match_events)`:
  - `primary_match_player_id`
  - `secondary_match_player_id`
  - `marking_failure_match_player_id`
- `gols da partida (match_goals)`:
  - `match_player_id`
- `substituições da partida (match_substitutions)`:
  - `player_in_match_player_id`
  - `player_out_match_player_id`
- `avaliações da partida (match_ratings)`:
  - `target_match_player_id`

Não bloqueia exclusão física por si só:

- `posições usadas pelo atleta na partida (match_players_positions)`

Se existirem apenas posições associadas, o serviço pode limpar `match_players_positions` e apagar `match_players` fisicamente na mesma transação.

### Regras do `updateOpponentPlayers`

- `UPDATE`
  - altera apenas dados contextuais do adversário naquela partida;
- `REMOVE`
  - sem fatos dependentes, pode remover fisicamente;
  - com fatos dependentes, deve marcar remoção lógica.

Para `REMOVE`, contam como fatos dependentes que bloqueiam exclusão física:

- `eventos da partida (match_events)`:
  - `primary_match_opponent_player_id`
  - `secondary_match_opponent_player_id`
- `substituições da partida (match_substitutions)`:
  - `opponent_player_in_match_opponent_player_id`
  - `opponent_player_out_match_opponent_player_id`

O serviço deve usar `removed_at`, `removed_by_user_id` e `removal_reason` quando a remoção lógica for necessária.

## Regras de leitura do rascunho de escalação

- o serviço de leitura de `GET /api/v1/matches/:match_id` deve montar uma visão pronta para a tela;
- quando a partida estiver em:
  - `status = DRAFT`
  - `operation_phase = READY_TO_START`
- a resposta deve incluir:
  - `related_players`
  - `available_players`
  - `lineup_draft`
  - `coach_context`
- `related_players` deve nascer de:
  - `match_players`
  - enriquecido por `match_players_positions`
- `available_players` deve nascer do elenco elegível do time, excluindo quem já está relacionado;
- a ordenação de `available_players` deve respeitar a prioridade oficial da escalação:
  - quadro atual + `GOING`
  - quadro atual + `MAYBE`
  - quadro atual + `GOING_NOT_PLAYING`
  - outro quadro + `GOING`
  - outro quadro + `MAYBE`
  - outro quadro + `GOING_NOT_PLAYING`
  - avulsos
- `lineup_draft.goalkeeper_match_player_id` deve ser resolvido como fonte oficial do goleiro definido para o quadro;
- o serviço não deve devolver apenas linhas soltas de banco;
  - deve devolver uma leitura pronta para reidratar a UI.

## Regras de leitura e confirmação do técnico

- `coach_context.preconfigured_coach_person_id` deve nascer de `team_staff_defaults` por modalidade;
- `coach_context.confirmed_coach_person_id` deve nascer de `match_staff` com `staff_role = HEAD_COACH`;
- o serviço deve permitir três estados válidos na escalação:
  - técnico sugerido e ainda não confirmado;
  - técnico confirmado;
  - partida sem técnico confirmado naquele momento;
- trocar o técnico na escalação afeta somente `match_staff` da partida;
- remover o técnico confirmado da partida não deve apagar `team_staff_defaults`.

## Regras do registro de gols

### `registerQuickGoal`

- deve exigir apenas:
  - `match_id`
  - `participant_side`
- pode receber opcionalmente:
  - `match_player_id`
  - `player_id`
  - `clock_second`
  - `own_goal`
- se `participant_side = OPPONENT`:
  - o serviço não pode exigir `match_opponent_player`;
  - o gol continua válido sem autor identificado;
- ao persistir:
  - cria `match_goals`;
  - recalcula placar da `match`.

### `registerDetailedGoal`

- aceita enriquecimento adicional de:
  - `assist_player_id`
  - `minute`
  - `linked_match_event_id`
- se `own_goal = true`:
  - `assist_player_id` deve ser `null`;
- se `linked_match_event_id` existir:
  - deve pertencer ao mesmo `match_id`;
- se `match_player_id` existir:
  - deve pertencer ao mesmo `match_id`;
- se `player_id` existir junto com `match_player_id`:
  - ambos devem ser coerentes entre si.

### `editGoalAttribution`

- deve aceitar correção de:
  - `participant_side`
  - `match_player_id`
  - `player_id`
  - `assist_player_id`
  - `clock_second`
  - `minute`
  - `own_goal`
  - `linked_match_event_id`
- se `goal_id` não existir para aquele `match_id`:
  - deve falhar com erro de não encontrado;
- se `own_goal = true`:
  - `assist_player_id` deve ser `null`;
- se `linked_match_event_id` existir:
  - deve pertencer ao mesmo `match_id`;
- se `participant_side = OPPONENT`:
  - o serviço continua sem poder exigir `match_opponent_player`;
  - o gol pode permanecer ou voltar a ficar sem autor identificado;
- após editar:
  - recalcula o placar da `match`;
  - preserva consistência com estatísticas derivadas.

## Regras do registro de substituições

### `registerSubstitution`

- deve exigir:
  - `match_id`
  - `participant_side`
- pode receber:
  - `clock_second`
- se `participant_side = HOME`:
  - deve exigir `player_out_match_player_id`;
  - deve exigir `player_in_match_player_id`;
  - não pode aceitar atores do adversário preenchidos;
- se `participant_side = OPPONENT`:
  - deve exigir `opponent_player_out_match_opponent_player_id`;
  - deve exigir `opponent_player_in_match_opponent_player_id`;
  - não pode aceitar atores do próprio time preenchidos;
- todos os atores referenciados devem pertencer ao mesmo `match_id`;
- a operação não cria relacionado novo;
  - apenas registra a troca entre atores já existentes;
- diferente do fluxo de gol ou evento do adversário:
  - a substituição do adversário exige identificação explícita de quem saiu e de quem entrou;
- ao persistir:
  - cria `match_substitutions`;
  - atualiza a leitura temporal de presença efetiva em quadra ou campo.

## Regras do registro de eventos

### `createMatchEvent`

- deve exigir:
  - `match_id`
  - `event_type`
  - `participant_side`
  - `completion_stage`
- pode aceitar:
  - `clock_second`
  - `period_phase`
  - atores do próprio time;
  - atores do adversário;
  - coordenadas;
  - metadados ricos do fluxo;
- `completion_stage` deve aceitar:
  - `MINIMAL`
  - `PARTIAL`
  - `DETAILED`
- `REVIEWED` não deve ser estágio de criação inicial;
- se `participant_side = OPPONENT`:
  - o serviço não pode exigir `primary_match_opponent_player_id` em todo evento;
  - ele só pode exigir ator quando aquele microfluxo realmente depender disso;
- se `event_type` for marco forte:
  - `PERIOD_START`
  - `PERIOD_END`
  - `CLOCK_PAUSE`
  - `CLOCK_RESUME`
  - `MATCH_END`
  - o serviço deve validar as informações de fase e contexto desse marco;
- se `event_type = CLOCK_PAUSE`:
  - `metadata.pause_type` deve existir;
- coordenadas devem respeitar pares completos;
- ao persistir:
  - cria `match_events`;
  - preserva coerência temporal da partida;
  - deixa o evento apto para enriquecimento posterior.

### `enrichMatchEvent`

- deve exigir:
  - `match_id`
  - `event_id`
- pode corrigir ou acrescentar:
  - atores;
  - `participant_side`;
  - `context_side`;
  - `completion_stage`;
  - `period_phase`;
  - `clock_second`;
  - `event_order`;
  - coordenadas;
  - metadados ricos;
  - flags de revisão temporal;
- `completion_stage` pode evoluir até `REVIEWED`;
- se `participant_side = OPPONENT`:
  - o serviço continua sem poder exigir ator em todo tipo de evento;
- se o evento for de marco forte:
  - a edição deve preservar as regras desse marco;
- se `event_type = CLOCK_PAUSE`:
  - `metadata.pause_type` continua obrigatório;
- ao persistir:
  - atualiza `match_events`;
  - preserva coerência temporal e semântica da partida.

## `clock_heartbeat`

### Objetivo

Publicar periodicamente a referencia oficial do cronometro do quadro em andamento.

### Campos minimos

- `heartbeat_sequence`
- `clock_session_id`
- `match_id`
- `clock_status`
- `clock_second`
- `master_device_id`
- `master_device_timestamp`
- `server_received_at` (nullable)

### Regras

- `heartbeat_sequence` deve ser monotonico dentro da mesma `clock_session_id`;
- `match_id` ja identifica o quadro operacional ativo, portanto o contrato nao precisa repetir `frame_type`;
- `clock_session_id` deve mudar quando houver:
  - inicio do cronometro;
  - pausa;
  - retomada;
  - troca de quadro;
- `clock_status` deve aceitar no minimo:
  - `RUNNING`
  - `PAUSED`
  - `STOPPED`
- `clock_heartbeat` e contrato operacional de sincronizacao e nao precisa ser persistido no banco principal do produto.

## `clock_sync_state`

### Objetivo

Guardar, por aparelho cliente, o estado mais recente de sincronizacao com o cronometro oficial.

### Campos minimos

- `match_id`
- `device_id`
- `current_clock_session_id`
- `last_heartbeat_sequence`
- `previous_heartbeat_sequence`
- `last_heartbeat_received_at_device_time`
- `previous_heartbeat_received_at_device_time`
- `last_known_clock_second`
- `estimated_clock_offset_ms`
- `estimated_round_trip_ms`
- `blind_window_status`
- `clock_confidence`

### Regras

- `blind_window_status` deve aceitar no minimo:
  - `NONE`
  - `OPEN`
  - `RECOVERED`
- `clock_confidence` deve aceitar no minimo:
  - `HIGH`
  - `MEDIUM`
  - `LOW`
  - `CRITICAL`
- o cliente deve manter memoria do ultimo e do penultimo heartbeat validos;
- o cliente deve conseguir estimar:
  - ha quanto tempo esta sem referencia;
  - quao confiavel esta o cronometro local;
  - se esta operando em janela cega.
- `clock_sync_state` pode existir apenas no app, em cache operacional ou em infraestrutura transitoria.

## `offline_event_queue`

### Objetivo

Persistir localmente eventos ainda nao confirmados pelo backend.

### Campos minimos

- `event_local_id`
- `match_id`
- `event_type`
- `event_payload`
- `device_id`
- `created_by_user_id`
- `captured_at_device_timestamp`
- `captured_at_monotonic_ms`
- `local_clock_second`
- `clock_session_id`
- `last_known_heartbeat_sequence`
- `seconds_since_last_heartbeat`
- `local_event_sequence`
- `sync_status`
- `retry_count`
- `last_retry_at`

### Regras

- `sync_status` deve aceitar no minimo:
  - `PENDING`
  - `SENT`
  - `ACKNOWLEDGED`
  - `FAILED`
  - `REQUIRES_REVIEW`
- o reenvio nunca pode substituir o timestamp original de captura;
- `local_event_sequence` deve preservar a ordem causal do aparelho;
- eventos pendentes devem ser reenviados em toda oportunidade segura de sincronizacao.
- `offline_event_queue` e fila operacional e nao precisa ser materializada como tabela canonica do dominio.

## `blind_window`

### Objetivo

Representar explicitamente o intervalo em que um aparelho registrou eventos sem confirmacao recente do cronometro oficial.

### Campos minimos

- `match_id`
- `device_id`
- `clock_session_id`
- `blind_window_started_at_device_time`
- `blind_window_ended_at_device_time` (nullable)
- `started_after_heartbeat_sequence`
- `recovered_on_heartbeat_sequence` (nullable)
- `estimated_duration_seconds`
- `max_estimated_clock_drift_seconds`
- `affected_events_count`
- `resolution_status`

### Regras

- `resolution_status` deve aceitar no minimo:
  - `OPEN`
  - `AUTO_RESOLVED`
  - `REVIEW_REQUIRED`
- uma `blind_window` deve nascer quando o cliente perder referencia suficiente do cronometro mestre;
- uma `blind_window` recuperada deve disparar:
  - recalculo dos eventos pendentes do intervalo;
  - reclassificacao da confianca dos eventos;
  - encaminhamento para revisao, se necessario.
- `blind_window` pode ser descartavel depois da consolidacao temporal dos eventos.

## `event_confidence`

### Objetivo

Classificar o quao confiavel esta o tempo atribuido a cada evento registrado.

### Campos minimos

- `event_local_id` ou `match_event_id`
- `confidence_level`
- `confidence_reason`
- `clock_session_id`
- `heartbeat_gap_seconds`
- `used_auto_adjustment`
- `requires_manual_review`

### Regras

- `confidence_level` deve aceitar no minimo:
  - `HIGH`
  - `MEDIUM`
  - `LOW`
  - `CRITICAL`
- a confianca deve considerar:
  - tempo desde o ultimo heartbeat;
  - qualidade da latencia estimada;
  - existencia de janela cega;
  - necessidade de ajuste retroativo;
  - coerencia temporal com outros eventos.

## Persistencia canonica de eventos

### Objetivo

Garantir que o banco principal guarde a linha do tempo oficial da partida, ja consolidada o suficiente para leitura consistente.

### Regras

- o que interessa persistir e o evento com tempo canonico coerente com o restante da partida;
- a infraestrutura de sincronizacao existe para produzir esse tempo canonico, nao para virar historico principal de banco;
- a linha do tempo oficial deve impedir, por exemplo:
  - evento apos encerramento do periodo;
  - evento fora da faixa valida do quadro;
  - sequencia temporal fisicamente implausivel quando houver regra forte para isso;
- conflitos graves devem gerar revisao manual antes da consolidacao final.

## Regra de ajuste automatico

- o sistema deve tentar recalcular automaticamente eventos lancados dentro de janela cega;
- o ajuste deve usar no minimo:
  - `heartbeat_sequence`;
  - `clock_session_id`;
  - timestamps locais;
  - ordem local dos eventos;
  - referencia do heartbeat recuperado;
- o sistema nao deve esconder incerteza grave;
- quando a divergencia estimada for alta, o evento deve ser marcado para revisao manual.

## Regra de consistencia temporal canonica

- todo `match_event` persistido deve respeitar tres camadas de validacao:
  - faixa temporal;
  - ordem temporal;
  - plausibilidade semantica;
- exemplos de inconsistencia que o sistema deve barrar ou marcar:
  - gol no primeiro tempo aos `25:00` com encerramento do periodo aos `23:00`;
  - eventos incompativeis em sequencia impossivel, como um contexto de gol seguido de acao incompativel apenas um segundo depois;
- pequenos ajustes automaticos sao aceitaveis;
- divergencia relevante deve resultar em:
  - `time_confidence` menor;
  - `is_time_reviewed = false`;
  - exigencia de revisao manual.

## Marcos fortes do tempo

- os seguintes eventos devem ser tratados como marcos fortes da linha do tempo:
  - `PERIOD_START`
  - `PERIOD_END`
  - `CLOCK_PAUSE`
  - `CLOCK_RESUME`
  - `MATCH_END`
- marcos fortes ancoram a faixa valida dos demais eventos;
- nenhum evento de jogo pode ficar canonicamente:
  - antes do `PERIOD_START` do mesmo periodo;
  - depois do `PERIOD_END` do mesmo periodo;
  - depois do `MATCH_END` do mesmo quadro;
- ajustes automaticos nunca devem atravessar um marco forte.

## Regras minimas de plausibilidade temporal

- eventos podem compartilhar o mesmo segundo quando isso for plausivel no fluxo do jogo;
- quando dois eventos ocorrerem no mesmo segundo, `event_order` deve resolver a ordem oficial;
- as seguintes situacoes devem ser tratadas como suspeitas por padrao:
  - evento ofensivo depois de `PERIOD_END`;
  - evento em segundo superior ao encerramento canonico do periodo;
  - sequencia invertida em que um evento depende de outro, mas aparece antes dele;
  - cadeia muito improvavel logo apos um `GOAL`, sem tempo plausivel para reposicao e retomada;
- a suspeita nao precisa bloquear automaticamente em todos os casos;
- quando houver seguranca alta, o sistema pode ajustar;
- quando houver ambiguidade real, o sistema deve exigir revisao manual.

## Politica inicial de ajuste automatico

- o sistema pode reajustar automaticamente pequenos desvios de tempo quando:
  - o evento continua dentro da faixa entre dois marcos fortes;
  - a ordem relativa dos eventos do mesmo aparelho continua coerente;
  - nao surge contradicao com encerramento de periodo ou fim de partida;
- o sistema nao deve reajustar automaticamente quando:
  - houver conflito com `PERIOD_END` ou `MATCH_END`;
  - houver salto temporal grande sem referencia segura;
  - a correcao puder inverter uma sequencia ja consolidada com alta confianca.
