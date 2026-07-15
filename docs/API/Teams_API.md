---
title: Teams API
status: Draft
version: 1.4.0
owner: Product Architecture
last_update: 2026-07-14
related_documents:
  - ../Architecture/Media_Storage_Strategy.md
  - ./Scheduled_Matches_API.md
  - ../Frontend/Screens/Create_Team_Wizard.md
  - ../Frontend/Screens/Team_Settings.md
  - ../Implementation/Database/Table_Spec_media_assets.md
  - ../Implementation/Database/Table_Spec_team_join_requests.md
  - ../Implementation/Database/Table_Spec_team_modalities.md
  - ../Implementation/Database/Table_Spec_team_members.md
  - ../Implementation/Database/Table_Spec_team_players.md
  - ../Implementation/Database/Table_Spec_team_social_connections.md
  - ../Implementation/Database/Table_Spec_team_settings.md
  - ../Implementation/Database/Table_Spec_teams.md
  - ../Implementation/Database/Table_Spec_venues.md
  - ../Implementation/Database/Table_Spec_user_team_roles.md
  - ../Implementation/Database/Table_Spec_posts.md
---

# Teams API

## Objetivo

Definir os contratos principais do domínio `Teams`, com foco no fluxo de criação progressiva de time, aprovação de entrada em time e conexões sociais do time.

Este documento não cobre agenda de jogos, liberação para o time ou presença em compromissos.

Esses comportamentos pertencem a `Scheduled_Matches_API.md`.

## Rotas

```text
POST /api/v1/teams
GET /api/v1/teams/search
GET /api/v1/teams/:team_id
PATCH /api/v1/teams/:team_id
GET /api/v1/teams/:team_id/members
POST /api/v1/teams/:team_id/members
PATCH /api/v1/teams/:team_id/members/:team_member_id
POST /api/v1/teams/:team_id/members/:team_member_id/roles
POST /api/v1/teams/:team_id/members/:team_member_id/roles/:role/revoke
POST /api/v1/teams/:team_id/members/:team_member_id/player
PATCH /api/v1/teams/:team_id/team-players/:team_player_id
PATCH /api/v1/teams/:team_id/settings
GET /api/v1/teams/:team_id/social-connections
PATCH /api/v1/teams/:team_id/social-connections/:platform
POST /api/v1/teams/:team_id/social-connections/:platform/connect/start
POST /api/v1/teams/:team_id/social-connections/:platform/connect/complete
POST /api/v1/teams/:team_id/social-connections/:platform/disconnect
POST /api/v1/teams/:team_id/social-connections/:platform/validate
POST /api/v1/posts/:post_id/distribution/:platform/retry
GET /api/v1/teams/:team_id/join-requests
POST /api/v1/teams/:team_id/join-requests
POST /api/v1/teams/:team_id/join-requests/:request_id/approve
POST /api/v1/teams/:team_id/join-requests/:request_id/reject
POST /api/v1/teams/:team_id/join-requests/:request_id/cancel
```

## Contrato prioritário

### `POST /api/v1/teams`

Cria um time e concede papel inicial de gestão para a pessoa autenticada.

#### Request

```json
{
  "name": "Ajax da Leste",
  "crest_upload_token": "temp-upload-token",
  "founded_year": 2021,
  "founded_month": 5,
  "founded_day": 24,
  "modalities": ["FUTSAL", "SOCIETY"],
  "home_match_capability": "HAS_HOME_VENUE",
  "region_state": "SP",
  "region_city": "Sao Paulo",
  "region_zone": "Leste",
  "colors": {
    "first_color": "#D91E18",
    "second_color": "#111111",
    "third_color": "#F5F5F5"
  },
  "social_accounts": {
    "youtube": {
      "handle": "@ajaxdaleste"
    },
    "instagram": {
      "handle": "@ajaxdaleste"
    },
    "tiktok": {
      "handle": "@ajaxdaleste"
    }
  },
  "primary_venue": {
    "name": "Quadra da Vila",
    "region_state": "SP",
    "region_city": "Sao Paulo",
    "region_zone": "Leste",
    "address_line": "Rua Exemplo",
    "address_number": "123",
    "postal_code": "08210-000",
    "latitude": -23.5401,
    "longitude": -46.4872,
    "external_place_provider": "GOOGLE",
    "external_place_id": "google-place-id"
  }
}
```

#### Regras

- Endpoint exige sessão autenticada.
- `name` é o único campo obrigatório.
- O endpoint deve aceitar criação mínima apenas com `name`.
- `crest_upload_token` representa uma mídia temporária previamente enviada para upload e ainda não promovida para ativo final.
- Se `crest_upload_token` vier preenchido, o backend deve validar:
  - que o token pertence à pessoa autenticada;
  - que o token não expirou;
  - que o `purpose` do token é `TEAM_CREST`;
  - que o upload temporário foi concluído;
  - que o token ainda não foi consumido.
- Se `crest_upload_token` for válido, o backend deve promover o arquivo temporário para o ativo final do time durante o fluxo de criação.
- Se `crest_upload_token` vier inválido, expirado, consumido ou incompatível com o propósito, a criação deve falhar com erro explícito.
- `primary_venue` é opcional.
- `social_accounts` é opcional.
- `founded_year`, `founded_month` e `founded_day` são opcionais.
- o contrato deve aceitar precisão parcial da fundação:
  - apenas `founded_year`
  - `founded_month` + `founded_year`
  - `founded_day` + `founded_month` + `founded_year`
- `founded_month` não deve ser aceito sem `founded_year`.
- `founded_day` não deve ser aceito sem `founded_month` e `founded_year`.
- `modalities` é opcional e representa modalidades preferenciais do time.
- `modalities` pode aceitar nenhuma, uma ou mais opções.
- `modalities` deve ser persistido em `team_modalities`.
- marcar modalidades aqui não limita a criação futura de partidas em outras modalidades.
- `home_match_capability` é opcional no payload, mas o domínio deve trabalhar conceitualmente com:
  - `HAS_HOME_VENUE`
  - `NO_HOME_VENUE`
  - `NOT_DEFINED_YET`
- `colors`, quando enviado, representa as cores oficiais do time em linguagem de negócio:
  - `first_color`
  - `second_color`
  - `third_color`
- No fluxo de criação, `social_accounts` pode registrar apenas handle ou URL pública; a conexão plena com a plataforma pode ser concluída depois em configurações do time.
- Se `primary_venue` vier preenchido, a API pode criar a quadra e vincular o time a ela no mesmo fluxo transacional.
- Para `primary_venue`, a primeira busca inteligente sugerida é `Google Places`.
- Mesmo quando `primary_venue` vier de busca externa, o backend deve persistir os dados locais escolhidos como verdade operacional do FUTSTATS.
- `teams` usam localidade macro:
  - `region_state`
  - `region_city`
  - `region_zone` opcional.
- `region_zone` pode ficar vazio sem impedir a conclusão da criação do time.
- Se `primary_venue` vier preenchido, ela pode usar localidade macro e endereço micro.
- A ordem oficial das cores do time não deve ser usada para forçar a ordem visual do app.
- O mapeamento visual para a interface pertence a `team_settings`, e não ao contrato de criação do time.
- O endpoint cria:
  - `team`
  - `team_member` ativo da pessoa fundadora
  - vínculo em `user_team_roles` com `role = DIRECTOR`
- A criação do time deve ser atômica: se falhar a vinculação de gestão, o time não deve ficar órfão.
- A criação do time também não deve deixar a pessoa fundadora sem pertencimento canônico ao próprio time.
- Se houver promoção de escudo, o fluxo deve se comportar como uma operação logicamente atômica: o time não deve nascer apontando para uma mídia inválida ou não confirmada.

#### Response 201

```json
{
  "team": {
    "id": "uuid",
    "name": "Ajax da Leste",
    "slug": "ajax-da-leste",
    "crest_media_id": "uuid-media",
    "crest_url": "https://cdn.example.com/teams/ajax.png",
    "modalities": ["FUTSAL", "SOCIETY"],
    "home_match_capability": "HAS_HOME_VENUE",
    "region_state": "SP",
    "region_city": "Sao Paulo",
    "region_zone": "Leste",
    "primary_venue_id": "uuid-venue"
  },
  "membership": {
    "team_member_id": "uuid-team-member",
    "role": "DIRECTOR"
  }
}
```

#### Regras de completude operacional após a criação

- O time pode ser criado apenas com `name`.
- A conclusão do wizard não exige completude operacional máxima.
- Para efeitos de leitura futura, o produto pode tratar o time como operacionalmente `READY` quando existir ao menos:
  - `name`
  - ao menos uma modalidade em `modalities`
  - `region_state`
  - `region_city`
  - uma definição explícita de `home_match_capability`
- `region_zone` melhora o dado, mas não é requisito para considerar o time operacionalmente pronto.

### `GET /api/v1/teams/search`

Busca times para seleção no fluxo `Entrar em um time`.

#### Query params

- `q` obrigatório
- `limit` opcional
- `cursor` opcional

#### Exemplo

```text
GET /api/v1/teams/search?q=ajax&limit=10
```

#### Regras

- Endpoint exige sessão autenticada.
- O objetivo desta rota é busca operacional de times, não listagem completa.
- `q` deve exigir quantidade mínima de caracteres para evitar busca vazia ou ampla demais no fluxo atual.
- Recomendação operacional atual:
  - mínimo de `2` caracteres.
- `limit` deve respeitar teto seguro.
- Recomendação operacional atual:
  - padrão `10`
  - máximo `20`
- A ordenação deve priorizar relevância de nome.
- A API pode considerar localidade como reforço de relevância no futuro, sem mudar o contrato base.
- A resposta deve retornar apenas o que a tela precisa para seleção:
  - identificação do time;
  - nome;
  - escudo;
  - localidade resumida;
  - contexto mínimo de solicitação da pessoa autenticada para evitar ações inválidas.
- Esta rota não cria solicitação de entrada.
- Esta rota não precisa bloquear a exibição de times em que a pessoa já participa ou já possui solicitação pendente.
- Em vez de ocultar o time, a resposta deve devolver sinalizadores que permitam a UI:
  - informar que a pessoa já faz parte do time; ou
  - informar que já existe solicitação pendente.

#### Response 200

```json
{
  "items": [
    {
      "team_id": "uuid-team-1",
      "name": "Ajax da Leste",
      "slug": "ajax-da-leste",
      "crest_url": "https://cdn.example.com/teams/ajax.png",
      "region_state": "SP",
      "region_city": "Sao Paulo",
      "region_zone": "Leste",
      "location_label": "Sao Paulo, SP",
      "request_context": {
        "can_request_join": true,
        "already_member": false,
        "has_pending_join_request": false
      }
    },
    {
      "team_id": "uuid-team-2",
      "name": "Ajax Zona Norte",
      "slug": "ajax-zona-norte",
      "crest_url": null,
      "region_state": "SP",
      "region_city": "Sao Paulo",
      "region_zone": "Norte",
      "location_label": "Sao Paulo, SP",
      "request_context": {
        "can_request_join": false,
        "already_member": true,
        "has_pending_join_request": false
      }
    }
  ],
  "next_cursor": null
}
```

#### Regra de `request_context`

- `can_request_join = true`
  - quando a pessoa autenticada ainda pode abrir uma solicitação para o time.
- `already_member = true`
  - quando a pessoa já possui vínculo ativo com o time.
- `has_pending_join_request = true`
  - quando já existe solicitação pendente da própria pessoa para o mesmo time.
- Se `already_member = true`, `can_request_join` deve ser `false`.
- Se `has_pending_join_request = true`, `can_request_join` deve ser `false`.
- A UI deve usar esse bloco para desabilitar ou ajustar a ação primária do item.

#### Erros conceituais

- `TEAM_SEARCH_QUERY_TOO_SHORT`
- `INVALID_PAGINATION`

### `GET /api/v1/teams/:team_id`

Retorna o detalhe operacional de um time.

#### Regras

- Endpoint pode ser usado por pessoa autenticada.
- A resposta deve separar o dado canônico persistido do dado derivado para leitura.
- `crest_media_id` é a referência persistida do escudo.
- `crest_url` é URL derivada para renderização.
- `modalities` é derivado de `team_modalities`.
- A resposta deve incluir contexto da pessoa autenticada em relação ao time para guiar a UI.

#### Response 200

```json
{
  "team": {
    "id": "uuid-team",
    "name": "Ajax da Leste",
    "slug": "ajax-da-leste",
    "crest_media_id": "uuid-media",
    "crest_url": "https://cdn.example.com/teams/ajax.png",
    "founded_year": 2021,
    "founded_month": 5,
    "founded_day": 24,
    "modalities": ["FUTSAL", "SOCIETY"],
    "home_match_capability": "HAS_HOME_VENUE",
    "region_state": "SP",
    "region_city": "Sao Paulo",
    "region_zone": "Leste",
    "primary_venue_id": "uuid-venue",
    "colors": {
      "first_color": "#D91E18",
      "second_color": "#111111",
      "third_color": "#F5F5F5"
    }
  },
  "viewer_context": {
    "is_member": true,
    "can_manage_team": true,
    "roles": ["DIRECTOR"],
    "team_member_id": "uuid-team-member"
  }
}
```

### `PATCH /api/v1/teams/:team_id`

Atualiza dados principais do time.

#### Request

```json
{
  "name": "Ajax da Leste",
  "crest_upload_token": "temp-upload-token",
  "modalities": ["FUTSAL", "SOCIETY", "FIELD"],
  "home_match_capability": "HAS_HOME_VENUE",
  "region_state": "SP",
  "region_city": "Sao Paulo",
  "region_zone": "Leste",
  "primary_venue_id": "uuid-venue",
  "colors": {
    "first_color": "#D91E18",
    "second_color": "#111111",
    "third_color": "#F5F5F5"
  }
}
```

#### Regras

- Endpoint exige sessão autenticada.
- Exige permissão de gestão do time.
- O patch é parcial.
- `name`, quando alterado, pode exigir recálculo controlado de `slug`.
- `crest_upload_token`, quando enviado, deve seguir as mesmas validações de criação.
- Quando a promoção do escudo for concluída, `teams.crest_media_id` deve apontar para o novo `media_assets.id`.
- `crest_url` não deve ser aceito como campo de escrita.
- Quando `modalities` for enviado, o backend deve sincronizar a coleção final em `team_modalities`.
- Não enviar `modalities` significa não alterar as modalidades já salvas.
- Enviar `modalities: []` significa remover todas as modalidades preferenciais do time.
- Alterar `home_match_capability` não altera automaticamente partidas já agendadas.

### `GET /api/v1/teams/:team_id/members`

Lista integrantes do time.

#### Query params

- `status` opcional
- `include_roles` opcional, default `true`
- `include_player` opcional, default `true`

#### Response 200

```json
{
  "members": [
    {
      "team_member_id": "uuid-team-member",
      "person_id": "uuid-person",
      "display_name": "Lucas",
      "avatar_url": "https://cdn.example.com/avatars/lucas.png",
      "membership_status": "ACTIVE",
      "roles": ["DIRECTOR"],
      "player": {
        "team_player_id": "uuid-team-player",
        "player_id": "uuid-player",
        "status": "ACTIVE"
      }
    }
  ]
}
```

#### Regras

- Endpoint exige sessão autenticada.
- A leitura completa de integrantes exige pertencimento ao time ou permissão de gestão.
- `team_members` responde se a pessoa pertence ao time.
- `user_team_roles` responde se a pessoa tem função de gestão, presidência ou comissão.
- `team_players` responde se a pessoa faz parte do elenco esportivo oficial.
- Uma pessoa só é considerada jogador do time quando existe vínculo ativo em `team_players`.

### `POST /api/v1/teams/:team_id/members`

Cria ou vincula um integrante operacional ao time.

#### Request

```json
{
  "person": {
    "person_id": null,
    "full_name": "Lucas Silva",
    "nickname": "Lucas",
    "avatar_media_id": null
  },
  "assignment_mode": "PLAYER",
  "player": {
    "preferred_number": 10
  }
}
```

#### Valores válidos de `assignment_mode`

- `MEMBER`
- `PLAYER`
- `COMMITTEE`
- `DIRECTOR`
- `PRESIDENT`
- `PLAYER_DIRECTOR`
- `PLAYER_PRESIDENT`

#### Regras

- Endpoint exige sessão autenticada.
- Exige permissão de gestão do time.
- Se `person.person_id` for enviado, a API tenta vincular uma pessoa já existente.
- Se `person.person_id` não for enviado, a API cria uma `person` operacional com os dados mínimos informados.
- O mínimo para criar pessoa operacional é `nickname` ou `full_name`.
- `MEMBER` cria apenas `team_members`.
- `PLAYER` cria ou reutiliza `players` e cria `team_players`.
- Modos que incluem gestão (`COMMITTEE`, `DIRECTOR`, `PRESIDENT`, `PLAYER_DIRECTOR`, `PLAYER_PRESIDENT`) exigem que a pessoa já tenha usuário (`users`) vinculado.
- `user_team_roles` não deve ser criado para pessoa sem usuário autenticável.
- As regras de coexistência de papéis devem seguir `Table_Spec_user_team_roles.md`.
- `COMMITTEE` não deve coexistir com `DIRECTOR`, `PRESIDENT` ou vínculo de jogador.
- `DIRECTOR` e `PRESIDENT` não devem coexistir entre si.
- `DIRECTOR` ou `PRESIDENT` podem coexistir com jogador.

#### Erros conceituais

- `TEAM_PERMISSION_DENIED`
- `TEAM_MEMBER_ALREADY_ACTIVE`
- `TEAM_MEMBER_USER_REQUIRED_FOR_ROLE`
- `TEAM_ROLE_CONFLICT`
- `TEAM_PLAYER_ALREADY_ACTIVE`

### `PATCH /api/v1/teams/:team_id/members/:team_member_id`

Atualiza estado operacional de um integrante.

#### Request

```json
{
  "membership_status": "INACTIVE",
  "notes": "Saiu do time temporariamente"
}
```

#### Regras

- Endpoint exige sessão autenticada.
- Exige permissão de gestão do time.
- `membership_status` deve aceitar os valores definidos em `team_members`.
- Remover ou inativar integrante não deve apagar histórico esportivo.
- Se a pessoa tiver `team_players` ativo, a API deve exigir ação explícita para encerrar também o vínculo esportivo.

### `POST /api/v1/teams/:team_id/members/:team_member_id/roles`

Adiciona papel de gestão, comissão ou presidência para um integrante.

#### Request

```json
{
  "role": "DIRECTOR"
}
```

#### Regras

- Endpoint exige sessão autenticada.
- Exige permissão de gestão do time.
- O integrante precisa estar ativo em `team_members`.
- A pessoa vinculada ao integrante precisa ter usuário (`users`) associado.
- O papel deve respeitar as regras de coexistência de `user_team_roles`.
- A API deve bloquear conflitos antes de persistir.

### `POST /api/v1/teams/:team_id/members/:team_member_id/roles/:role/revoke`

Remove um papel de gestão, comissão ou presidência.

#### Regras

- Endpoint exige sessão autenticada.
- Exige permissão de gestão do time.
- Revogar papel não remove `team_members`.
- Revogar papel não remove `team_players`.
- A API deve impedir que o time fique sem nenhum gestor quando a regra operacional exigir ao menos um responsável.

### `POST /api/v1/teams/:team_id/members/:team_member_id/player`

Transforma um integrante ativo em jogador do elenco oficial.

#### Request

```json
{
  "player_id": null,
  "preferred_number": 10
}
```

#### Regras

- Endpoint exige sessão autenticada.
- Exige permissão de gestão do time.
- O integrante precisa estar ativo em `team_members`.
- A API deve garantir que exista `players` para a mesma `person`.
- `players.person_id` deve ser igual a `team_members.person_id`.
- A API cria ou reativa `team_players`.
- Essa rota não deve ser usada para jogador avulso de partida.

### `PATCH /api/v1/teams/:team_id/team-players/:team_player_id`

Atualiza vínculo esportivo oficial de um jogador com o time.

#### Request

```json
{
  "status": "LEFT",
  "left_at": "2026-07-14T12:00:00Z"
}
```

#### Regras

- Endpoint exige sessão autenticada.
- Exige permissão de gestão do time.
- Encerrar `team_players` não remove a pessoa de `team_members` automaticamente.
- Histórico de partidas e estatísticas já registradas deve permanecer preservado.

### `PATCH /api/v1/teams/:team_id/settings`

Atualiza configurações do time que não fazem parte da identidade principal.

#### Request

```json
{
  "default_theme_id": "uuid-theme",
  "default_language_mode": "PLAIN",
  "default_publish_team_events": true,
  "comments_enabled_by_default": true,
  "reactions_enabled_by_default": true,
  "theme_color_mapping": {
    "background_color_source": "third_color",
    "primary_color_source": "first_color",
    "secondary_color_source": "second_color"
  }
}
```

#### Regras

- Endpoint exige sessão autenticada.
- Exige permissão de gestão do time.
- Configurações visuais do app devem ficar em `team_settings`, não em `teams`.
- A ordem oficial das cores do time continua em `teams`.
- `team_settings` pode definir como essas cores são usadas na interface.

## Conexões sociais do time

### Modelo conceitual

O contrato de `team_social_connections` é dividido em duas camadas:

- identidade pública da conta do time:
  - handle
  - URL pública
  - preferência de publicação
- conexão real com a plataforma:
  - autorização OAuth
  - credenciais válidas
  - status da conexão

Essa separação existe para permitir que o time informe suas redes já no wizard, sem ser obrigado a concluir OAuth naquele momento.

### `GET /api/v1/teams/:team_id/social-connections`

Retorna o estado atual das conexões sociais do time.

#### Response 200

```json
{
  "connections": [
    {
      "platform": "INSTAGRAM",
      "handle": "@ajaxdaleste",
      "channel_url": "https://instagram.com/ajaxdaleste",
      "connection_status": "CONNECTED",
      "publish_events_enabled": true,
      "last_validated_at": "2026-07-08T13:00:00Z",
      "last_publish_at": "2026-07-08T14:00:00Z"
    },
    {
      "platform": "YOUTUBE",
      "handle": "@ajaxdaleste",
      "channel_url": null,
      "connection_status": "PENDING",
      "publish_events_enabled": false,
      "last_validated_at": null,
      "last_publish_at": null
    }
  ]
}
```

### `PATCH /api/v1/teams/:team_id/social-connections/:platform`

Atualiza os dados públicos e preferências da conexão do time para uma plataforma.

#### Request

```json
{
  "handle": "@ajaxdaleste",
  "channel_url": "https://instagram.com/ajaxdaleste",
  "publish_events_enabled": true
}
```

#### Regras

- Endpoint exige sessão autenticada.
- Exige permissão de gestão do time.
- `platform` deve aceitar:
  - `YOUTUBE`
  - `INSTAGRAM`
  - `TIKTOK`
- O patch é parcial.
- `handle` e `channel_url` podem ser preenchidos mesmo sem OAuth completo.
- `publish_events_enabled = true` só deve ser aceito quando a conexão estiver `CONNECTED`.
- No estado atual do produto, prefira rejeitar com erro explícito quando a conexão ainda não estiver válida.

### `POST /api/v1/teams/:team_id/social-connections/:platform/connect/start`

Inicia a conexão real com a plataforma.

#### Request

```json
{
  "redirect_uri": "futstats://team-social-callback"
}
```

#### Response 200

```json
{
  "platform": "INSTAGRAM",
  "authorization_url": "https://provider.example.com/oauth/authorize?..."
}
```

### `POST /api/v1/teams/:team_id/social-connections/:platform/connect/complete`

Conclui a conexão após o callback do provedor.

#### Request

```json
{
  "authorization_code": "provider-code",
  "redirect_uri": "futstats://team-social-callback"
}
```

#### Response 200

```json
{
  "connection": {
    "platform": "INSTAGRAM",
    "handle": "@ajaxdaleste",
    "channel_url": "https://instagram.com/ajaxdaleste",
    "connection_status": "CONNECTED",
    "publish_events_enabled": false,
    "last_validated_at": "2026-07-08T13:00:00Z"
  }
}
```

#### Regras

- Endpoint exige sessão autenticada.
- Exige permissão de gestão do time.
- Ao concluir:
  - grava `external_account_id`
  - grava referências seguras de token
  - grava `token_expires_at`, quando houver
  - atualiza `connection_status = CONNECTED`
  - atualiza `last_validated_at`
- O backend não deve persistir token em texto puro na tabela principal.

### `POST /api/v1/teams/:team_id/social-connections/:platform/disconnect`

Desconecta a plataforma do time.

#### Regras

- Endpoint exige sessão autenticada.
- Exige permissão de gestão do time.
- Deve invalidar ou remover a credencial vinculada.
- Deve atualizar `connection_status = REVOKED`.
- Deve forçar `publish_events_enabled = false`.
- Não precisa apagar `handle` e `channel_url` automaticamente.

### `POST /api/v1/teams/:team_id/social-connections/:platform/validate`

Revalida a conexão e tenta atualizar o status.

#### Regras

- Endpoint exige sessão autenticada.
- Exige permissão de gestão do time.
- Pode tentar refresh de credencial quando aplicável.
- Pode atualizar status para:
  - `CONNECTED`
  - `EXPIRED`
  - `ERROR`
- Deve atualizar `last_validated_at`.

### `POST /api/v1/posts/:post_id/distribution/:platform/retry`

Solicita retry manual da distribuição externa de um post já existente no app.

#### Regras

- Endpoint exige sessão autenticada.
- Exige permissão de gestão do time dono do `post`.
- Só pode ser usado quando já existir tentativa anterior da mesma plataforma para o `post`.
- A tentativa anterior mais recente deve estar em `FAILED`.
- Retry manual não recria o `post` no app.
- Retry manual cria nova linha operacional em `post_distribution_attempts`.
- A nova linha deve usar:
  - `trigger_source = MANUAL_RETRY`
  - `attempt_number` incrementado
- O endpoint deve recusar retry manual quando o problema exigir outra ação primeiro, como:
  - conexão revogada;
  - conexão inexistente;
  - token expirado sem refresh possível;
  - permissão insuficiente;
  - plataforma com publicação desativada.
- Nesses casos, a API deve devolver erro explícito para orientar a UI a usar:
  - `Reconectar conta`; ou
  - `Validar conexão`; ou
  - `Ativar publicação`.
- O endpoint pode aceitar retry manual mesmo após o limite de retry automático, desde que a causa seja compatível.
- O endpoint não deve permitir duplicar várias filas manuais concorrentes para o mesmo `post` e plataforma ao mesmo tempo.

#### Response 202

```json
{
  "post_id": "uuid-post",
  "platform": "INSTAGRAM",
  "retry_accepted": true,
  "attempt": {
    "id": "uuid-attempt",
    "attempt_number": 4,
    "status": "QUEUED",
    "trigger_source": "MANUAL_RETRY",
    "queued_at": "2026-07-09T18:00:00Z"
  }
}
```

#### Erros conceituais

- `POST_DISTRIBUTION_RETRY_NOT_ALLOWED`
- `POST_DISTRIBUTION_ALREADY_IN_PROGRESS`
- `SOCIAL_CONNECTION_RECONNECT_REQUIRED`
- `SOCIAL_CONNECTION_VALIDATION_REQUIRED`
- `SOCIAL_PUBLISH_DISABLED`

## Aprovação de solicitação de entrada

### `POST /api/v1/teams/:team_id/join-requests`

Cria uma solicitação de entrada para a própria pessoa autenticada no time informado.

#### Request

```json
{
  "source_context": "START_PATH_SELECTION"
}
```

#### Campos

- `source_context` opcional

#### Regras

- Endpoint exige sessão autenticada.
- A solicitação sempre pertence à própria pessoa autenticada.
- O `team_id` vem da rota.
- O backend não deve aceitar criação de solicitação em nome de outra pessoa neste endpoint.
- Antes de criar, o backend deve validar:
  - se o time existe;
  - se a pessoa autenticada já possui vínculo ativo com o time;
  - se já existe solicitação `PENDING` para o mesmo par `requester_user_id` + `team_id`.
- Se a pessoa já fizer parte do time:
  - a criação deve ser bloqueada.
- Se já existir solicitação `PENDING`:
  - a criação deve ser bloqueada.
- Solicitações antigas `REJECTED` ou `CANCELLED` não impedem nova solicitação futura, salvo regra posterior de produto.
- `source_context` pode ajudar auditoria e produto a entender de onde veio a intenção inicial.
- Valores iniciais de `source_context`:
  - `START_PATH_SELECTION`
  - `TEAM_DISCOVERY`
  - `TEAM_PROFILE`
  - `OTHER`
- Ao criar:
  - grava `requester_user_id`;
  - grava `team_id`;
  - grava `status = PENDING`;
  - grava `requested_at`;
  - grava `source_context`, quando informado.
- Após a criação bem-sucedida, o backend deve disparar o evento de domínio `TeamJoinRequestCreated`.
- A partir desse evento, o sistema deve gerar notificação in-app para a gestão do time.
- No estado atual do produto, a notificação deve ser direcionada a integrantes com `DIRECTOR` ou `PRESIDENT`.
- Falha de notificação não deve desfazer a criação da solicitação.
- Esta rota não cria:
  - `user_team_roles`;
  - vínculo esportivo;
  - entrada no elenco;
  - follow automático.

#### Response 201

```json
{
  "join_request": {
    "id": "uuid-request",
    "team_id": "uuid-team",
    "requester_user_id": "uuid-user",
    "status": "PENDING",
    "requested_at": "2026-07-09T14:00:00Z",
    "source_context": "START_PATH_SELECTION"
  },
  "team_summary": {
    "team_id": "uuid-team",
    "name": "Ajax da Leste",
    "crest_url": "https://cdn.example.com/teams/ajax.png"
  }
}
```

#### Erros conceituais

- `TEAM_NOT_FOUND`
- `TEAM_JOIN_REQUEST_ALREADY_PENDING`
- `TEAM_MEMBER_ALREADY_EXISTS`

### `POST /api/v1/teams/:team_id/join-requests/:request_id/approve`

Aprova a solicitação e resolve, na mesma transação, a função inicial da pessoa dentro do time.

#### Request

```json
{
  "approved_membership_mode": "PLAYER_DIRECTOR",
  "player_link_resolution": {
    "mode": "LINK_TO_EXISTING_TEAM_PLAYER",
    "source_team_player_id": "uuid-team-player"
  },
  "event": {
    "create": true,
    "type": "PLAYER_WELCOME",
    "distribution": {
      "external_mode": "TEAM_DEFAULTS"
    }
  }
}
```

#### Campos

- `approved_membership_mode` obrigatório
- `player_link_resolution` opcional
- `event` opcional

#### Estrutura de `player_link_resolution`

```json
{
  "mode": "LINK_TO_EXISTING_TEAM_PLAYER",
  "source_team_player_id": "uuid-team-player"
}
```

#### Campos de `player_link_resolution`

- `mode` (enum `join_request_player_link_mode`, obrigatório quando o objeto existir)
- `source_team_player_id` (uuid, obrigatório quando `mode = LINK_TO_EXISTING_TEAM_PLAYER`)

#### Enums iniciais de `join_request_player_link_mode`

- `CREATE_OR_REUSE_REQUESTER_PLAYER`
- `LINK_TO_EXISTING_TEAM_PLAYER`

#### Estrutura de `event`

- `create` (boolean, obrigatório quando o objeto existir)
- `type` (enum `team_event_type`, obrigatório quando `create = true`)
- `title` (text, opcional para tipos futuros)
- `description` (text, opcional para tipos futuros)
- `metadata` (jsonb/object, opcional)
- `distribution` (object, opcional)

#### Estrutura de `event.distribution`

```json
{
  "external_mode": "TEAM_DEFAULTS",
  "platforms": ["INSTAGRAM", "TIKTOK"]
}
```

#### Campos de `event.distribution`

- `external_mode` (enum `event_external_distribution_mode`, obrigatório quando `distribution` existir)
- `platforms` (array de `social_platform`, opcional)

#### Enums iniciais de `event_external_distribution_mode`

- `NONE`
- `TEAM_DEFAULTS`
- `SELECTED`

#### Regras de `event.distribution`

- O evento social nasce primeiro no app.
- `distribution` controla apenas distribuição externa.
- Se `distribution` não for enviado:
  - o evento continua existindo no app;
  - a distribuição externa usa comportamento equivalente a `NONE`, salvo regra explícita futura de produto.
- `external_mode = NONE`
  - não tenta publicar em plataformas externas
- `external_mode = TEAM_DEFAULTS`
  - tenta publicar nas plataformas do time que atendam simultaneamente:
    - `connection_status = CONNECTED`
    - `publish_events_enabled = true`
    - preferência global do time compatível com publicação de eventos
- `external_mode = SELECTED`
  - exige `platforms`
  - tenta publicar apenas nas plataformas informadas
  - cada plataforma selecionada precisa estar `CONNECTED`
- Se uma plataforma for selecionada, mas não estiver apta para publicação, ela deve ser marcada como recusada ou ignorada com motivo explícito no resultado.

#### Valores válidos de `approved_membership_mode`

- `PLAYER`
- `COMMITTEE`
- `DIRECTOR`
- `PRESIDENT`
- `PLAYER_DIRECTOR`
- `PLAYER_PRESIDENT`

#### Enums iniciais de `team_event_type`

- `PLAYER_WELCOME`

#### Regras

- Endpoint exige sessão autenticada.
- A pessoa autenticada precisa ter permissão de gestão no time.
- A `join_request` deve existir, estar em `PENDING` e pertencer ao `team_id` informado na rota.
- A aprovação deve ser transacional para:
  - atualizar `team_join_requests.status = APPROVED`
  - gravar `approved_membership_mode`
  - gravar `responded_at`
  - gravar `responded_by_user_id`
  - criar ou reativar os vínculos derivados conforme o modo aprovado
  - criar o post interno do evento, quando `event.create = true`
- Regras de resolução:
  - `PLAYER`
    - cria ou reativa vínculo esportivo
    - não cria `user_team_roles`
  - `COMMITTEE`
    - cria `user_team_roles.role = COMMITTEE`
  - `DIRECTOR`
    - cria `user_team_roles.role = DIRECTOR`
  - `PRESIDENT`
    - cria `user_team_roles.role = PRESIDENT`
  - `PLAYER_DIRECTOR`
    - cria ou reativa vínculo esportivo
    - cria `user_team_roles.role = DIRECTOR`
  - `PLAYER_PRESIDENT`
    - cria ou reativa vínculo esportivo
    - cria `user_team_roles.role = PRESIDENT`
- Resolução de `player_link_resolution`:
  - `CREATE_OR_REUSE_REQUESTER_PLAYER`
    - garante que a `person` do usuário solicitante tenha um `player` canônico;
    - usa esse `player` como destino da aprovação.
  - `LINK_TO_EXISTING_TEAM_PLAYER`
    - só pode ser usado quando o modo aprovado incluir `PLAYER`;
    - `source_team_player_id` deve pertencer ao mesmo `team_id` da rota;
    - a linha apontada deve representar um atleta operacional pré-existente do time;
    - o sistema deve garantir ou criar o `player` canônico da `person` do usuário solicitante;
    - o sistema deve garantir ou criar o `team_member` canônico da pessoa solicitante naquele time;
    - o sistema deve executar merge operacional da origem para o destino canônico.
- O merge operacional deve:
  - localizar o `source_team_member_id` vinculado ao `source_team_player_id`;
  - localizar ou criar o `target_team_member_id` da pessoa solicitante no mesmo time;
  - consolidar o vínculo esportivo oficial do time em favor do `target_team_member_id`;
  - reatribuir fatos históricos baseados em `player_id` para o `player` canônico;
  - reapontar histórico contextual do time quando ele depender do integrante operacional de origem;
  - preservar histórico prévio do `player` canônico;
  - resolver conflitos de unicidade antes do commit;
  - reconstruir leituras derivadas do atleta ao final.
- Tabelas operacionais que devem ser consideradas no merge esportivo e na consolidação contextual:
  - `team_members`, quando houver contexto operacional de origem no time
  - `team_players`
  - `match_players`
  - `match_goals.player_id`
  - `match_goals.assist_player_id`
  - `match_ratings.target_match_player_id`, quando a nota estiver amarrada à atuação específica da partida
  - `match_ratings.target_player_id`, para agregações e leituras derivadas por atleta
  - `player_modalities`
  - `player_positions`
- Tabelas de projeção do perfil do atleta não devem ser atualizadas manualmente linha a linha nesse fluxo:
  - elas devem ser reconstruídas a partir dos fatos operacionais após o merge.
- Se houver conflito em `match_players` por já existir, na mesma partida e no mesmo time, uma linha para o `player` de destino:
  - a API deve consolidar o contexto no nível de `match_players`;
  - reapontar dependências por `match_player_id`;
  - e só então remover ou inutilizar a origem redundante.
- Se houver notas da partida ligadas ao atleta operacional:
  - a API deve manter a coerência entre `match_ratings.target_match_player_id` e `match_ratings.target_player_id`;
  - se a consolidação alterar a linha contextual de `match_players`, as notas dependentes também devem ser reapontadas antes da remoção da origem.
- Se houver conflito em `team_members` por a pessoa solicitante já possuir integrante ativo no mesmo time:
  - o sistema deve consolidar o contexto no nível de `team_member`;
  - reapontar vínculos esportivos e históricos contextuais para o integrante canônico;
  - e só então remover ou inutilizar a origem contextual redundante.
- A solicitação só pode ser resolvida uma única vez.
- A primeira ação válida de gestão consome a pendência.
- Se outra pessoa gestora tentar agir depois da resolução:
  - a API não deve aprovar novamente;
  - a API não deve rejeitar novamente;
  - a API deve devolver o estado atual já resolvido, em modo somente leitura para a UI.
- A resposta de leitura deve permitir informar:
  - status final;
  - quem respondeu;
  - quando respondeu;
  - qual função foi definida, quando aplicável.
- Após aprovação bem-sucedida, o backend deve gerar notificação para a pessoa solicitante.
- A mensagem para a pessoa solicitante deve ser baseada em `approved_membership_mode`.
- A aprovação também deve tornar obsoletas as notificações operacionais pendentes da gestão para aquela mesma `join_request`.

#### Regra do objeto `event`

- `event.create = false` significa não publicar evento social.
- Se `event` não for enviado, a aprovação continua normal sem evento.
- `event.type = PLAYER_WELCOME` só pode produzir efeito quando:
  - o modo aprovado incluir jogador; e
  - a pessoa aprovada for `user` real da plataforma.
- `PLAYER_WELCOME`:
  - nasce como conteúdo social automático do time;
  - pode usar banner/template pré-configurado;
  - deve aceitar comentários para iniciar a resenha;
  - pode gerar notificação in-app e push para integrantes do time e seguidores do time.

#### Regra de falha na distribuição externa

- Falha de publicação em rede externa não deve desfazer:
  - a aprovação da solicitação;
  - os vínculos persistidos;
  - o post interno no app.
- A distribuição externa deve ser tratada como efeito derivado controlado.
- O resultado por plataforma deve indicar status como:
  - `QUEUED`
  - `PUBLISHED`
  - `SKIPPED`
  - `FAILED`

#### Mensagens conceituais para a pessoa solicitante

- `PLAYER`
  - `Parabéns, Lucas! Você é o novo jogador do União de Artur Alvim.`
- `COMMITTEE`
  - `Parabéns, Bruno! Você é o novo integrante da comissão do União de Artur Alvim.`
- `DIRECTOR`
  - `Parabéns, Carlos! Você agora faz parte da diretoria do União de Artur Alvim.`
- `PRESIDENT`
  - `Parabéns, André! Você agora faz parte da presidência do União de Artur Alvim.`
- `PLAYER_DIRECTOR`
  - `Parabéns! Você agora faz parte da diretoria e do elenco do União de Artur Alvim.`
- `PLAYER_PRESIDENT`
  - `Parabéns! Você agora faz parte da presidência e do elenco do União de Artur Alvim.`

#### Response 200

```json
{
  "join_request": {
    "id": "uuid-request",
    "status": "APPROVED",
    "approved_membership_mode": "PLAYER_DIRECTOR",
    "responded_at": "2026-07-08T15:00:00Z",
    "responded_by_user_id": "uuid-manager"
  },
  "membership_result": {
    "team_id": "uuid-team",
    "created_team_role": "DIRECTOR",
    "created_player_membership": true,
    "player_resolution": {
      "mode": "LINK_TO_EXISTING_TEAM_PLAYER",
      "target_player_id": "uuid-player-lucas",
      "source_player_id": "uuid-operational-player",
      "merge_executed": true
    }
  },
  "event_result": {
    "created": true,
    "type": "PLAYER_WELCOME",
    "post_id": "uuid-post",
    "distribution": {
      "external_mode": "TEAM_DEFAULTS",
      "platform_results": [
        {
          "platform": "INSTAGRAM",
          "status": "QUEUED"
        },
        {
          "platform": "TIKTOK",
          "status": "SKIPPED",
          "reason": "PLATFORM_NOT_CONNECTED"
        }
      ]
    }
  }
}
```

### `POST /api/v1/teams/:team_id/join-requests/:request_id/reject`

Rejeita a solicitação de entrada.

#### Request

```json
{
  "reason": "optional text"
}
```

#### Regras

- Endpoint exige sessão autenticada.
- A pessoa autenticada precisa ter permissão de gestão no time.
- A `join_request` deve existir, estar em `PENDING` e pertencer ao `team_id` informado na rota.
- A solicitação só pode ser rejeitada uma única vez.
- A primeira ação válida de gestão consome a pendência.
- Se outra pessoa gestora tentar agir depois da resolução:
  - a API não deve rejeitar novamente;
  - a API não deve aprovar a mesma solicitação por esta rota;
  - a API deve devolver o estado atual já resolvido, em modo somente leitura para a UI.
- A rejeição deve gravar:
  - `status = REJECTED`
  - `responded_at`
  - `responded_by_user_id`
  - `rejection_reason`, quando enviada
- Após rejeição bem-sucedida, o backend deve gerar notificação para a pessoa solicitante.
- A mensagem da pessoa solicitante deve ser neutra e não deve expor quem rejeitou.
- A rejeição também deve tornar obsoletas as notificações operacionais pendentes da gestão para aquela mesma `join_request`.

#### Mensagens conceituais para a pessoa solicitante

- `Sua solicitação para entrar no União de Artur Alvim não foi aprovada.`
- `O time não aprovou sua solicitação de entrada neste momento.`

### `POST /api/v1/teams/:team_id/join-requests/:request_id/cancel`

Cancela a solicitação pela própria pessoa solicitante enquanto ainda estiver pendente.

## Regras gerais

- Criação rápida deve exigir apenas nome do time.
- Configurações avançadas são opcionais.
- Permissões dependem do papel contextual da pessoa no time.
- Publicação simultânea em redes sociais depende de conexões válidas do time e de decisão explícita do evento.
- Notificações operacionais devem nascer de eventos de domínio e não bloquear a conclusão da ação principal.
