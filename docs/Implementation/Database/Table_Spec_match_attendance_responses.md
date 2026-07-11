---
title: Table Spec match_attendance_responses
status: Draft
version: 2.0.0
owner: Product Architecture
last_update: 2026-07-10
related_documents:
  - Table_Spec_team_members.md
  - Table_Spec_scheduled_matches.md
  - Table_Spec_team_player_frame_defaults.md
  - Table_Spec_match_players.md
  - ../../Domain/Matches.md
  - ../../API/Scheduled_Matches_API.md
  - ../API/Endpoint_Detail_Scheduled_Matches.md
---

# Table Spec match_attendance_responses

## Objetivo

Documentar `respostas de presença em compromisso agendado (match_attendance_responses)` em nível técnico.

## Finalidade

`match_attendance_responses` representa a posição declarada de um integrante do time sobre sua presença em um compromisso futuro.

Ela existe para sustentar:

- confirmação de presença dentro do app;
- resposta feita pela própria pessoa;
- resposta feita pela gestão em nome dela;
- leitura de quem vai, não vai, talvez vá ou vai sem jogar;
- cobrança manual e automática de confirmação;
- comparação futura entre quem confirmou e quem realmente jogou;
- relatórios de confiabilidade e no-show.

## O que `match_attendance_responses` é

- resposta de presença ligada a um compromisso agendado;
- entidade de agenda, não de scout ao vivo;
- camada declarativa anterior à escalação real;
- fonte de verdade da intenção de presença no evento.

## O que `match_attendance_responses` não é

- não é participação esportiva real;
- não é escalação;
- não é lista de titulares ou reservas;
- não é posição jogada;
- não é número da camisa;
- não é estatística de partida.

## Responsabilidade na cadeia do domínio

No fluxo correto:

1. o time agenda um compromisso em `scheduled_matches`;
2. o compromisso é liberado para o time;
3. os integrantes respondem presença em `match_attendance_responses`;
4. a gestão usa essa leitura para preparar quadros e escalação;
5. a participação real acontece depois em `matches` e tabelas derivadas.

Logo:

- compromisso futuro pertence a `scheduled_matches`;
- pertencimento da pessoa ao time pertence a `team_members`;
- resposta de presença pertence a `match_attendance_responses`;
- participação real na partida pertence a `match_players`.

## Quando nasce

`match_attendance_responses` nasce quando:

1. a própria pessoa responde sua presença;
2. a gestão responde em nome dela;
3. uma linha `PENDING` é materializada para consolidar a grade de presença do compromisso;
4. o sistema ou a gestão marca depois que houve no-show.

## Quem grava

`match_attendance_responses` é gravada pela aplicação.

Casos de uso relevantes:

- `SetAttendanceResponse`
- `SetAttendanceOnBehalf`
- `MaterializeAttendanceGrid`
- `MarkConfirmedNoShow`
- `ReconcileAttendanceVsMatchParticipation`

## Estrutura física sugerida

- schema: `public`
- nome da tabela: `match_attendance_responses`

## Colunas

### `id`

- tipo físico: `uuid`
- nulidade: `not null`
- default sugerido: `gen_random_uuid()`
- PK: sim

### `scheduled_match_id`

- tipo físico: `uuid`
- nulidade: `not null`
- FK: `scheduled_matches.id`
- `on update`: `cascade`
- `on delete`: `restrict`
- finalidade:
  - apontar a qual compromisso agendado a resposta pertence.

### `team_id`

- tipo físico: `uuid`
- nulidade: `not null`
- FK: `teams.id`
- `on update`: `cascade`
- `on delete`: `restrict`
- finalidade:
  - redundância controlada para leitura, filtros e validação de consistência contextual.

### `team_member_id`

- tipo físico: `uuid`
- nulidade: `not null`
- FK: `team_members.id`
- `on update`: `cascade`
- `on delete`: `restrict`
- finalidade:
  - apontar qual integrante do time está respondendo ou sendo representado na resposta.

### `response_status`

- tipo físico: `match_attendance_response_status`
- nulidade: `not null`
- default sugerido: `PENDING`
- finalidade:
  - resumir o estado atual da resposta de presença.

### `response_mode`

- tipo físico: `match_attendance_response_mode`
- nulidade: `not null`
- default sugerido: `SELF`
- finalidade:
  - registrar se a resposta foi feita pela própria pessoa, por outra pessoa da gestão ou por derivação administrativa posterior.

### `responded_by_user_id`

- tipo físico: `uuid`
- nulidade: `nullable`
- FK: `users.id`
- `on update`: `cascade`
- `on delete`: `set null`
- finalidade:
  - registrar quem efetivamente lançou ou alterou a resposta por último.

### `responded_at`

- tipo físico: `timestamptz`
- nulidade: `nullable`
- finalidade:
  - registrar quando a resposta atual foi definida.

### `notes`

- tipo físico: `text`
- nulidade: `nullable`
- finalidade:
  - justificativa opcional, observação contextual ou recado administrativo.

### `confirmed_no_show_at`

- tipo físico: `timestamptz`
- nulidade: `nullable`
- finalidade:
  - registrar quando a ausência factual após confirmação positiva foi consolidada.

### `confirmed_no_show_by_user_id`

- tipo físico: `uuid`
- nulidade: `nullable`
- FK: `users.id`
- `on update`: `cascade`
- `on delete`: `set null`
- finalidade:
  - registrar quem marcou o no-show quando essa marcação vier de ação humana.

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

### `match_attendance_response_status`

- `PENDING`
- `GOING`
- `NOT_GOING`
- `MAYBE`
- `GOING_NOT_PLAYING`
- `CONFIRMED_NO_SHOW`

### `match_attendance_response_mode`

- `SELF`
- `ON_BEHALF`
- `SYSTEM_DERIVED`

## Regras dos enums

### `match_attendance_response_status`

- `PENDING`
  - ainda não respondeu.

- `GOING`
  - informou que vai ao evento e pretende jogar.

- `NOT_GOING`
  - informou que não vai ao evento.

- `MAYBE`
  - ainda está em dúvida.

- `GOING_NOT_PLAYING`
  - informou que vai ao evento, mas não pretende participar esportivamente.

- `CONFIRMED_NO_SHOW`
  - em algum momento houve confirmação positiva de presença, mas a pessoa não compareceu de fato.

### `match_attendance_response_mode`

- `SELF`
  - a própria pessoa respondeu no app.

- `ON_BEHALF`
  - a gestão respondeu em nome dela.

- `SYSTEM_DERIVED`
  - o estado atual foi consolidado por regra administrativa ou reconciliação posterior.

## Constraints sugeridas

## Primary key

- `pk_match_attendance_responses`
  - colunas: `id`

## Foreign keys

- `fk_match_attendance_responses_scheduled_match`
  - coluna: `scheduled_match_id`
  - referência: `scheduled_matches.id`
  - `on update cascade`
  - `on delete restrict`

- `fk_match_attendance_responses_team`
  - coluna: `team_id`
  - referência: `teams.id`
  - `on update cascade`
  - `on delete restrict`

- `fk_match_attendance_responses_team_member`
  - coluna: `team_member_id`
  - referência: `team_members.id`
  - `on update cascade`
  - `on delete restrict`

- `fk_match_attendance_responses_responded_by_user`
  - coluna: `responded_by_user_id`
  - referência: `users.id`
  - `on update cascade`
  - `on delete set null`

- `fk_match_attendance_responses_confirmed_no_show_by_user`
  - coluna: `confirmed_no_show_by_user_id`
  - referência: `users.id`
  - `on update cascade`
  - `on delete set null`

## Check constraints sugeridas

- `ck_match_attendance_responses_notes_not_blank_when_present`
  - se `notes is not null`, então `btrim(notes) <> ''`

- `ck_match_attendance_responses_responded_at_consistency`
  - se `response_status <> 'PENDING'`, então `responded_at is not null`

- `ck_match_attendance_responses_pending_mode_consistency`
  - se `response_status = 'PENDING'`, então `confirmed_no_show_at is null`

- `ck_match_attendance_responses_confirmed_no_show_consistency`
  - se `response_status = 'CONFIRMED_NO_SHOW'`, então `confirmed_no_show_at is not null`

- `ck_match_attendance_responses_no_show_mode_consistency`
  - se `response_status = 'CONFIRMED_NO_SHOW'`, então `response_mode in ('ON_BEHALF', 'SYSTEM_DERIVED')`

- `ck_match_attendance_responses_no_show_actor_consistency`
  - se `confirmed_no_show_by_user_id is not null`, então `confirmed_no_show_at is not null`

## Unicidade

Deve existir no máximo uma linha por:

- `scheduled_match_id + team_id + team_member_id`

Nome sugerido:

- `uq_match_attendance_responses_scheduled_match_team_member`

## Índices sugeridos

- `idx_match_attendance_responses_scheduled_match_id`
  - colunas: `scheduled_match_id`
  - finalidade:
    - listar grade de presença do compromisso.

- `idx_match_attendance_responses_team_member_id`
  - colunas: `team_member_id`
  - finalidade:
    - relatórios históricos do integrante.

- `idx_match_attendance_responses_response_status`
  - colunas: `response_status`
  - finalidade:
    - filtros de quem vai, não vai, talvez ou não respondeu.

- `idx_match_attendance_responses_team_id_status`
  - colunas: (`team_id`, `response_status`)
  - finalidade:
    - leitura operacional da presença por time.

- `idx_match_attendance_responses_scheduled_match_status`
  - colunas: (`scheduled_match_id`, `response_status`)
  - finalidade:
    - leitura rápida de pendentes, dúvidas e confirmados por compromisso.

## Regras de negócio centrais

1. A resposta pertence a um `scheduled_match`, não a uma `match` operacional.
2. A resposta pertence a `team_member`, não a `player`.
3. A resposta é única por integrante dentro do compromisso.
4. A separação visual por quadro não multiplica a resposta de presença.
5. `GOING_NOT_PLAYING` conta como presença no evento, mas não como intenção esportiva.
6. `CONFIRMED_NO_SHOW` não deve nascer na auto-resposta da própria pessoa.
7. A presença declarada e a participação real precisam continuar separadas.

## Regras de consistência contextual

### Coerência entre `scheduled_match`, `team_id` e `team_member`

O backend deve validar que:

- `scheduled_matches.team_id = match_attendance_responses.team_id`
- `team_members.team_id = match_attendance_responses.team_id`

Logo:

- a linha não pode misturar compromisso de um time com integrante de outro.

### Relação com integrante ativo

O backend deve impedir nova resposta operacional para integrante sem vínculo ativo no time no momento da operação, salvo políticas futuras explícitas de histórico congelado.

## Regras por modo de resposta

### Resposta própria

Quando a própria pessoa responde:

- `response_mode = SELF`
- `responded_by_user_id` deve apontar para o próprio usuário autenticado
- `team_member_id` deve ser resolvido automaticamente a partir da pessoa autenticada naquele time

### Resposta em nome de outra pessoa

Quando a gestão responde por ela:

- `response_mode = ON_BEHALF`
- `responded_by_user_id` deve apontar para o usuário que executou a ação
- `team_member_id` vem explícito na operação

### Estado derivado

Quando o sistema ou a gestão consolida no-show:

- `response_status = CONFIRMED_NO_SHOW`
- `response_mode = SYSTEM_DERIVED` ou `ON_BEHALF`
- `confirmed_no_show_at` deve ser preenchido

## Relações com outras tabelas

## Relação com `scheduled_matches`

- tipo: `N -> 1`
- chave: `match_attendance_responses.scheduled_match_id -> scheduled_matches.id`
- regra:
  - a presença existe para um compromisso futuro específico.

## Relação com `team_members`

- tipo: `N -> 1`
- chave: `match_attendance_responses.team_member_id -> team_members.id`
- regra:
  - a entidade canônica de quem responde é o integrante contextual do time.

## Relação com `players`

- não há FK direta;
- atleta não é a unidade canônica de presença;
- presença continua válida mesmo para integrante que não é atleta.

## Relação com `team_player_frame_defaults`

- a UI pode usar `team_player_frame_defaults` para agrupar visualmente a resposta no quadro padrão do integrante;
- isso não cria múltiplas respostas de presença;
- isso não muda a unicidade da tabela.

## Relação com `match_players`

- `match_players` representa quem realmente foi relacionado e jogou;
- relatórios de confiabilidade devem comparar `match_attendance_responses` com `match_players`;
- essa reconciliação não transforma automaticamente a resposta declarada em dado bruto de jogo.

## Regras operacionais por fluxo

### Grade inicial de presença

Ao liberar um compromisso para o time, a aplicação pode:

- materializar linhas `PENDING` para todos os integrantes elegíveis; ou
- criar linhas sob demanda na primeira resposta e montar os pendentes por diferença lógica

A decisão de implementação pode variar, mas a leitura final da tela deve sempre conseguir mostrar:

- quem vai;
- quem não vai;
- quem talvez vá;
- quem vai mas não vai jogar;
- quem ainda não respondeu.

### Cobrança manual e automática

A gestão pode disparar cobrança de presença:

- para pendentes;
- para pendentes e talvez;
- ou outro escopo futuro documentado.

Essa cobrança não cria novo tipo de presença. Ela só pressiona atualização desta mesma linha.

### No-show

Se a pessoa confirmou presença e não compareceu:

- a gestão ou reconciliação posterior pode marcar `CONFIRMED_NO_SHOW`
- isso deve ficar registrado para relatórios futuros

### Relação com quadros

Mesmo quando `scheduled_matches.match_frame_count = 2`:

- continua existindo apenas uma resposta de presença por integrante
- a UI pode separar visualmente por quadro
- a divisão final entre primeiro e segundo quadro acontece na escalação real

## O que não deve ficar em `match_attendance_responses`

Não devem ficar aqui:

- quadro em que a pessoa efetivamente jogou;
- posição jogada;
- camisa usada;
- titularidade;
- minuto de entrada;
- estatística esportiva;
- substituição.

Esses dados pertencem, respectivamente, a:

- `match_players`
- tabelas de posição da partida
- `match_players`
- `match_players`
- `match_substitutions`
- tabelas de fatos da partida
- `match_substitutions`

## Dependências diretas desta tabela

Esta tabela conversa diretamente com:

- `scheduled_matches`
- `team_members`
- `teams`
- `users`
- `team_player_frame_defaults`
- `match_players`
- `Scheduled_Matches_API`
- tela de confirmação de presença
- futura reconciliação de presença versus participação real

## Riscos de alteração futura

Mudanças em:

- unicidade da resposta por compromisso e integrante;
- definição de quem é a unidade canônica da resposta;
- separação entre presença declarada e participação real;
- semântica de `GOING_NOT_PLAYING`;
- semântica de `CONFIRMED_NO_SHOW`

impactam em cascata:

- agenda do time;
- cobrança de presença;
- pré-escalação por quadros;
- relatórios de confiabilidade;
- comparação entre quem confirmou e quem jogou;
- leitura social da resenha pré-jogo.

## Resumo estrutural

`match_attendance_responses` é a camada oficial de presença declarada para compromissos agendados. Ela nasce da agenda, usa `team_members` como pessoa contextual do time e prepara o terreno para escalação e análise posterior sem se confundir com a participação real da partida.
