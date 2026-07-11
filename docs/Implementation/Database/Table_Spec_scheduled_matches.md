---
title: Table Spec scheduled_matches
status: Draft
version: 2.1.0
owner: Product Architecture
last_update: 2026-07-10
related_documents:
  - Table_Spec_teams.md
  - Table_Spec_local_opponents.md
  - Table_Spec_venues.md
  - Table_Spec_match_attendance_responses.md
  - Table_Spec_matches.md
  - ../../Domain/Matches.md
  - ../../API/Scheduled_Matches_API.md
  - ../API/Endpoint_Detail_Scheduled_Matches.md
---

# Table Spec scheduled_matches

## Objetivo

Documentar `jogos agendados (scheduled_matches)` em nível técnico.

## Finalidade

`scheduled_matches` representa o compromisso futuro de jogo antes da partida operacional existir ou ser aberta.

Ela existe para sustentar:

- agenda do time;
- planejamento interno da diretoria;
- confirmação interna do jogo;
- liberação posterior para o restante do time;
- confirmação de presença;
- divulgação do jogo no app e em redes sociais;
- ponte entre agenda e partida operacional.

## O que `scheduled_matches` é

- compromisso esportivo futuro;
- entidade de agenda;
- camada de planejamento e comunicação prévia;
- ponto de entrada para presença;
- origem lógica da abertura da partida operacional.

## O que `scheduled_matches` não é

- não é a partida operacional em si;
- não é escalação;
- não é scout ao vivo;
- não é placar oficial do jogo;
- não é log de eventos da partida.

## Responsabilidade na cadeia do domínio

No fluxo principal:

1. a diretoria agenda o jogo;
2. o compromisso entra em `scheduled_matches`;
3. o jogo pode ficar apenas confirmado internamente;
4. depois é liberado para o time;
5. o time responde presença;
6. no dia, a gestão abre a partida operacional;
7. a partida real passa a viver em `matches`.

No fluxo inverso:

1. surge um jogo de última hora;
2. a gestão abre a partida operacional primeiro;
3. o sistema deriva depois um item em `scheduled_matches` para manter agenda e histórico coerentes.

## Quando nasce

`scheduled_matches` pode nascer em dois contextos válidos:

1. criação normal de agenda;
2. derivação posterior a partir de uma `match` operacional.

## Quem grava

`scheduled_matches` é gravada pela aplicação.

Casos de uso relevantes:

- `CreateScheduledMatch`
- `UpdateScheduledMatch`
- `ReleaseScheduledMatch`
- `CancelScheduledMatch`
- `DeriveScheduledMatchFromMatch`
- `CreateMatchFromScheduledMatch`

## Estrutura física sugerida

- schema: `public`
- nome da tabela: `scheduled_matches`

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
  - apontar qual time está agendando o compromisso.

### `origin_type`

- tipo físico: `scheduled_match_origin_type`
- nulidade: `not null`
- default sugerido: `PLANNED`
- finalidade:
  - distinguir se o compromisso nasceu pelo fluxo normal de agenda ou por derivação posterior da partida.

### `opponent_type`

- tipo físico: `scheduled_match_opponent_type`
- nulidade: `not null`
- finalidade:
  - informar se o adversário é um time oficial do app ou um adversário local privado do time.

### `opponent_team_id`

- tipo físico: `uuid`
- nulidade: `nullable`
- FK: `teams.id`
- `on update`: `cascade`
- `on delete`: `restrict`
- finalidade:
  - apontar o time adversário quando ele existir como time oficial do app.

### `local_opponent_id`

- tipo físico: `uuid`
- nulidade: `nullable`
- FK: `local_opponents.id`
- `on update`: `cascade`
- `on delete`: `restrict`
- finalidade:
  - apontar o adversário privado cadastrado na agenda local do time.

### `opponent_name`

- tipo físico: `text`
- nulidade: `not null`
- finalidade:
  - snapshot operacional mínimo do nome do adversário visível no compromisso.

### `match_date`

- tipo físico: `date`
- nulidade: `not null`
- finalidade:
  - dia do compromisso.

### `match_time`

- tipo físico: `time`
- nulidade: `not null`
- finalidade:
  - horário previsto do compromisso.

### `modality`

- tipo físico: `sport_modality`
- nulidade: `not null`
- finalidade:
  - modalidade do compromisso.

### `match_type`

- tipo físico: `scheduled_match_type`
- nulidade: `not null`
- finalidade:
  - classificar o tipo do compromisso.

### `age_category`

- tipo físico: `scheduled_match_age_category`
- nulidade: `nullable`
- finalidade:
  - categoria etária do evento, quando aplicável.

### `organization_name`

- tipo físico: `text`
- nulidade: `nullable`
- finalidade:
  - identificar de onde veio o jogo, como liga, copa, festival ou organizador informal.

### `venue_id`

- tipo físico: `uuid`
- nulidade: `nullable`
- FK: `venues.id`
- `on update`: `cascade`
- `on delete`: `restrict`
- finalidade:
  - apontar local formal conhecido quando houver cadastro estruturado.

### `venue_name_snapshot`

- tipo físico: `text`
- nulidade: `nullable`
- finalidade:
  - snapshot amigável do nome do local no momento do agendamento.

### `venue_address_snapshot`

- tipo físico: `text`
- nulidade: `nullable`
- finalidade:
  - snapshot operacional do endereço do local.

### `home_match_capability_snapshot`

- tipo físico: `home_match_capability`
- nulidade: `nullable`
- finalidade:
  - snapshot da condição macro do time sobre jogar em casa no momento do agendamento.

### `match_frame_count`

- tipo físico: `integer`
- nulidade: `not null`
- default sugerido: `1`
- finalidade:
  - definir quantos quadros o compromisso terá.

### `starters_count`

- tipo físico: `integer`
- nulidade: `not null`
- finalidade:
  - quantidade de titulares esperados para o jogo agendado.
  - funciona como configuração operacional que será herdada pela partida.

### `status`

- tipo físico: `scheduled_match_status`
- nulidade: `not null`
- default sugerido: `PLANNED`
- finalidade:
  - resumir o estágio operacional do compromisso.

### `team_visibility_at`

- tipo físico: `timestamptz`
- nulidade: `nullable`
- finalidade:
  - controlar quando o compromisso deve ficar visível para o restante do time.

### `publish_match_announcement`

- tipo físico: `boolean`
- nulidade: `not null`
- default sugerido: `false`
- finalidade:
  - indicar se o compromisso deve gerar divulgação.

### `announcement_publish_at`

- tipo físico: `timestamptz`
- nulidade: `nullable`
- finalidade:
  - definir quando a divulgação deve começar.

### `announcement_platforms`

- tipo físico: `jsonb`
- nulidade: `nullable`
- finalidade:
  - guardar a seleção de redes externas para divulgação simultânea.

### `created_by_user_id`

- tipo físico: `uuid`
- nulidade: `not null`
- FK: `users.id`
- `on update`: `cascade`
- `on delete`: `restrict`
- finalidade:
  - registrar quem criou o compromisso.

### `confirmed_by_user_id`

- tipo físico: `uuid`
- nulidade: `nullable`
- FK: `users.id`
- `on update`: `cascade`
- `on delete`: `set null`
- finalidade:
  - registrar quem confirmou internamente o jogo, quando aplicável.

### `confirmed_at`

- tipo físico: `timestamptz`
- nulidade: `nullable`
- finalidade:
  - registrar quando o compromisso entrou em estado de confirmação interna.

### `cancelled_by_user_id`

- tipo físico: `uuid`
- nulidade: `nullable`
- FK: `users.id`
- `on update`: `cascade`
- `on delete`: `set null`
- finalidade:
  - registrar quem cancelou o compromisso.

### `cancelled_at`

- tipo físico: `timestamptz`
- nulidade: `nullable`
- finalidade:
  - registrar quando o compromisso foi cancelado.

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

### `scheduled_match_origin_type`

- `PLANNED`
- `DERIVED_FROM_MATCH`

### `scheduled_match_opponent_type`

- `APP_TEAM`
- `LOCAL_OPPONENT`

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

### `scheduled_match_status`

- `PLANNED`
- `CONFIRMED_INTERNAL`
- `RELEASED_TO_TEAM`
- `CANCELLED`

## Regras dos enums

### `scheduled_match_origin_type`

- `PLANNED`
  - fluxo normal: primeiro agenda, depois partida.

- `DERIVED_FROM_MATCH`
  - fluxo invertido: primeiro partida, depois item derivado de agenda.

### `scheduled_match_opponent_type`

- `APP_TEAM`
  - adversário existe como time oficial do app.

- `LOCAL_OPPONENT`
  - adversário existe apenas no banco privado/local do time ou foi criado contextualmente.

### `scheduled_match_status`

- `PLANNED`
  - jogo lançado na agenda, ainda sem confirmação interna fechada.

- `CONFIRMED_INTERNAL`
  - jogo já fechado internamente pela gestão, mas ainda pode não estar visível para o elenco e torcida.

- `RELEASED_TO_TEAM`
  - jogo já liberado para o time, com presença e comunicação já possíveis.

- `CANCELLED`
  - compromisso cancelado sem apagar histórico.

## Constraints sugeridas

## Primary key

- `pk_scheduled_matches`
  - colunas: `id`

## Foreign keys

- `fk_scheduled_matches_team`
  - coluna: `team_id`
  - referência: `teams.id`
  - `on update cascade`
  - `on delete restrict`

- `fk_scheduled_matches_opponent_team`
  - coluna: `opponent_team_id`
  - referência: `teams.id`
  - `on update cascade`
  - `on delete restrict`

- `fk_scheduled_matches_local_opponent`
  - coluna: `local_opponent_id`
  - referência: `local_opponents.id`
  - `on update cascade`
  - `on delete restrict`

- `fk_scheduled_matches_venue`
  - coluna: `venue_id`
  - referência: `venues.id`
  - `on update cascade`
  - `on delete restrict`

- `fk_scheduled_matches_created_by_user`
  - coluna: `created_by_user_id`
  - referência: `users.id`
  - `on update cascade`
  - `on delete restrict`

- `fk_scheduled_matches_confirmed_by_user`
  - coluna: `confirmed_by_user_id`
  - referência: `users.id`
  - `on update cascade`
  - `on delete set null`

- `fk_scheduled_matches_cancelled_by_user`
  - coluna: `cancelled_by_user_id`
  - referência: `users.id`
  - `on update cascade`
  - `on delete set null`

## Check constraints sugeridas

- `ck_scheduled_matches_opponent_name_not_blank`
  - `btrim(opponent_name) <> ''`

- `ck_scheduled_matches_notes_not_blank_when_present`
  - se `notes is not null`, então `btrim(notes) <> ''`

- `ck_scheduled_matches_organization_name_not_blank_when_present`
  - se `organization_name is not null`, então `btrim(organization_name) <> ''`

- `ck_scheduled_matches_opponent_type_consistency`
  - se `opponent_type = 'APP_TEAM'`, então `opponent_team_id is not null` e `local_opponent_id is null`
  - se `opponent_type = 'LOCAL_OPPONENT'`, então `opponent_team_id is null`

- `ck_scheduled_matches_announcement_publish_at_consistency`
  - se `publish_match_announcement = true`, então `announcement_publish_at is not null`

- `ck_scheduled_matches_confirmed_consistency`
  - se `status = 'CONFIRMED_INTERNAL'`, então `confirmed_at is not null`

- `ck_scheduled_matches_cancelled_consistency`
  - se `status = 'CANCELLED'`, então `cancelled_at is not null`

- `ck_scheduled_matches_frame_count_allowed`
  - `match_frame_count in (1, 2)`

- `ck_scheduled_matches_starters_count_positive`
  - `starters_count > 0`

- `ck_scheduled_matches_visibility_consistency`
  - se `status in ('CONFIRMED_INTERNAL', 'RELEASED_TO_TEAM')`, então `team_visibility_at is not null`

- `ck_scheduled_matches_announcement_platforms_when_enabled`
  - se `publish_match_announcement = false`, então `announcement_platforms` pode ser `null`
  - se `publish_match_announcement = true`, `announcement_platforms` pode ser vazio apenas quando a divulgação externa não foi selecionada, mantendo a divulgação no app como obrigatória

## Unicidade

Não deve existir unicidade rígida simples por:

- `team_id + match_date + match_time + opponent_name`

Porque jogos podem ser remarcados, duplicados operacionalmente por erro humano ou existir eventos semelhantes com mesmo adversário em contextos diferentes.

A prevenção de duplicidade deve acontecer principalmente no serviço de domínio e na UI.

## Índices sugeridos

- `idx_scheduled_matches_team_id`
  - colunas: `team_id`
  - finalidade:
    - listar agenda do time.

- `idx_scheduled_matches_team_id_match_date`
  - colunas: (`team_id`, `match_date`)
  - finalidade:
    - agenda por período.

- `idx_scheduled_matches_team_id_status`
  - colunas: (`team_id`, `status`)
  - finalidade:
    - filtros operacionais.

- `idx_scheduled_matches_team_visibility_at`
  - colunas: (`team_id`, `team_visibility_at`)
  - finalidade:
    - liberação programada para o time.

- `idx_scheduled_matches_origin_type`
  - colunas: `origin_type`
  - finalidade:
    - distinguir planejados de derivados.

- `idx_scheduled_matches_opponent_team_id`
  - colunas: `opponent_team_id`
  - finalidade:
    - histórico de confrontos com times oficiais.

- `idx_scheduled_matches_local_opponent_id`
  - colunas: `local_opponent_id`
  - finalidade:
    - histórico de confrontos com adversários locais.

## Regras de negócio centrais

1. `scheduled_matches` e `matches` são agregados diferentes.
2. Agenda existe mesmo sem partida operacional aberta.
3. Presença nasce a partir de `scheduled_matches`.
4. `modality` do compromisso orienta presença, filtros e abertura da partida.
5. `match_frame_count` organiza a leitura de quadros na agenda, mas não cria automaticamente partidas.
6. `starters_count` define a quantidade esperada de titulares para aquele jogo e deve ser herdado pela `match`.
7. `team_visibility_at` controla quando o compromisso vira assunto do restante do time.
8. Divulgação externa depende de material mínimo para arte.
9. Cancelamento não apaga histórico.

## Regras de `Quantidade de titulares (starters_count)`

- `FUTSAL`
  - padrão: `5`
- `FIELD`
  - padrão: `11`
- `SOCIETY`
  - padrão inicial: `6`

Regras:

- no agendamento, a UI não precisa expor edição desse campo;
- o valor nasce automaticamente a partir da modalidade;
- em `SOCIETY`, a tela de escalação pode ajustar operacionalmente para `7`;
- quando esse ajuste ocorrer, o novo valor deve ser persistido:
  - em `scheduled_matches.starters_count`;
  - e na `match` vinculada quando ela existir;
- a persistência é importante para filtros e leituras históricas posteriores.

## Regras de adversário

### Adversário oficial do app

Quando `opponent_type = APP_TEAM`:

- usar `opponent_team_id`
- manter `opponent_name` como snapshot amigável
- não usar `local_opponent_id`

### Adversário local

Quando `opponent_type = LOCAL_OPPONENT`:

- pode existir `local_opponent_id`
- `opponent_name` continua obrigatório como verdade operacional mínima
- esse adversário não vira automaticamente `teams`

## Regras de local

- `venue_id` pode existir quando a quadra/campo já for conhecida formalmente.
- `venue_name_snapshot` e `venue_address_snapshot` continuam úteis mesmo com `venue_id`, porque congelam a leitura do compromisso.
- amistoso com quadra principal do time pode nascer pré-preenchido, mas permanece editável.

## Regras de visibilidade para o time

- `team_visibility_at` é `datetime`.
- Se a gestão confirmar internamente e não alterar a data, a UI pode assumir “agora”.
- Se a gestão alterar a data, a exibição para o time fica programada.
- Ao efetivar a liberação, o compromisso entra em `RELEASED_TO_TEAM`.

## Regras de divulgação

- `publish_match_announcement = true` significa que o time quer divulgar o jogo.
- A divulgação no app é obrigatória quando esse bloco estiver ativo.
- `announcement_platforms` guarda apenas as redes externas selecionadas.
- Valores iniciais esperados em `announcement_platforms`:
  - `INSTAGRAM`
  - `TIKTOK`
  - `YOUTUBE`

### Pré-requisitos para desbloquear divulgação

O backend e a UI devem exigir material mínimo para a arte:

- escudo do próprio time;
- nome do adversário;
- escudo do adversário.

Esse escudo do adversário pode vir de:

- time oficial do app;
- `local_opponents` já cadastrado com escudo;
- criação contextual de adversário no agendamento com upload de escudo.

## Relações com outras tabelas

## Relação com `teams`

- tipo: `N -> 1`
- chave: `scheduled_matches.team_id -> teams.id`
- regra:
  - um time possui vários compromissos agendados.

## Relação com `local_opponents`

- tipo: `N -> 0..1`
- chave: `scheduled_matches.local_opponent_id -> local_opponents.id`
- regra:
  - usada apenas quando o adversário não é um time oficial do app.

## Relação com `venues`

- tipo: `N -> 0..1`
- chave: `scheduled_matches.venue_id -> venues.id`
- regra:
  - local formal é opcional; snapshots continuam válidos.

## Relação com `match_attendance_responses`

- tipo: `1 -> N`
- regra:
  - um compromisso pode receber várias respostas de presença dos integrantes do time.

## Relação com `matches`

- relação lógica de ponte operacional;
- uma `match` pode nascer a partir de `scheduled_match_id`;
- para jogos com dois quadros, o mesmo compromisso pode dar origem a partidas operacionais separadas por quadro, conforme o contrato de `matches`.

## Regras operacionais por fluxo

### Agendamento normal

Fluxo:

- criar `scheduled_match`
- manter em `PLANNED` ou `CONFIRMED_INTERNAL`
- liberar para o time no momento adequado

### Jogo de última hora

Fluxo:

- abrir a partida operacional primeiro
- criar `scheduled_match` derivado com `origin_type = DERIVED_FROM_MATCH`
- manter esse item na agenda para consistência histórica e navegação

### Cancelamento

Fluxo:

- marcar `status = CANCELLED`
- preencher `cancelled_at`
- preencher `cancelled_by_user_id`, quando ação humana
- preservar histórico de agenda e comunicação

## O que não deve ficar em `scheduled_matches`

Não devem ficar aqui:

- escalação real;
- eventos da partida;
- placar operacional;
- scout;
- participação real dos jogadores.

Esses dados pertencem, respectivamente, a:

- `matches` e tabelas derivadas
- tabelas de eventos da partida
- `matches`
- tabelas de scout
- `match_players`

## Dependências diretas desta tabela

Esta tabela conversa diretamente com:

- `teams`
- `local_opponents`
- `venues`
- `users`
- `match_attendance_responses`
- `matches`
- `Scheduled_Matches_API`
- tela de agenda
- tela de confirmação de presença
- fluxo de abertura da partida

## Riscos de alteração futura

Mudanças em:

- semântica de `status`;
- regra de visibilidade por `team_visibility_at`;
- cardinalidade entre compromisso e partidas operacionais;
- estrutura de adversário local versus time oficial;
- semântica de `match_frame_count`;
- pré-requisitos de divulgação

impactam em cascata:

- agenda do time;
- presença;
- notificações;
- divulgação no app e redes;
- criação da partida operacional;
- histórico de confrontos.

## Resumo estrutural

`scheduled_matches` é a agenda oficial do time. Ele segura o jogo antes da bola rolar, organiza presença, comunicação e divulgação, e depois entrega o contexto certo para a partida operacional nascer sem confundir planejamento com execução.
