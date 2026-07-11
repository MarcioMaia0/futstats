---
title: Table Spec match events
status: Draft
version: 2.2.0
owner: Product Architecture
last_update: 2026-07-10
related_documents:
  - Table_Spec_matches.md
  - Table_Spec_match_players.md
  - Table_Spec_match_opponent_players.md
  - Table_Spec_match_substitutions.md
  - Table_Spec_match_goals.md
  - ../../Domain/Matches.md
  - ../../API/Matches_API.md
  - ../../Implementation/Match_Operation_Technical_Contract.md
  - ../../Implementation/Services/Match_Service_Spec.md
---

# Table Spec match events

## Objetivo

Documentar `eventos da partida (match_events)` em nível técnico.

## Finalidade

`match_events` representa a camada fina e progressiva de scout e acontecimentos da partida.

Ela existe para sustentar:

- lances detalhados;
- fluxo casual e fluxo hardcore na mesma base;
- salvamento parcial de microfluxos;
- leitura temporal e espacial dos acontecimentos;
- enriquecimento posterior por revisão;
- base para estatísticas e inferências futuras.

## O que `match_events` é

- registro factual de acontecimento da partida;
- linha temporal canônica do scout;
- entidade progressiva que pode nascer mínima e ser enriquecida depois.

## O que `match_events` não é

- não é substituição;
- não é apenas gol;
- não é telemetria de sincronização do cronômetro;
- não é estatística agregada final.

## Responsabilidade na cadeia do domínio

No fluxo correto:

1. a partida existe em `matches`;
2. os atletas relacionados existem em `match_players`;
3. um lance acontece;
4. nasce um `match_event` mínimo, parcial ou detalhado;
5. revisões posteriores podem consolidar tempo, atores e metadados;
6. estatísticas e leituras derivadas usam essa base factual.

Logo:

- trocas de atores pertencem a `match_substitutions`;
- lances e acontecimentos pertencem a `match_events`;
- gols podem ter tabela própria complementar, mas o evento fino continua vivendo aqui quando o fluxo assim exigir.

## Quando nasce

`match_events` nasce quando um acontecimento relevante do jogo é registrado.

Ele pode nascer:

1. pelo fluxo casual rápido;
2. pelo fluxo contextual parcial;
3. pelo fluxo detalhado rico;
4. por revisão posterior.

## Quem grava

`match_events` é gravada pela aplicação.

Casos de uso relevantes:

- `CreateQuickEvent`
- `CreatePartialEvent`
- `EnrichExistingEvent`
- `CanonicalizeEventTime`
- `ReviewMatchEvent`

## Estrutura física sugerida

- schema: `public`
- nome da tabela: `match_events`

## Colunas

### `id`

- tipo físico: `uuid`
- nulidade: `not null`
- default sugerido: `gen_random_uuid()`
- PK: sim

### `match_id`

- tipo físico: `uuid`
- nulidade: `not null`
- FK: `matches.id`
- `on update`: `cascade`
- `on delete`: `restrict`
- finalidade:
  - apontar a qual partida o evento pertence.

### `period_phase`

- tipo físico: `match_period_phase`
- nulidade: `nullable`
- finalidade:
  - marcar período ou fase contextual do quadro quando a modalidade ou evolução futura exigir essa distinção.

### `event_type`

- tipo físico: `match_event_type`
- nulidade: `not null`
- finalidade:
  - classificar o acontecimento registrado.

### `occurred_at`

- tipo físico: `timestamptz`
- nulidade: `nullable`
- finalidade:
  - registrar o timestamp absoluto de captura ou consolidação do evento.

### `clock_second`

- tipo físico: `integer`
- nulidade: `nullable`
- finalidade:
  - segundo canônico do cronômetro dentro do quadro.

### `event_order`

- tipo físico: `integer`
- nulidade: `nullable`
- finalidade:
  - resolver a ordenação oficial quando múltiplos eventos compartilham o mesmo `clock_second`.

### `participant_side`

- tipo físico: `participant_side`
- nulidade: `not null`
- finalidade:
  - indicar se o ator principal pertence ao próprio time ou ao adversário.

### `context_side`

- tipo físico: `event_context_side`
- nulidade: `nullable`
- finalidade:
  - guardar o pré-filtro semântico `Ataque (ATTACK)` ou `Defesa (DEFENSE)`.

### `time_confidence`

- tipo físico: `match_event_time_confidence`
- nulidade: `nullable`
- finalidade:
  - registrar o grau de confiança do tempo consolidado do evento.

### `is_time_reviewed`

- tipo físico: `boolean`
- nulidade: `not null`
- default sugerido: `false`
- finalidade:
  - indicar se houve revisão manual do tempo.

### `canonicalized_at`

- tipo físico: `timestamptz`
- nulidade: `nullable`
- finalidade:
  - registrar quando o tempo do evento foi consolidado.

### `primary_match_player_id`

- tipo físico: `uuid`
- nulidade: `nullable`
- FK: `match_players.id`
- `on update`: `cascade`
- `on delete`: `restrict`
- finalidade:
  - ator principal do próprio time quando identificado.

### `secondary_match_player_id`

- tipo físico: `uuid`
- nulidade: `nullable`
- FK: `match_players.id`
- `on update`: `cascade`
- `on delete`: `restrict`
- finalidade:
  - ator secundário do próprio time quando identificado.

### `primary_match_opponent_player_id`

- tipo físico: `uuid`
- nulidade: `nullable`
- FK: `match_opponent_players.id`
- `on update`: `cascade`
- `on delete`: `restrict`
- finalidade:
  - ator principal do adversário quando identificado.

### `secondary_match_opponent_player_id`

- tipo físico: `uuid`
- nulidade: `nullable`
- FK: `match_opponent_players.id`
- `on update`: `cascade`
- `on delete`: `restrict`
- finalidade:
  - ator secundário do adversário quando identificado.

### `origin_x`

- tipo físico: `numeric`
- nulidade: `nullable`
- finalidade:
  - coordenada horizontal de origem do lance.

### `origin_y`

- tipo físico: `numeric`
- nulidade: `nullable`
- finalidade:
  - coordenada vertical de origem do lance.

### `target_x`

- tipo físico: `numeric`
- nulidade: `nullable`
- finalidade:
  - coordenada horizontal de destino.

### `target_y`

- tipo físico: `numeric`
- nulidade: `nullable`
- finalidade:
  - coordenada vertical de destino.

### `body_part`

- tipo físico: `body_part`
- nulidade: `nullable`
- finalidade:
  - parte do corpo usada no evento, quando aplicável.

### `shot_outcome`

- tipo físico: `shot_outcome`
- nulidade: `nullable`
- finalidade:
  - resultado da finalização, quando aplicável.

### `save_difficulty`

- tipo físico: `save_difficulty`
- nulidade: `nullable`
- finalidade:
  - dificuldade da defesa do goleiro, quando aplicável.

### `marking_failure_match_player_id`

- tipo físico: `uuid`
- nulidade: `nullable`
- FK: `match_players.id`
- `on update`: `cascade`
- `on delete`: `restrict`
- finalidade:
  - registrar quem falhou na marcação em lances relevantes do lado do próprio time.

### `raw_clock_second`

- tipo físico: `integer`
- nulidade: `nullable`
- finalidade:
  - tempo bruto capturado antes de consolidação.

### `completion_stage`

- tipo físico: `event_completion_stage`
- nulidade: `not null`
- default sugerido: `MINIMAL`
- finalidade:
  - indicar quanto do microfluxo foi preenchido naquele salvamento.

### `is_quick_mode`

- tipo físico: `boolean`
- nulidade: `not null`
- default sugerido: `false`
- finalidade:
  - marcar evento criado por fluxo casual rápido.

### `metadata`

- tipo físico: `jsonb`
- nulidade: `nullable`
- finalidade:
  - guardar detalhes avançados que não mereçam coluna dedicada imediata.

### `created_at`

- tipo físico: `timestamptz`
- nulidade: `not null`
- default sugerido: `now()`

## Enums físicos

### `participant_side`

- `HOME`
- `OPPONENT`

### `event_context_side`

- `ATTACK`
- `DEFENSE`

### `event_completion_stage`

- `MINIMAL`
- `PARTIAL`
- `DETAILED`
- `REVIEWED`

### `body_part`

- `RIGHT_FOOT`
- `LEFT_FOOT`
- `HEAD`
- `OTHER`

### `shot_outcome`

- `GOAL`
- `SAVED`
- `OFF_TARGET`
- `BLOCKED`

### `save_difficulty`

- `EASY`
- `MEDIUM`
- `HARD`
- `MIRACLE`

### `match_event_time_confidence`

- `HIGH`
- `MEDIUM`
- `LOW`
- `BLIND_WINDOW_ESTIMATED`

### `match_period_phase`

- `FIRST_HALF`
- `HALFTIME`
- `SECOND_HALF`
- `POST_MATCH`

### `match_event_type`

- `PERIOD_START`
- `PERIOD_END`
- `CLOCK_PAUSE`
- `CLOCK_RESUME`
- `MATCH_END`
- `SHOT`
- `GOAL`
- `FOUL`
- `PASS`
- `DRIBBLE`
- `SAVE`
- `BLOCK`
- `CARD`
- `TURNOVER`
- `INTERCEPTION`
- `TACKLE`
- `ASSIST`

## Regras dos enums

### `match_period_phase`

- `FIRST_HALF`
  - evento pertencente ao primeiro tempo.

- `HALFTIME`
  - evento pertencente ao intervalo entre primeiro e segundo tempo.

- `SECOND_HALF`
  - evento pertencente ao segundo tempo.

- `POST_MATCH`
  - evento pertencente ao estado imediatamente posterior ao encerramento do quadro.

### `event_context_side`

- `ATTACK`
  - pré-filtro semântico ofensivo.

- `DEFENSE`
  - pré-filtro semântico defensivo.

### `event_completion_stage`

- `MINIMAL`
  - evento salvo com o núcleo mínimo.

- `PARTIAL`
  - evento salvo com parte relevante do microfluxo.

- `DETAILED`
  - evento salvo com preenchimento rico.

- `REVIEWED`
  - evento revisado ou consolidado posteriormente.

## Constraints sugeridas

## Primary key

- `pk_match_events`
  - colunas: `id`

## Foreign keys

- `fk_match_events_match`
  - coluna: `match_id`
  - referência: `matches.id`
  - `on update cascade`
  - `on delete restrict`

- `fk_match_events_primary_match_player`
  - coluna: `primary_match_player_id`
  - referência: `match_players.id`
  - `on update cascade`
  - `on delete restrict`

- `fk_match_events_secondary_match_player`
  - coluna: `secondary_match_player_id`
  - referência: `match_players.id`
  - `on update cascade`
  - `on delete restrict`

- `fk_match_events_primary_match_opponent_player`
  - coluna: `primary_match_opponent_player_id`
  - referência: `match_opponent_players.id`
  - `on update cascade`
  - `on delete restrict`

- `fk_match_events_secondary_match_opponent_player`
  - coluna: `secondary_match_opponent_player_id`
  - referência: `match_opponent_players.id`
  - `on update cascade`
  - `on delete restrict`

- `fk_match_events_marking_failure_match_player`
  - coluna: `marking_failure_match_player_id`
  - referência: `match_players.id`
  - `on update cascade`
  - `on delete restrict`

## Check constraints sugeridas

- `ck_match_events_clock_second_non_negative_when_present`
  - se `clock_second is not null`, então `clock_second >= 0`

- `ck_match_events_raw_clock_second_non_negative_when_present`
  - se `raw_clock_second is not null`, então `raw_clock_second >= 0`

- `ck_match_events_event_order_positive_when_present`
  - se `event_order is not null`, então `event_order > 0`

- `ck_match_events_coordinates_complete_in_pairs`
  - `origin_x` e `origin_y` devem aparecer juntos
  - `target_x` e `target_y` devem aparecer juntos

## Índices sugeridos

- `idx_match_events_match_id`
  - colunas: `match_id`
  - finalidade:
    - listar eventos da partida.

- `idx_match_events_primary_match_player_id`
  - colunas: `primary_match_player_id`
  - finalidade:
    - histórico por atleta do próprio time.

- `idx_match_events_event_type`
  - colunas: `event_type`
  - finalidade:
    - filtros e agregações por tipo.

- `idx_match_events_match_id_clock_second`
  - colunas: (`match_id`, `clock_second`)
  - finalidade:
    - timeline do quadro.

- `idx_match_events_match_id_clock_second_event_order`
  - colunas: (`match_id`, `clock_second`, `event_order`)
  - finalidade:
    - ordenação canônica fina.

- `idx_match_events_completion_stage`
  - colunas: `completion_stage`
  - finalidade:
    - fila de revisão e enriquecimento.

## Regras de negócio centrais

1. `primary_match_player_id` e `secondary_match_player_id` permitem capturar o contexto do atleta do próprio time.
2. `primary_match_opponent_player_id` e `secondary_match_opponent_player_id` permitem apontar atores adversários.
3. Como `matches` já representa um quadro específico, o evento herda esse contexto pelo próprio `match_id`.
4. `clock_second` deve representar o tempo canônico do evento dentro do quadro.
5. `event_order` deve resolver a ordenação oficial quando dois eventos ficarem muito próximos.
6. `participant_side` deve indicar de qual lado está o ator principal.
7. `context_side` guarda o pré-filtro `Ataque (ATTACK)` ou `Defesa (DEFENSE)`.
8. `body_part`, `shot_outcome` e `save_difficulty` não são obrigatórios em todo evento.
9. `completion_stage` deve indicar o grau de preenchimento do microfluxo.
10. Evento pode não ter `player` no modo casual.
11. Evento pode ser salvo de forma parcial, desde que o núcleo mínimo daquele tipo tenha sido preenchido.
12. `PERIOD_START`, `PERIOD_END` e `MATCH_END` são transições de período/fase, não pausas.
13. `CLOCK_PAUSE` e `CLOCK_RESUME` são interrupções do período atual, não encerramento de período.
14. `CLOCK_PAUSE` deve diferenciar em `metadata.pause_type`, no mínimo:
  - `TECHNICAL_TIMEOUT`
  - `GENERIC_PAUSE`
15. `MATCH_END` é suficiente para encerrar oficialmente o quadro; o produto não precisa exigir um `PERIOD_END` separado do segundo tempo.
16. Se `participant_side = OPPONENT`, o evento pode existir sem `primary_match_opponent_player_id`, desde que o núcleo mínimo do tipo de evento continue válido para o fluxo usado.

## Regras de consistência contextual

### Coerência com a partida

O backend deve validar que:

- qualquer `match_player_id` referenciado pertence ao mesmo `match_id`
- qualquer `match_opponent_player_id` referenciado pertence ao mesmo `match_id`

### Coerência de lado

Se `participant_side = HOME`:

- o ator principal preferencialmente deve estar em `primary_match_player_id`
- não deve exigir ator adversário principal

Se `participant_side = OPPONENT`:

- o ator principal preferencialmente deve estar em `primary_match_opponent_player_id`
- não deve exigir ator do próprio time como principal
- não deve exigir `primary_match_opponent_player_id` em todo evento, porque a operação pode registrar acontecimento do adversário sem ator identificado

### Coerência temporal

- nenhum evento pode ficar canonicamente depois do encerramento do mesmo quadro
- sequências temporalmente implausíveis devem ser ajustadas automaticamente quando houver segurança ou marcadas para revisão
- eventos de marco forte, como `PERIOD_START`, `PERIOD_END`, `CLOCK_PAUSE`, `CLOCK_RESUME` e `MATCH_END`, devem ancorar a timeline oficial
- `PERIOD_END` do primeiro tempo deve encerrar o espaço válido de eventos de `FIRST_HALF`
- `PERIOD_START` do segundo tempo deve abrir o espaço válido de eventos de `SECOND_HALF`
- `event_order` deve ser obrigatório na consolidação quando dois ou mais eventos compartilharem o mesmo `clock_second`

## Relações com outras tabelas

## Relação com `matches`

- tipo: `N -> 1`
- chave: `match_events.match_id -> matches.id`
- regra:
  - todo evento pertence a uma partida operacional específica.

## Relação com `match_players`

- tipo: `N -> 0..3`
- regra:
  - permite capturar ator principal, ator secundário e falha de marcação do próprio time.

## Relação com `match_opponent_players`

- tipo: `N -> 0..2`
- regra:
  - permite capturar atores adversários quando essa memória existir.

## Relação com `match_substitutions`

- `match_events` não substitui `match_substitutions`
- `match_substitutions` registra trocas
- `match_events` registra lances e acontecimentos

## Regras operacionais por fluxo

### Fluxo casual

Exemplo:

- toque no escudo
- atribuição rápida do autor
- salva evento mínimo ou parcial

Nesse caso:

- `is_quick_mode = true`
- `completion_stage` tende a `MINIMAL` ou `PARTIAL`

Núcleo mínimo esperado:

- `event_type`
- `participant_side`

### Fluxo do adversário com ator opcional

Exemplo:

- o operador quer registrar apenas que o adversário chutou ou marcou gol;
- o jogador adversário específico não foi identificado.

Nesse caso:

- `participant_side = OPPONENT` continua válido;
- `primary_match_opponent_player_id` pode permanecer `null`;
- o evento continua podendo existir, desde que o tipo e o restante do núcleo mínimo do fluxo sejam coerentes.

### Fluxo contextual parcial

Exemplo:

- arrastou o atleta
- escolheu `Ataque (ATTACK)` ou `Defesa (DEFENSE)`
- escolheu um tipo de ação
- salvou antes de completar tudo

Nesse caso:

- o evento continua válido
- enriquecimento posterior pode completar os campos faltantes

Núcleo mínimo esperado:

- `event_type`
- `participant_side`
- os dados mínimos coerentes com o microfluxo efetivamente percorrido

### Fluxo rico

Exemplo:

- origem espacial
- destino da bola
- parte do corpo
- resultado da finalização
- dificuldade da defesa

Nesse caso:

- `completion_stage = DETAILED`

Núcleo mínimo esperado:

- tudo que já era obrigatório no `PARTIAL`
- mais os detalhes ricos que o fluxo conseguiu coletar

### Revisão posterior

Fluxo:

- ajustar tempo
- corrigir ator
- completar microdados
- promover para `REVIEWED` quando aplicável

Regra:

- `REVIEWED` pertence ao fluxo de edição/revisão, não ao de criação inicial;
- a revisão pode corrigir:
  - tempo;
  - lado;
  - atores;
  - coordenadas;
  - detalhes ricos do microfluxo;
- a revisão não pode quebrar as regras de coerência temporal e de fase do evento.

### Fluxo de controle do cronômetro

#### `Começar 1º tempo`

- `event_type = PERIOD_START`
- `period_phase = FIRST_HALF`

#### `Pausa técnica`

- `event_type = CLOCK_PAUSE`
- `period_phase = FIRST_HALF` ou `SECOND_HALF`, conforme a fase atual
- `metadata.pause_type = TECHNICAL_TIMEOUT`

#### `Pausa`

- `event_type = CLOCK_PAUSE`
- `period_phase = FIRST_HALF` ou `SECOND_HALF`, conforme a fase atual
- `metadata.pause_type = GENERIC_PAUSE`

#### `Retomar 1º tempo`

- `event_type = CLOCK_RESUME`
- `period_phase = FIRST_HALF`

#### `Fim do 1º tempo`

- `event_type = PERIOD_END`
- `period_phase = FIRST_HALF`

#### `Começar 2º tempo`

- `event_type = PERIOD_START`
- `period_phase = SECOND_HALF`

#### `Retomar 2º tempo`

- `event_type = CLOCK_RESUME`
- `period_phase = SECOND_HALF`

#### `Terminar partida`

- `event_type = MATCH_END`
- `period_phase = POST_MATCH`

Regra:

- eventos de marco forte devem validar obrigatoriamente o contexto de fase necessário ao seu tipo;
- `CLOCK_PAUSE` deve carregar `metadata.pause_type`;
- `REVIEWED` é estágio de revisão posterior e não de criação inicial.

## O que não deve ficar em `match_events`

Não devem ficar aqui:

- trocas de entrada e saída como fonte canônica;
- telemetria completa do cronômetro;
- estatística agregada final;
- vínculo oficial com o time.

Esses dados pertencem, respectivamente, a:

- `match_substitutions`
- camada operacional transitória
- tabelas derivadas
- `team_players`

## Dependências diretas desta tabela

Esta tabela conversa diretamente com:

- `matches`
- `match_players`
- `match_opponent_players`
- `match_substitutions`
- `match_goals`
- `Matches_API`
- `MatchOperationService`

## Riscos de alteração futura

Mudanças em:

- contrato mínimo por tipo de evento;
- semântica de `completion_stage`;
- ordenação temporal por `event_order`;
- uso de atores adversários;
- coordenadas espaciais

impactam em cascata:

- scout casual;
- scout rico;
- revisão por vídeo;
- estatísticas derivadas;
- timeline oficial da partida.

## Resumo estrutural

`match_events` é o coração do scout da partida. Ele precisa ser flexível o bastante para nascer rápido e simples, mas disciplinado o bastante para virar depois a fonte factual mais rica do que realmente aconteceu no jogo.
