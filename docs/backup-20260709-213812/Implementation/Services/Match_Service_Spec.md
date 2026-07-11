---
title: Match Service Spec
status: Review
version: 1.2.0
owner: Product Architecture
last_update: 2026-07-09
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

## `clock_heartbeat`

### Objetivo

Publicar periodicamente a referencia oficial do cronometro do quadro em andamento.

### Campos minimos

- `heartbeat_sequence`
- `clock_session_id`
- `match_id`
- `frame_type`
- `clock_status`
- `clock_second`
- `master_device_id`
- `master_device_timestamp`
- `server_received_at` (nullable)

### Regras

- `heartbeat_sequence` deve ser monotonico dentro da mesma `clock_session_id`;
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
- `frame_type`
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
- `frame_type`
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
- `frame_type`
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
