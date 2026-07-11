---
title: Endpoint Detail Matches
status: Draft
version: 1.8.0
owner: Product Architecture
last_update: 2026-07-10
related_documents:
  - ../../API/Matches_API.md
  - ../../API/Scheduled_Matches_API.md
  - ../../Implementation/Database/Table_Spec_matches.md
  - ../../Implementation/Database/Table_Spec_match_players.md
  - ../../Implementation/Database/Table_Spec_match_events.md
  - ../../Implementation/Database/Table_Spec_match_goals.md
---

# Endpoint Detail Matches

## Objetivo

Detalhar endpoints da partida operacional.

Este documento nao cobre agenda de jogos.

Planejamento, liberacao para o time e presenca pertencem a `Endpoint_Detail_Scheduled_Matches.md`.

## Endpoints

```http
POST /api/v1/matches
GET /api/v1/matches/{matchId}
PATCH /api/v1/matches/{matchId}
POST /api/v1/matches/{matchId}/lineups/save
PATCH /api/v1/matches/{matchId}/related-players
POST /api/v1/matches/{matchId}/goals/quick
POST /api/v1/matches/{matchId}/goals
PATCH /api/v1/matches/{matchId}/goals/{goalId}
POST /api/v1/matches/{matchId}/events
PATCH /api/v1/matches/{matchId}/events/{eventId}
POST /api/v1/matches/{matchId}/substitutions
POST /api/v1/matches/{matchId}/opponent-players
PATCH /api/v1/matches/{matchId}/opponent-players/{matchOpponentPlayerId}
POST /api/v1/matches/{matchId}/operator-assignments
PATCH /api/v1/matches/{matchId}/operator-assignments/{assignmentId}
POST /api/v1/matches/{matchId}/finish
POST /api/v1/matches/{matchId}/cancel
```

## Regras

- `POST /api/v1/matches` deve aceitar:
  - fluxo rapido de ultima hora;
  - fluxo operacional mais completo.
- Se a partida nascer sem agendamento previo:
  - o backend pode derivar depois um `scheduled_match` vinculado.
- Se a partida nascer a partir de agenda:
  - o vinculo com `scheduled_match_id` deve ser explicito.
- `POST /api/v1/matches/{matchId}/lineups/save`
  - cria ou atualiza a escalacao da propria `match`;
  - como `matches` ja representa um quadro especifico, a rota nao deve repetir `frameType`.
  - deve validar minimos de relacionados e titulares a partir de `matches.starters_count`.
- `PATCH /api/v1/matches/{matchId}/related-players`
  - ajusta o elenco relacionado depois da escalação inicial.
- `POST /api/v1/matches/{matchId}/events`
  - deve aceitar evento parcial.
- `PATCH /api/v1/matches/{matchId}/events/{eventId}`
  - deve permitir enriquecer evento ja salvo parcialmente.
- `POST /api/v1/matches/{matchId}/opponent-players`
  - cria ator adversario operacional para aquela partida.
  - esse cadastro é opcional e não pode ser exigido para registrar gol adversário.
- `POST /api/v1/matches/{matchId}/operator-assignments`
  - define responsabilidades dos operadores da partida.
- Cancelamento nunca remove partida.
- Finalizacao dispara consolidacao e recalculo coerente do estado operacional.
- O documento nao deve reabrir regras de agenda ou presenca.

## Criterios de qualidade

- O fluxo deve funcionar para usuario casual sem exigir cadastro excessivo.
- Recursos avancados devem ser progressivos e opcionais.
- O comportamento deve preservar consistencia entre frontend, backend, API e banco.
- Todas as entidades tecnicas, payloads, enums e nomes internos devem usar ingles.
- Textos exibidos ao usuario devem passar por camada de linguagem/configuracao.

## Contrato detalhado

### `GET /api/v1/matches/{matchId}`

#### Objetivo

Retornar a leitura operacional da partida.

Quando a partida ainda estiver em rascunho de escalação, esta rota deve hidratar a mesma tela usada para montar o quadro.

#### Response conceitual para reabrir rascunho de escalação

```json
{
  "match": {
    "id": "uuid",
    "team_id": "uuid",
    "scheduled_match_id": "uuid|null",
    "status": "DRAFT",
    "operation_phase": "READY_TO_START",
    "modality": "SOCIETY",
    "frame_type": "SECOND_FRAME",
    "starters_count": 6,
    "match_date": "2026-08-01",
    "match_time": "15:00:00"
  },
  "lineup_draft": {
    "is_complete": false,
    "goalkeeper_match_player_id": "uuid|null",
    "confirmed_coach_person_id": "uuid|null"
  },
  "related_players": [
    {
      "match_player_id": "uuid",
      "player_id": "uuid",
      "person_id": "uuid",
      "display_name": "Lucas",
      "avatar_url": "https://...",
      "shirt_number": 7,
      "is_starter": true,
      "is_team_player": true,
      "is_goalkeeper": true,
      "initial_positions": [
        {
          "modality_position_id": "uuid",
          "position_code": "GOALKEEPER",
          "x": 0.08,
          "y": 0.50
        }
      ]
    }
  ],
  "available_players": [
    {
      "player_id": "uuid",
      "person_id": "uuid",
      "display_name": "Bruno",
      "avatar_url": "https://...",
      "preconfigured_shirt_number": 10,
      "is_goalkeeper_profile": false
    }
  ],
  "coach_context": {
    "confirmed_coach_person_id": "uuid|null",
    "confirmed_coach_name": "Marcio",
    "preconfigured_coach_person_id": "uuid|null",
    "preconfigured_coach_name": "Marcio",
    "is_confirmed_from_default": true
  }
}
```

#### Regras de leitura

- se `status = DRAFT` e `operation_phase = READY_TO_START`:
  - a resposta deve priorizar hidratação de escalação;
- `related_players` deve trazer:
  - todos os atletas já relacionados naquele quadro;
  - `shirt_number` confirmado;
  - status de titular ou reserva;
  - flag de goleiro;
  - posições iniciais já salvas;
- `available_players` deve trazer:
  - jogadores elegíveis do elenco ainda não relacionados;
  - número pré-configurado quando existir;
  - indicador de perfil de goleiro para disparar o modal dinâmico da UI;
  - metadados suficientes para a UI respeitar a ordem oficial de sugestão:
    - se pertence ao quadro atual;
    - se pertence ao outro quadro;
    - se é avulso;
    - qual foi a resposta de presença, quando existir;
- `lineup_draft.goalkeeper_match_player_id` é a fonte oficial do goleiro já definido;
- `coach_context` deve permitir:
  - mostrar o técnico pré-configurado;
  - mostrar o técnico confirmado para aquela partida, quando já houver escolha;
  - distinguir quando a confirmação atual ainda é a mesma herança do default;
- se não houver técnico confirmado ainda:
  - `confirmed_coach_person_id = null`.

#### Regras do técnico da partida

- a UI pode abrir a escalação apenas com técnico sugerido e ainda não confirmado;
- `preconfigured_coach_person_id` vem de `team_staff_defaults`;
- `confirmed_coach_person_id` vem de `match_staff` com `staff_role = HEAD_COACH`;
- se o responsável trocar o técnico na escalação:
  - `match_staff` deve passar a refletir apenas a escolha efetiva daquela partida;
- se o responsável remover a confirmação:
  - `confirmed_coach_person_id = null`
  - o `preconfigured_coach_person_id` pode continuar vindo apenas como sugestão;
- o técnico não entra em `related_players`.

#### Regras de consistência

- `related_players` deve vir ordenado de forma previsível para a UI:
  - titulares primeiro;
  - reservas depois;
  - dentro de cada grupo, por `display_name` ou critério estável equivalente;
- `available_players` deve vir ordenado para respeitar a ordem oficial da tela:
  1. quadro atual + `GOING`
  2. quadro atual + `MAYBE`
  3. quadro atual + `GOING_NOT_PLAYING`
  4. outro quadro + `GOING`
  5. outro quadro + `MAYBE`
  6. outro quadro + `GOING_NOT_PLAYING`
  7. avulsos
- `available_players` não pode repetir atletas já presentes em `related_players`;
- se existir goleiro definido:
  - ele deve existir dentro de `related_players`;
- se não existir goleiro definido:
  - `goalkeeper_match_player_id` deve ser `null`;
- o `GET` não devolve apenas dados crus do banco;
  - ele devolve uma leitura pronta para reabrir a superfície operacional.

### `POST /api/v1/matches/{matchId}/lineups/save`

#### Request

```json
{
  "starters_count": 6,
  "players": [
    {
      "player_id": "uuid",
      "shirt_number": 10,
      "is_starter": true,
      "is_team_player": true,
      "initial_position": {
        "x": 0.42,
        "y": 0.78
      }
    }
  ]
}
```

#### Validacoes principais

- a `match` precisa existir;
- a `match` nao pode estar:
  - `COMPLETED`
  - `CANCELLED`
- `players` deve conter pelo menos `matches.starters_count` relacionados;
- a quantidade de itens com `is_starter = true` deve ser igual a `starters_count`;
- todo titular deve existir dentro da lista de relacionados enviada;
- nao existe limite maximo de relacionados;
- todo item enviado em `players` deve conter `shirt_number`;
- todo relacionado com `is_starter = false` deve ser tratado como reserva;
- o banco pode ficar vazio quando o time tiver apenas o minimo necessario;
- `initial_position` nao e obrigatoria para salvar a escalacao, exceto para o goleiro titular;
- o payload final deve representar `shirt_number` ja confirmado na UI para cada relacionado;
- deve existir exatamente um goleiro titular configurado no momento do salvamento;
- `FUTSAL` exige `5` titulares;
- `FIELD` exige `11` titulares;
- `SOCIETY` nasce com `6` e pode ser ajustado para `7`;
- se `starters_count` vier diferente do valor atual em uma `match` de `SOCIETY`:
  - o backend deve validar a alteração;
  - persistir o novo valor em `matches.starters_count`;
  - e persistir também em `scheduled_matches.starters_count`, quando existir `scheduled_match_id`.

#### Regra de editabilidade após o início

- quando a partida sair de `READY_TO_START` e o cronômetro começar:
  - a definição de `titulares iniciais` deixa de ser editável como escalação oficial de saída;
- porém, o conjunto de `relacionados` da partida continua editável durante o jogo para suportar:
  - jogador atrasado;
  - inclusão de avulso;
  - correção de número da camisa;
  - outros ajustes operacionais do elenco disponível.
- após `status = COMPLETED`:
  - os relacionados continuam editáveis em modo de revisão;
  - inclusive para revisão por vídeo.

Regra oficial:

- essa rota não deve ser usada para manutenção operacional posterior dos relacionados;
- após o início da partida, ela continua válida apenas como referência histórica da saída oficial;
- ajustes posteriores devem usar `PATCH /api/v1/matches/{matchId}/related-players`.

#### Efeitos

- cria ou atualiza `match_players`;
- cria ou atualiza `match_players_positions` quando `initial_position` vier informado;
- deve exigir `match_players_positions` para o goleiro titular;
- deve permitir correcao posterior de `shirt_number` por fluxo de edicao operacional;
- preserva a `match` em:
  - `status = DRAFT`
  - `operation_phase = READY_TO_START`
  - até o cronômetro realmente começar.

#### Erros esperados

- `LINEUP_MINIMUM_PLAYERS_NOT_REACHED`
- `LINEUP_STARTERS_COUNT_INVALID`
- `LINEUP_STARTER_NOT_IN_RELATED_PLAYERS`
- `LINEUP_SHIRT_NUMBER_REQUIRED`
- `LINEUP_GOALKEEPER_INITIAL_POSITION_REQUIRED`
- `LINEUP_GOALKEEPER_REQUIRED`
- `LINEUP_STARTERS_EDIT_NOT_ALLOWED_AFTER_MATCH_START`

### `PATCH /api/v1/matches/{matchId}/related-players`

#### Objetivo

Manter o elenco relacionado da partida depois que a escalação inicial já foi definida.

#### Request conceitual

```json
{
  "operations": [
    {
      "action": "ADD",
      "player_id": "uuid",
      "shirt_number": 14,
      "is_team_player": true,
      "initial_position": null
    },
    {
      "action": "ADD_GUEST",
      "guest_player": {
        "nickname": "Negueba",
        "shirt_number": 99,
        "avatar": null,
        "initial_position": null,
        "preferred_foot": "RIGHT"
      }
    },
    {
      "action": "UPDATE_SHIRT_NUMBER",
      "match_player_id": "uuid",
      "shirt_number": 17
    },
    {
      "action": "REMOVE",
      "match_player_id": "uuid"
    }
  ]
}
```

#### Regras

- essa rota pode ser usada:
  - durante a partida;
  - após a partida, em revisão por vídeo;
- ela não pode reescrever retroativamente a saída oficial de titulares;
- ela opera sobre `match_players` e, quando necessário, `match_players_positions`;
- `ADD`
  - adiciona atleta já existente ao elenco relacionado;
- `ADD_GUEST`
  - cria ou reaproveita `person + player` e depois adiciona em `match_players` com `is_team_player = false`;
- `UPDATE_SHIRT_NUMBER`
  - corrige o número de camisa confirmado para aquele quadro;
- `REMOVE`
  - remove relacionado quando a regra operacional permitir.

Regra de remoção:

- sem fatos dependentes:
  - pode remover fisicamente;
- com fatos dependentes:
  - deve executar remoção lógica do relacionado.

O que bloqueia exclusão física de `relacionado da partida (match_player)`:

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

Exceção:

- `posições usadas pelo atleta na partida (match_players_positions)` não bloqueia exclusão física sozinha;
- se só existirem posições associadas, o backend pode remover `match_player` fisicamente e limpar essas posições na mesma transação.

#### Erros esperados

- `RELATED_PLAYERS_EDIT_NOT_ALLOWED`
- `RELATED_PLAYER_SHIRT_NUMBER_REQUIRED`
- `RELATED_PLAYER_NOT_FOUND`
- `RELATED_PLAYER_DUPLICATED`
- `RELATED_PLAYER_SHIRT_NUMBER_CONFLICT`
- `RELATED_PLAYER_REMOVE_BLOCKED_BY_MATCH_FACTS`

### Regra de gol adversário sem autor

- `POST /api/v1/matches/{matchId}/goals/quick` e `POST /api/v1/matches/{matchId}/goals` devem aceitar gol com:
  - `participant_side = OPPONENT`
  - sem autor identificado;
- o backend não pode exigir `jogador adversário da partida (match_opponent_player)` para validar esse gol;
- se existirem `jogadores adversários da partida (match_opponent_players)` cadastrados, a autoria do gol adversário continua opcional.

### `POST /api/v1/matches/{matchId}/goals/quick`

#### Objetivo

Registrar gol pelo fluxo casual mais rápido possível, sem obrigar scout fino.

#### Request conceitual

```json
{
  "participant_side": "HOME",
  "match_player_id": "uuid|null",
  "player_id": "uuid|null",
  "clock_second": 915,
  "own_goal": false
}
```

#### Regras

- deve aceitar gol com autoria completa ou incompleta;
- `participant_side` é obrigatório;
- se `participant_side = HOME`:
  - pode receber `match_player_id`;
  - pode receber `player_id`;
  - ambos continuam opcionais no modo casual;
- se `participant_side = OPPONENT`:
  - não pode exigir `match_opponent_player`;
  - pode registrar apenas o lado do gol e o tempo;
- `clock_second` deve vir do cronômetro consolidado ou do melhor valor disponível naquele momento;
- `own_goal = true` continua válido para qualquer lado, desde que o placar final seja recalculado corretamente;
- ao salvar:
  - cria uma linha em `match_goals`;
  - recalcula o placar da `match`;
  - pode criar ou não `linked_match_event_id`, conforme o modo operacional adotado.

#### Erros esperados

- `GOAL_PARTICIPANT_SIDE_REQUIRED`
- `GOAL_MATCH_PLAYER_NOT_IN_MATCH`
- `GOAL_PLAYER_MISMATCH_WITH_MATCH_PLAYER`
- `GOAL_CLOCK_SECOND_INVALID`

### `POST /api/v1/matches/{matchId}/goals`

#### Objetivo

Registrar gol com mais contexto do que o fluxo rápido, sem obrigar o scout fino completo.

#### Request conceitual

```json
{
  "participant_side": "HOME",
  "match_player_id": "uuid|null",
  "player_id": "uuid|null",
  "assist_player_id": "uuid|null",
  "clock_second": 915,
  "minute": 15,
  "own_goal": false,
  "linked_match_event_id": "uuid|null"
}
```

#### Regras

- `participant_side` é obrigatório;
- `match_player_id` e `player_id` continuam opcionais;
- `assist_player_id` é opcional;
- se `own_goal = true`:
  - `assist_player_id` deve permanecer `null`;
- se `linked_match_event_id` existir:
  - o evento deve pertencer ao mesmo `match_id`;
- se `participant_side = OPPONENT`:
  - continua permitido registrar o gol sem autor identificado;
  - a existência de `match_opponent_players` cadastrados não muda essa regra;
- a rota deve servir tanto para:
  - operação ao vivo;
  - enriquecimento posterior;
  - revisão por vídeo.

#### Erros esperados

- `GOAL_PARTICIPANT_SIDE_REQUIRED`
- `GOAL_MATCH_PLAYER_NOT_IN_MATCH`
- `GOAL_PLAYER_MISMATCH_WITH_MATCH_PLAYER`
- `GOAL_ASSIST_NOT_ALLOWED_FOR_OWN_GOAL`
- `GOAL_LINKED_EVENT_NOT_IN_MATCH`
- `GOAL_CLOCK_SECOND_INVALID`

### `PATCH /api/v1/matches/{matchId}/goals/{goalId}`

#### Objetivo

Editar um gol já registrado para corrigir autoria, assistência, lado, tempo ou vínculo com evento fino.

#### Request conceitual

```json
{
  "participant_side": "HOME",
  "match_player_id": "uuid|null",
  "player_id": "uuid|null",
  "assist_player_id": "uuid|null",
  "clock_second": 915,
  "minute": 15,
  "own_goal": false,
  "linked_match_event_id": "uuid|null"
}
```

#### Regras

- a rota deve permitir:
  - trocar autor do gol;
  - remover autor do gol;
  - acrescentar ou remover assistência;
  - marcar ou desmarcar `own_goal`;
  - corrigir `clock_second` e `minute`;
  - ligar ou desligar `linked_match_event_id`;
  - corrigir `participant_side`, quando o registro anterior estiver errado;
- `participant_side` continua obrigatório;
- `match_player_id` e `player_id` continuam opcionais;
- se `match_player_id` existir:
  - deve pertencer ao mesmo `match_id`;
- se `player_id` existir junto com `match_player_id`:
  - ambos devem continuar coerentes entre si;
- se `own_goal = true`:
  - `assist_player_id` deve permanecer `null`;
- se `linked_match_event_id` existir:
  - o evento deve pertencer ao mesmo `match_id`;
- se `participant_side = OPPONENT`:
  - a edição continua podendo deixar o gol sem autor identificado;
  - o backend não pode exigir `jogador adversário da partida (match_opponent_player)`;
  - a existência de `match_opponent_players` cadastrados não torna a autoria obrigatória.

#### Efeitos

- atualiza a linha em `match_goals`;
- recalcula o placar consolidado da `match`;
- preserva a coerência com `linked_match_event_id`, quando existir;
- pode ser usada:
  - ao vivo;
  - logo após erro operacional;
  - em revisão por vídeo.

#### Erros esperados

- `GOAL_NOT_FOUND`
- `GOAL_PARTICIPANT_SIDE_REQUIRED`
- `GOAL_MATCH_PLAYER_NOT_IN_MATCH`
- `GOAL_PLAYER_MISMATCH_WITH_MATCH_PLAYER`
- `GOAL_ASSIST_NOT_ALLOWED_FOR_OWN_GOAL`
- `GOAL_LINKED_EVENT_NOT_IN_MATCH`
- `GOAL_CLOCK_SECOND_INVALID`

### `PATCH /api/v1/matches/{matchId}/opponent-players/{matchOpponentPlayerId}`

#### Objetivo

Manter `jogadores adversários da partida (match_opponent_players)` durante a operação e na revisão posterior.

#### Operações mínimas

- `UPDATE`
  - corrige `shirt_number`, `display_name_snapshot`, `photo_media_asset_id` ou `is_starter`;
- `REMOVE`
  - remove o ator adversário quando a regra operacional permitir.

#### Regra de remoção

- sem fatos dependentes:
  - pode remover fisicamente;
- com fatos dependentes:
  - deve executar remoção lógica do `jogador adversário da partida (match_opponent_player)`.

O que bloqueia exclusão física de `jogador adversário da partida (match_opponent_player)`:

- `eventos da partida (match_events)`:
  - `primary_match_opponent_player_id`
  - `secondary_match_opponent_player_id`
- `substituições da partida (match_substitutions)`:
  - `opponent_player_in_match_opponent_player_id`
  - `opponent_player_out_match_opponent_player_id`

#### Erros esperados

- `OPPONENT_PLAYER_NOT_FOUND`
- `OPPONENT_PLAYER_SHIRT_NUMBER_CONFLICT`
- `OPPONENT_PLAYER_REMOVE_BLOCKED_BY_MATCH_FACTS`

### `POST /api/v1/matches/{matchId}/substitutions`

#### Objetivo

Registrar troca de atletas durante a partida, tanto do próprio time quanto do adversário.

#### Request conceitual

```json
{
  "participant_side": "HOME",
  "player_out_match_player_id": "uuid|null",
  "player_in_match_player_id": "uuid|null",
  "opponent_player_out_match_opponent_player_id": "uuid|null",
  "opponent_player_in_match_opponent_player_id": "uuid|null",
  "clock_second": 915
}
```

#### Regras

- `participant_side` é obrigatório;
- `clock_second` é opcional, mas quando vier deve ser válido para o cronômetro da partida;
- se `participant_side = HOME`:
  - `player_out_match_player_id` é obrigatório;
  - `player_in_match_player_id` é obrigatório;
  - `opponent_player_out_match_opponent_player_id` deve ser `null`;
  - `opponent_player_in_match_opponent_player_id` deve ser `null`;
- se `participant_side = OPPONENT`:
  - `opponent_player_out_match_opponent_player_id` é obrigatório;
  - `opponent_player_in_match_opponent_player_id` é obrigatório;
  - `player_out_match_player_id` deve ser `null`;
  - `player_in_match_player_id` deve ser `null`;
- entrada e saída devem pertencer ao mesmo `match_id`;
- a substituição não cria relacionado novo;
  - ela só troca atores que já existem em:
    - `match_players`, quando `participant_side = HOME`;
    - `match_opponent_players`, quando `participant_side = OPPONENT`;
- diferente do gol adversário e de certos eventos do adversário:
  - a substituição do adversário não pode existir sem atores identificados.

#### Efeitos

- cria uma linha em `match_substitutions`;
- atualiza a leitura temporal de quem estava em quadra ou campo;
- não altera a escalação inicial oficial;
- não cria nem remove linhas em `match_players` ou `match_opponent_players`.

#### Erros esperados

- `SUBSTITUTION_PARTICIPANT_SIDE_REQUIRED`
- `SUBSTITUTION_HOME_PLAYERS_REQUIRED`
- `SUBSTITUTION_OPPONENT_PLAYERS_REQUIRED`
- `SUBSTITUTION_PLAYER_NOT_IN_MATCH`
- `SUBSTITUTION_OPPONENT_PLAYER_NOT_IN_MATCH`
- `SUBSTITUTION_CROSS_SIDE_NOT_ALLOWED`
- `SUBSTITUTION_CLOCK_SECOND_INVALID`

### `POST /api/v1/matches/{matchId}/events`

#### Objetivo

Registrar `eventos da partida (match_events)` de forma progressiva, do fluxo casual ao fluxo rico.

#### Request conceitual

```json
{
  "event_type": "SHOT",
  "participant_side": "HOME",
  "context_side": "ATTACK",
  "completion_stage": "PARTIAL",
  "is_quick_mode": false,
  "period_phase": "FIRST_HALF",
  "clock_second": 915,
  "primary_match_player_id": "uuid|null",
  "secondary_match_player_id": "uuid|null",
  "primary_match_opponent_player_id": "uuid|null",
  "secondary_match_opponent_player_id": "uuid|null",
  "marking_failure_match_player_id": "uuid|null",
  "origin_x": 0.72,
  "origin_y": 0.41,
  "target_x": 0.92,
  "target_y": 0.48,
  "body_part": "RIGHT_FOOT",
  "shot_outcome": "SAVED",
  "save_difficulty": "HARD",
  "metadata": {}
}
```

#### Regras gerais

- `event_type` é obrigatório;
- `participant_side` é obrigatório;
- `completion_stage` é obrigatório;
- `clock_second` é opcional no payload bruto, mas quando vier deve ser válido para o cronômetro da partida;
- o evento pode nascer em:
  - `MINIMAL`
  - `PARTIAL`
  - `DETAILED`
- `REVIEWED` não deve ser usado na criação inicial;
- se `participant_side = HOME`:
  - o ator principal preferencialmente deve estar em `primary_match_player_id`;
- se `participant_side = OPPONENT`:
  - o ator principal preferencialmente deve estar em `primary_match_opponent_player_id`;
  - mas não é obrigatório em todos os tipos de evento;
- diferente de `substituições da partida (match_substitutions)`:
  - certos eventos do adversário podem existir sem ator identificado.

#### Núcleo mínimo por estágio

- `MINIMAL`
  - exige:
    - `event_type`
    - `participant_side`
- `PARTIAL`
  - exige:
    - `event_type`
    - `participant_side`
    - o núcleo mínimo coerente com o microfluxo percorrido
- `DETAILED`
  - exige o mesmo núcleo do `PARTIAL`, mais os detalhes ricos realmente coletados pelo fluxo

#### Regras por tipo

- `PERIOD_START`
  - deve indicar `period_phase`;
- `PERIOD_END`
  - deve indicar `period_phase`;
- `CLOCK_PAUSE`
  - deve indicar `period_phase`;
  - deve trazer `metadata.pause_type`;
- `CLOCK_RESUME`
  - deve indicar `period_phase`;
- `MATCH_END`
  - deve indicar `period_phase = POST_MATCH`;
- `SHOT`
  - pode nascer parcial e ser enriquecido depois;
- `GOAL`
  - pode coexistir com `match_goals`;
  - não substitui a linha em `match_goals`.

#### Regras de coerência

- qualquer `match_player_id` referenciado deve pertencer ao mesmo `match_id`;
- qualquer `match_opponent_player_id` referenciado deve pertencer ao mesmo `match_id`;
- `marking_failure_match_player_id`, quando existir, deve pertencer ao mesmo `match_id`;
- `origin_x` e `origin_y` devem aparecer juntos;
- `target_x` e `target_y` devem aparecer juntos;
- se `participant_side = OPPONENT`:
  - o backend não pode exigir `primary_match_opponent_player_id` em todos os casos;
- se o tipo do evento exigir detalhe específico pelo fluxo usado:
  - o backend deve validar apenas o que for compatível com o `completion_stage`.

#### Efeitos

- cria uma linha em `match_events`;
- pode servir de base para enriquecimento posterior;
- pode ou não gerar relação complementar com `match_goals`, dependendo do tipo e do fluxo adotado;
- deve preservar a linha do tempo canônica da partida.

#### Erros esperados

- `EVENT_TYPE_REQUIRED`
- `EVENT_PARTICIPANT_SIDE_REQUIRED`
- `EVENT_COMPLETION_STAGE_REQUIRED`
- `EVENT_MATCH_PLAYER_NOT_IN_MATCH`
- `EVENT_MATCH_OPPONENT_PLAYER_NOT_IN_MATCH`
- `EVENT_MARKING_FAILURE_PLAYER_NOT_IN_MATCH`
- `EVENT_CLOCK_SECOND_INVALID`
- `EVENT_COORDINATES_INCOMPLETE`
- `EVENT_PERIOD_PHASE_REQUIRED`
- `EVENT_PAUSE_TYPE_REQUIRED`

### `PATCH /api/v1/matches/{matchId}/events/{eventId}`

#### Objetivo

Enriquecer, corrigir ou revisar um `evento da partida (match_event)` já existente.

#### Request conceitual

```json
{
  "participant_side": "HOME",
  "context_side": "ATTACK",
  "completion_stage": "DETAILED",
  "period_phase": "FIRST_HALF",
  "clock_second": 915,
  "event_order": 3,
  "primary_match_player_id": "uuid|null",
  "secondary_match_player_id": "uuid|null",
  "primary_match_opponent_player_id": "uuid|null",
  "secondary_match_opponent_player_id": "uuid|null",
  "marking_failure_match_player_id": "uuid|null",
  "origin_x": 0.72,
  "origin_y": 0.41,
  "target_x": 0.92,
  "target_y": 0.48,
  "body_part": "RIGHT_FOOT",
  "shot_outcome": "SAVED",
  "save_difficulty": "HARD",
  "is_time_reviewed": true,
  "metadata": {}
}
```

#### Regras

- a rota deve permitir:
  - completar campos que estavam ausentes;
  - corrigir ator principal ou secundário;
  - corrigir lado do evento;
  - corrigir tempo e ordenação fina;
  - acrescentar ou corrigir coordenadas;
  - acrescentar ou corrigir metadados ricos;
  - promover `completion_stage` até `REVIEWED`, quando aplicável;
- `REVIEWED` é permitido na edição, não na criação inicial;
- qualquer `match_player_id` referenciado deve pertencer ao mesmo `match_id`;
- qualquer `match_opponent_player_id` referenciado deve pertencer ao mesmo `match_id`;
- `marking_failure_match_player_id`, quando existir, deve pertencer ao mesmo `match_id`;
- coordenadas continuam precisando respeitar pares completos;
- se `participant_side = OPPONENT`:
  - o evento pode continuar sem ator identificado quando o tipo do evento permitir;
  - o backend não pode exigir `primary_match_opponent_player_id` em todos os casos;
- se o evento for de marco forte:
  - a correção deve continuar respeitando as regras do tipo;
- se `event_type = CLOCK_PAUSE`:
  - `metadata.pause_type` continua obrigatório;
- a edição não deve quebrar a coerência temporal consolidada da partida.

#### Efeitos

- atualiza a linha em `match_events`;
- pode elevar o `completion_stage`;
- pode marcar revisão manual via:
  - `completion_stage = REVIEWED`
  - `is_time_reviewed = true`
- preserva a possibilidade de relações complementares com `match_goals`, quando existirem.

#### Erros esperados

- `EVENT_NOT_FOUND`
- `EVENT_PARTICIPANT_SIDE_REQUIRED`
- `EVENT_COMPLETION_STAGE_REQUIRED`
- `EVENT_MATCH_PLAYER_NOT_IN_MATCH`
- `EVENT_MATCH_OPPONENT_PLAYER_NOT_IN_MATCH`
- `EVENT_MARKING_FAILURE_PLAYER_NOT_IN_MATCH`
- `EVENT_CLOCK_SECOND_INVALID`
- `EVENT_COORDINATES_INCOMPLETE`
- `EVENT_PERIOD_PHASE_REQUIRED`
- `EVENT_PAUSE_TYPE_REQUIRED`

## Regras para IA

Ao usar este documento como contexto para implementacao, a IA deve:
1. preservar o principio de uso casual simples;
2. nao criar campos obrigatorios que bloqueiem o primeiro valor operacional;
3. respeitar separacao entre dado canonico e texto de interface;
4. manter compatibilidade com evolucao futura;
5. sugerir migrations, testes e endpoints quando alterar dominio.
