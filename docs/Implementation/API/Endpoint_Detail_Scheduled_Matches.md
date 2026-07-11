---
title: Endpoint Detail Scheduled Matches
status: Draft
version: 1.1.0
owner: Product Architecture
last_update: 2026-07-10
related_documents:
  - ../../API/Scheduled_Matches_API.md
  - ../../Implementation/Database/Table_Spec_scheduled_matches.md
  - ../../Implementation/Database/Table_Spec_match_attendance_responses.md
---

# Endpoint Detail Scheduled Matches

## Objetivo

Detalhar a familia de endpoints da agenda de jogos.

## Endpoints

```http
POST /api/v1/teams/{teamId}/scheduled-matches
GET /api/v1/teams/{teamId}/scheduled-matches
GET /api/v1/teams/{teamId}/scheduled-matches/{scheduledMatchId}
PATCH /api/v1/teams/{teamId}/scheduled-matches/{scheduledMatchId}
POST /api/v1/teams/{teamId}/scheduled-matches/{scheduledMatchId}/cancel
POST /api/v1/teams/{teamId}/scheduled-matches/{scheduledMatchId}/release
POST /api/v1/teams/{teamId}/scheduled-matches/{scheduledMatchId}/attendance-responses
POST /api/v1/teams/{teamId}/scheduled-matches/{scheduledMatchId}/attendance-responses/on-behalf
POST /api/v1/teams/{teamId}/scheduled-matches/{scheduledMatchId}/attendance-reminders
POST /api/v1/teams/{teamId}/scheduled-matches/{scheduledMatchId}/create-match
```

## Regras

- `POST /api/v1/teams/{teamId}/scheduled-matches`
  - deve criar compromisso futuro sem exigir partida operacional.
- `PATCH /api/v1/teams/{teamId}/scheduled-matches/{scheduledMatchId}`
  - deve permitir ajuste de data, horario, adversario, local, modalidade, categoria etaria, organizacao e dados de divulgacao, conforme estado compativel.
- `POST /api/v1/teams/{teamId}/scheduled-matches/{scheduledMatchId}/cancel`
  - cancela o compromisso sem apagar historico.
- `POST /api/v1/teams/{teamId}/scheduled-matches/{scheduledMatchId}/release`
  - torna o compromisso visivel ao time e pode disparar notificacoes conforme `team_visibility_at`.
- `POST /api/v1/teams/{teamId}/scheduled-matches/{scheduledMatchId}/attendance-responses`
  - registra resposta da propria pessoa.
- `POST /api/v1/teams/{teamId}/scheduled-matches/{scheduledMatchId}/attendance-responses/on-behalf`
  - registra resposta em nome de outro integrante;
  - deve persistir `responded_by_user_id`.
- `POST /api/v1/teams/{teamId}/scheduled-matches/{scheduledMatchId}/attendance-reminders`
  - dispara cobranca operacional;
  - o comportamento exato de janela e recorrencia pode evoluir depois.
- `POST /api/v1/teams/{teamId}/scheduled-matches/{scheduledMatchId}/create-match`
  - cria a partida operacional vinculada ao compromisso.

## Contratos detalhados

### `POST /api/v1/teams/{teamId}/scheduled-matches`

#### Request

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

#### Validacoes principais

- `match_date` obrigatorio;
- `match_time` obrigatorio;
- `modality` obrigatoria;
- `match_type` obrigatorio;
- `opponent` obrigatorio;
- `match_frame_count` aceita inicialmente `1` ou `2`;
- `starters_count` deve ser derivado da modalidade no nascimento do compromisso:
  - `FUTSAL = 5`
  - `SOCIETY = 6`
  - `FIELD = 11`
- no fluxo normal de agenda, a UI não precisa expor edição direta de `starters_count`;
- para `SOCIETY`, a alteração operacional para `7` pode acontecer depois na escalação;
- `opponent.type = APP_TEAM` exige `opponent_team_id`;
- `opponent.type = LOCAL_OPPONENT` exige:
  - `local_opponent_id`; ou
  - `name`;
- `announcement.publish_match_announcement = true` exige:
  - material minimo para a arte;
  - `announcement_publish_at`.

### `PATCH /api/v1/teams/{teamId}/scheduled-matches/{scheduledMatchId}`

#### Request

Patch parcial com os mesmos blocos de `POST`, aceitando apenas os campos que mudaram.

#### Validacoes principais

- nao permitir patch operacional em compromisso `CANCELLED`;
- se o patch alterar `announcement`, revalidar os pre-requisitos de divulgacao;
- se o patch alterar `visibility`, revalidar consistencia entre `status` e `team_visibility_at`.
- se o patch alterar `starters_count`:
  - exigir origem operacional autorizada;
  - manter consistencia com a partida vinculada, quando ela já existir.

### `POST /api/v1/teams/{teamId}/scheduled-matches/{scheduledMatchId}/release`

#### Request

```json
{
  "release_now": false,
  "team_visibility_at": "2026-07-27T10:00:00Z"
}
```

#### Validacoes principais

- `release_now = true` usa data/hora atual;
- `release_now = false` exige `team_visibility_at`;
- se o compromisso ja estiver `RELEASED_TO_TEAM`, a rota deve se comportar como idempotente ou rejeitar com erro de estado, conforme politica futura.

### `POST /api/v1/teams/{teamId}/scheduled-matches/{scheduledMatchId}/attendance-responses`

#### Request

```json
{
  "response_status": "GOING",
  "notes": "Vou direto do trabalho"
}
```

#### Validacoes principais

- identificar automaticamente o `integrante do time (team_member)` da pessoa autenticada naquele time;
- aceitar apenas:
  - `GOING`
  - `NOT_GOING`
  - `MAYBE`
  - `GOING_NOT_PLAYING`;
- impedir `CONFIRMED_NO_SHOW` nesta rota.

### `POST /api/v1/teams/{teamId}/scheduled-matches/{scheduledMatchId}/attendance-responses/on-behalf`

#### Request

```json
{
  "team_member_id": "uuid-team-member",
  "response_status": "GOING_NOT_PLAYING",
  "notes": "Vai acompanhar, mas esta lesionado"
}
```

#### Validacoes principais

- exige gestao;
- `team_member_id` deve pertencer ao mesmo time;
- deve persistir `responded_by_user_id`.

### `POST /api/v1/teams/{teamId}/scheduled-matches/{scheduledMatchId}/attendance-reminders`

#### Request

```json
{
  "scope": "PENDING_AND_MAYBE",
  "manual_trigger_reason": "Diretoria quer fechar os quadros hoje"
}
```

#### Validacoes principais

- exige gestao;
- o comportamento inicial pode aceitar escopos como:
  - `PENDING_ONLY`
  - `PENDING_AND_MAYBE`
  - `ALL_NOT_CONFIRMED`

### `POST /api/v1/teams/{teamId}/scheduled-matches/{scheduledMatchId}/create-match`

#### Request

```json
{
  "frame_type": "SECOND_FRAME",
  "create_as_draft": true
}
```

#### Validacoes principais

- `frame_type` obrigatorio;
- para compromisso com `match_frame_count = 1`, usar `UNIQUE_FRAME`;
- para compromisso com `match_frame_count = 2`, usar:
  - `SECOND_FRAME`
  - `FIRST_FRAME`
- a rota nao precisa criar todos os quadros de uma vez;
- a partida criada deve referenciar `scheduled_match_id`.
- a partida criada deve herdar `starters_count` do compromisso.

## Criterios de qualidade

- O contrato deve deixar claro que agenda e partida sao agregados diferentes.
- O comportamento deve preservar consistencia entre produto, dominio, API e banco.
- Presenca nao deve depender de `player`.
- Presenca deve depender de `team_member`.
- A agenda deve continuar valida mesmo sem scout, escalacao ou partida aberta.
