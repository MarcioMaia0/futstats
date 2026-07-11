---
title: Scheduled Matches API
status: Draft
version: 1.1.0
owner: Product Architecture
last_update: 2026-07-10
related_documents:
  - ./Matches_API.md
  - ../Domain/Matches.md
  - ../Implementation/Database/Table_Spec_scheduled_matches.md
  - ../Implementation/Database/Table_Spec_match_attendance_responses.md
---

# Scheduled Matches API

## Objetivo

Definir a familia de endpoints responsavel pela agenda de jogos, antes da partida operacional existir ou ser aberta.

## Fronteira do agregado

`scheduled_matches` representa:

- planejamento;
- confirmacao interna;
- liberacao para o time;
- presenca;
- cobranca de presenca;
- ponte para abertura da partida operacional.

Tambem representa:

- a configuracao herdavel de `Quantidade de titulares (starters_count)` para a futura partida operacional.

`scheduled_matches` nao representa:

- escalacao real;
- eventos ao vivo;
- gols;
- substituicoes;
- operacao de scout.

Esses comportamentos pertencem a `matches`.

## Rotas iniciais

```text
POST /api/v1/teams/:team_id/scheduled-matches
GET /api/v1/teams/:team_id/scheduled-matches
GET /api/v1/teams/:team_id/scheduled-matches/:scheduled_match_id
PATCH /api/v1/teams/:team_id/scheduled-matches/:scheduled_match_id
POST /api/v1/teams/:team_id/scheduled-matches/:scheduled_match_id/cancel
POST /api/v1/teams/:team_id/scheduled-matches/:scheduled_match_id/release
POST /api/v1/teams/:team_id/scheduled-matches/:scheduled_match_id/attendance-responses
POST /api/v1/teams/:team_id/scheduled-matches/:scheduled_match_id/attendance-responses/on-behalf
POST /api/v1/teams/:team_id/scheduled-matches/:scheduled_match_id/attendance-reminders
POST /api/v1/teams/:team_id/scheduled-matches/:scheduled_match_id/create-match
```

## Grupos de endpoint

### Planejamento

- `POST /api/v1/teams/:team_id/scheduled-matches`
  - cria compromisso futuro de jogo.
- `PATCH /api/v1/teams/:team_id/scheduled-matches/:scheduled_match_id`
  - edita dados do compromisso enquanto ele ainda estiver em estado compativel.
- `POST /api/v1/teams/:team_id/scheduled-matches/:scheduled_match_id/cancel`
  - cancela o compromisso sem apagar historico.

### Leitura da agenda

- `GET /api/v1/teams/:team_id/scheduled-matches`
  - lista agenda do time.
- `GET /api/v1/teams/:team_id/scheduled-matches/:scheduled_match_id`
  - retorna detalhe do compromisso, incluindo leitura de presenca.

### Liberacao para o time

- `POST /api/v1/teams/:team_id/scheduled-matches/:scheduled_match_id/release`
  - promove o compromisso para visibilidade do time;
  - deve respeitar a logica de `team_visibility_at`.

### Presenca

- `POST /api/v1/teams/:team_id/scheduled-matches/:scheduled_match_id/attendance-responses`
  - registra resposta da propria pessoa autenticada.
- `POST /api/v1/teams/:team_id/scheduled-matches/:scheduled_match_id/attendance-responses/on-behalf`
  - registra resposta em nome de outro integrante do time;
  - deve guardar quem respondeu por ele.
- `POST /api/v1/teams/:team_id/scheduled-matches/:scheduled_match_id/attendance-reminders`
  - dispara cobranca manual ou automatizada para quem ainda nao respondeu ou segue em duvida, conforme regra futura.

### Ponte para a partida operacional

- `POST /api/v1/teams/:team_id/scheduled-matches/:scheduled_match_id/create-match`
  - abre a partida operacional vinculada ao compromisso;
  - no caso de dois quadros, a abertura operacional real deve respeitar a estrategia adotada para os quadros.

## Regras

- `scheduled_matches` e `matches` sao agregados diferentes.
- A agenda deve existir mesmo sem partida operacional aberta.
- Presenca pertence a `scheduled_matches`.
- Presenca deve usar `match_attendance_responses`.
- A lista de presenca pode ser separada visualmente por quadro, sem multiplicar a resposta do integrante.
- O fluxo normal e:
  - cria agendamento;
  - confirma internamente;
  - libera para o time;
  - coleta presenca;
  - abre partida operacional.
- O fluxo inverso continua valido:
  - cria partida operacional;
  - deriva item de agenda depois.
- `create-match` nao substitui a API operacional de `matches`; ele apenas cria a ponte entre os dois agregados.

## Blocos canonicos do contrato

### `opponent`

Representa o adversario do compromisso.

Estrutura conceitual:

```json
{
  "type": "APP_TEAM",
  "opponent_team_id": "uuid|null",
  "local_opponent_id": "uuid|null",
  "name": "Uniao da Norte",
  "crest_upload_token": "temp_token_optional"
}
```

Regras:

- `type` aceita:
  - `APP_TEAM`
  - `LOCAL_OPPONENT`
- se `type = APP_TEAM`:
  - exige `opponent_team_id`;
  - `name` pode vir como snapshot amigavel.
- se `type = LOCAL_OPPONENT`:
  - pode usar `local_opponent_id` quando o adversario ja existir na agenda privada do time;
  - pode aceitar criacao contextual de novo adversario por nome;
  - `crest_upload_token` pode ser usado para enriquecer o adversario local no momento do cadastro.
- `name` e obrigatorio como verdade operacional minima do compromisso.

### `venue`

Representa o local do compromisso.

Estrutura conceitual:

```json
{
  "venue_id": "uuid|null",
  "name_snapshot": "Quadra da Vila",
  "address_snapshot": "Rua Exemplo, 123 - Sao Paulo/SP"
}
```

Regras:

- quando `venue_id` existir, ele representa local formal conhecido;
- `name_snapshot` e `address_snapshot` continuam uteis como leitura congelada do compromisso;
- quando a quadra nao existir previamente, o compromisso pode nascer apenas com snapshot manual;
- amistoso com quadra principal do time pode vir pre-preenchido, mas continua editavel.

### `visibility`

Representa a liberacao do compromisso para o restante do time.

Estrutura conceitual:

```json
{
  "status": "CONFIRMED_INTERNAL",
  "team_visibility_at": "2026-07-27T10:00:00Z"
}
```

Regras:

- `status` aceita:
  - `PLANNED`
  - `CONFIRMED_INTERNAL`
  - `RELEASED_TO_TEAM`
  - `CANCELLED`
- se `status = CONFIRMED_INTERNAL`:
  - `team_visibility_at` pode nascer com data/hora atual;
  - ou pode ser agendado para o futuro.
- `team_visibility_at` e `datetime`, nao string sem semantica temporal.

### `announcement`

Representa a configuracao de divulgacao do compromisso.

Estrutura conceitual:

```json
{
  "publish_match_announcement": true,
  "announcement_publish_at": "2026-07-27T10:00:00Z",
  "platforms": ["INSTAGRAM", "TIKTOK"]
}
```

Regras:

- divulgacao externa so pode ser habilitada quando houver material minimo para a arte:
  - nome do adversario;
  - escudo do adversario;
  - escudo do proprio time.
- se `publish_match_announcement = true`:
  - a divulgacao no app e obrigatoria;
  - `announcement_publish_at` controla quando a divulgacao comeca;
  - `platforms` lista redes externas selecionadas.
- se nao houver condicoes minimas para a arte, o bloco deve ficar bloqueado na UI e rejeitado no backend quando necessario.

## Contratos prioritarios

### `POST /api/v1/teams/:team_id/scheduled-matches`

Cria um compromisso futuro de jogo.

#### Request conceitual

```json
{
  "match_date": "2026-08-01",
  "match_time": "15:00:00",
  "modality": "FUTSAL",
  "match_type": "FRIENDLY",
  "age_category": "OPEN",
  "organization_name": "Liga do Batalha",
  "match_frame_count": 2,
  "starters_count": 5,
  "opponent": {
    "type": "LOCAL_OPPONENT",
    "local_opponent_id": null,
    "name": "Uniao da Norte",
    "crest_upload_token": "temp-crest-token"
  },
  "venue": {
    "venue_id": null,
    "name_snapshot": "Quadra da Vila",
    "address_snapshot": "Rua Exemplo, 123 - Sao Paulo/SP"
  },
  "visibility": {
    "status": "CONFIRMED_INTERNAL",
    "team_visibility_at": "2026-07-27T10:00:00Z"
  },
  "announcement": {
    "publish_match_announcement": true,
    "announcement_publish_at": "2026-07-27T10:00:00Z",
    "platforms": ["INSTAGRAM", "TIKTOK"]
  },
  "notes": "Segundo quadro abre o evento"
}
```

#### Regras

- endpoint exige sessao autenticada;
- exige permissao de gestao do time;
- campos minimos recomendados:
  - `match_date`
  - `match_time`
  - `modality`
  - `match_type`
  - `opponent`
- `match_frame_count` aceita inicialmente:
  - `1`
  - `2`
- `starters_count` nasce da modalidade:
  - `FUTSAL = 5`
  - `SOCIETY = 6`
  - `FIELD = 11`
- no agendamento, a UI pode não expor a edição direta de `starters_count`;
- em `SOCIETY`, o ajuste operacional para `7` pode acontecer depois, na tela de escalação;
- `organization_name` e opcional;
- `age_category` e opcional;
- `notes` e opcional;
- se o adversario local for criado no mesmo fluxo:
  - o backend pode persisti-lo antes de fechar o compromisso;
- se o escudo do adversario vier por `crest_upload_token`:
  - o backend deve validar token e promover a midia para o adversario local quando o fluxo assim exigir.

#### Response 201 conceitual

```json
{
  "scheduled_match": {
    "id": "uuid",
    "team_id": "uuid-team",
    "origin_type": "PLANNED",
    "status": "CONFIRMED_INTERNAL",
    "match_date": "2026-08-01",
    "match_time": "15:00:00",
    "modality": "FUTSAL",
    "match_type": "FRIENDLY",
    "age_category": "OPEN",
    "organization_name": "Liga do Batalha",
    "match_frame_count": 2,
    "starters_count": 5,
    "team_visibility_at": "2026-07-27T10:00:00Z",
    "publish_match_announcement": true,
    "announcement_publish_at": "2026-07-27T10:00:00Z"
  },
  "opponent_summary": {
    "type": "LOCAL_OPPONENT",
    "name": "Uniao da Norte"
  },
  "venue_summary": {
    "name": "Quadra da Vila",
    "address": "Rua Exemplo, 123 - Sao Paulo/SP"
  }
}
```

### `PATCH /api/v1/teams/:team_id/scheduled-matches/:scheduled_match_id`

Atualiza parcialmente um compromisso ainda editavel.

#### Regras

- patch parcial;
- pode ajustar:
  - data;
  - horario;
  - modalidade;
  - tipo de jogo;
  - categoria etaria;
  - organizacao;
  - adversario;
  - local;
  - visibilidade futura;
  - divulgacao;
  - `match_frame_count`;
  - `starters_count`, quando a alteracao vier de fluxo operacional autorizado;
  - `notes`.
- compromisso cancelado nao deve aceitar edicao normal.

### `POST /api/v1/teams/:team_id/scheduled-matches/:scheduled_match_id/release`

Libera o compromisso para o time.

#### Request conceitual

```json
{
  "team_visibility_at": "2026-07-27T10:00:00Z",
  "release_now": false
}
```

#### Regras

- `release_now = true` implica usar data/hora atual;
- se `release_now = false`, `team_visibility_at` deve ser valida;
- ao efetivar a liberacao, o compromisso evolui para `RELEASED_TO_TEAM`.

### `POST /api/v1/teams/:team_id/scheduled-matches/:scheduled_match_id/attendance-responses`

Registra a resposta da propria pessoa.

#### Request conceitual

```json
{
  "response_status": "GOING",
  "notes": "Vou direto do trabalho"
}
```

#### Regras

- a resposta deve operar sobre o `integrante do time (team_member)` da propria pessoa autenticada;
- `response_status` aceita:
  - `GOING`
  - `NOT_GOING`
  - `MAYBE`
  - `GOING_NOT_PLAYING`
- `CONFIRMED_NO_SHOW` nao deve nascer da auto-resposta; ele e estado derivado/administrativo posterior.

### `POST /api/v1/teams/:team_id/scheduled-matches/:scheduled_match_id/attendance-responses/on-behalf`

Registra resposta em nome de outro integrante.

#### Request conceitual

```json
{
  "team_member_id": "uuid-team-member",
  "response_status": "GOING_NOT_PLAYING",
  "notes": "Vai acompanhar, mas esta lesionado"
}
```

#### Regras

- exige permissao de gestao;
- deve persistir `responded_by_user_id`;
- opera sobre `team_member_id` explicito.

### `POST /api/v1/teams/:team_id/scheduled-matches/:scheduled_match_id/create-match`

Abre a partida operacional vinculada ao compromisso.

#### Request conceitual

```json
{
  "frame_type": "SECOND_FRAME",
  "create_as_draft": true
}
```

#### Regras

- no modelo atual, o compromisso pode dar origem a partidas operacionais por quadro;
- `frame_type` aceita inicialmente:
  - `UNIQUE_FRAME`
  - `SECOND_FRAME`
  - `FIRST_FRAME`
- `create_as_draft = true` permite abrir a superficie operacional sem marcar inicio real do jogo;
- a existencia do compromisso nao obriga criar todas as partidas operacionais de uma vez;
- a criacao da partida deve manter `scheduled_match_id` explicito em `matches`.
- a partida criada deve herdar:
  - `modality`
  - `match_type`
  - `age_category`
  - `organization_name`
  - `match_frame_count`
  - `starters_count`
