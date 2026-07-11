---
title: Players API
status: Draft
version: 1.1.0
owner: Product Architecture
last_update: 2026-07-10
related_documents:
  - ./Statistics_API.md
  - ../Domain/Players.md
  - ../Frontend/Screens/Player_Profile.md
  - ../Implementation/Database/Table_Spec_players.md
  - ../Implementation/Database/Table_Spec_person_social_connections.md
  - ../Implementation/Database/Table_Spec_player_match_statistics.md
  - ../Implementation/Database/Table_Spec_player_gallery_items.md
---

# Players API

Endpoints de atletas e perfis esportivos.

```text
POST /api/v1/players
GET /api/v1/players/:playerId
PATCH /api/v1/players/:playerId
POST /api/v1/players/:playerId/claim
GET /api/v1/players/:playerId/statistics
GET /api/v1/players/:playerId/timeline
GET /api/v1/players/:playerId/gallery
PATCH /api/v1/players/:playerId/social-connections
```

## Objetivo

Definir o contrato de leitura e manutenção do perfil esportivo do atleta, preservando a separação entre:

- identidade-base da pessoa;
- perfil esportivo declarado;
- histórico factual do app.

## GET /api/v1/players/:playerId

Retorna o perfil de leitura do atleta.

### Resposta conceitual

```json
{
  "player": {
    "id": "uuid",
    "profile_completeness_status": "INCOMPLETE",
    "dominant_foot": "RIGHT",
    "birth_date": null,
    "height_cm": null,
    "weight_kg": null
  },
  "person": {
    "id": "uuid",
    "nickname": "Marcio",
    "full_name": "Marcio Silva",
    "avatar_url": "https://...",
    "social_connections": [
      {
        "platform": "INSTAGRAM",
        "handle": "@marcio",
        "channel_url": "https://instagram.com/marcio",
        "display_order": 0
      }
    ]
  },
  "declared_profile": {
    "modalities": [
      {
        "modality": "FUTSAL",
        "positions": [
          { "code": "FIXO", "label": "Fixo" },
          { "code": "ALA_ESQUERDO", "label": "Ala esquerdo" }
        ]
      }
    ]
  },
  "active_teams": [
    {
      "team_id": "uuid",
      "name": "Uniao de Artur Alvim",
      "crest_url": "https://..."
    }
  ],
  "statistics_overview": {
    "matches": 0,
    "goals": 0
  },
  "inferred_play_style": {
    "style": "OFFENSIVE",
    "scope": "FUTSAL",
    "confidence": "MEDIUM"
  },
  "performance_timeline": {
    "available": true,
    "series": []
  },
  "historical_positions_by_modality": [
    {
      "modality": "FUTSAL",
      "positions": [
        { "code": "FIXO", "matches_count": 12 },
        { "code": "ALA_ESQUERDO", "matches_count": 5 }
      ]
    }
  ],
  "recent_matches": [],
  "permissions": {
    "can_edit": false,
    "can_claim": false,
    "can_complete_profile": false
  }
}
```

### Regras

- `person.nickname` é o principal texto visual do cabeçalho.
- `person.avatar_url` é leitura derivada para consumo da UI; a origem canônica da mídia da pessoa continua sendo `persons.avatar_media_id`.
- `declared_profile` é derivado de `player_modalities` + `player_positions` + `modality_positions`.
- `historical_positions_by_modality` vem de histórico factual do app e não deve sobrescrever o declarado.
- `person.social_connections` vem de `person_social_connections` e pertence à pessoa, não ao `player`.
- na leitura pública do perfil, esse bloco já deve vir filtrado para conexões com `is_visible = true`.
- na leitura pública, `person.social_connections` deve expor apenas o necessário para renderização:
  - `platform`
  - `handle`
  - `channel_url`
  - `display_order`
- a resposta deve vir ordenada por `display_order asc`, com fallback estável por plataforma quando necessário.
- `is_visible` e `connection_status` não precisam ser expostos no `GET /api/v1/players/:playerId` público quando a lista já vier filtrada.
- `active_teams` deve considerar apenas vínculos ativos em `team_players`.
- `permissions` depende de dono do perfil, claim e visibilidade.
- `inferred_play_style` é leitura derivada e contextual, nunca classificação fixa do atleta.
- `performance_timeline` representa leitura visual/temporal para a UI e pode variar conforme contexto geral, modalidade e time.

## PATCH /api/v1/players/:playerId

Atualiza dados do perfil esportivo declarado do atleta.

### Escopo do patch

- `person.full_name`
- `person.nickname`
- `person.avatar_upload_token`
- `dominant_foot`
- `birth_date`
- `height_cm`
- `weight_kg`
- modalidades declaradas
- posições declaradas

### Payload conceitual

```json
{
  "person": {
    "full_name": "Marcio Silva",
    "nickname": "Marcio",
    "avatar_upload_token": "temp_token_optional"
  },
  "player": {
    "dominant_foot": "RIGHT",
    "birth_date": "1990-01-01",
    "height_cm": 180,
    "weight_kg": 82.5
  },
  "declared_profile": {
    "modalities": [
      {
        "modality": "FUTSAL",
        "positions": ["FIXO", "ALA_ESQUERDO"]
      }
    ]
  }
}
```

### Não pertence a este patch

- histórico de partidas;
- posições jogadas em partida;
- estatísticas calculadas;
- vínculo oficial com time.
- links sociais da pessoa em patch dedicado.

### Regras

- `person.nickname` é obrigatório na persistência final.
- `person.full_name` é opcional.
- `person.avatar_upload_token`, quando enviado, deve promover mídia temporária compatível com avatar.
- o backend deve sincronizar `player_modalities` e `player_positions` com base em `declared_profile`.
- o backend deve recalcular `player.profile_completeness_status` ao fim do patch.

## PATCH /api/v1/players/:playerId/social-connections

Atualiza as redes sociais públicas da pessoa vinculada ao atleta.

### Regra de fronteira

- a borda continua sendo o perfil do atleta, porque este é o fluxo de edição atual da UI;
- a persistência real acontece em `person_social_connections`;
- o dono conceitual dessas redes é `person`, não `player`.

### Payload conceitual

```json
{
  "social_connections": [
    {
      "platform": "INSTAGRAM",
      "handle": "@marcio",
      "channel_url": "https://instagram.com/marcio",
      "is_visible": true,
      "display_order": 0
    },
    {
      "platform": "YOUTUBE",
      "handle": "@marciotv",
      "channel_url": "https://youtube.com/@marciotv",
      "is_visible": true,
      "display_order": 1
    }
  ]
}
```

### Regras

- deve aceitar substituição do conjunto final suportado pela pessoa no estado atual;
- cada `platform` pode aparecer no máximo uma vez;
- cada item deve conter ao menos `handle` ou `channel_url`;
- o backend deve validar formato e domínio compatível com a plataforma;
- o backend pode manter `connection_status` em `PENDING` quando existir apenas identidade pública sem conexão real;
- o backend não deve misturar este patch com galerias ou mídia publicada pelo time.

## POST /api/v1/players/:playerId/claim

Inicia ou confirma o processo de reivindicação de um perfil de atleta por um usuário autenticado.

Regra:

- o claim nunca pode apagar ou reiniciar histórico esportivo existente.
- o `player` canônico do usuário deve ser preservado como destino final do histórico consolidado.
- quando existir um `player` operacional criado por time para a mesma pessoa, o claim pode disparar merge para o `player` canônico.
- quando o merge vier de um contexto de time, ele também pode exigir consolidação do vínculo contextual daquele time.

### Payload conceitual

```json
{
  "claim_mode": "MERGE_OPERATIONAL_PLAYER",
  "source_player_id": "uuid-operational-player"
}
```

### Modos iniciais

- `CLAIM_ONLY`
- `MERGE_OPERATIONAL_PLAYER`

### Regras de merge

- `MERGE_OPERATIONAL_PLAYER` exige usuário autenticado e `player` canônico de destino identificado.
- `source_player_id` representa o `player` operacional que será consolidado no destino.
- quando a origem vier de um atleta operacional criado por time, o merge deve considerar duas camadas:
  - camada esportiva global (`player`);
  - camada contextual do time (`team_member` e `team_player`).
- O sistema deve reatribuir fatos operacionais da origem para o destino, em vez de somar manualmente projeções.
- O sistema deve preservar o histórico anterior já existente no destino.
- O sistema deve tratar conflitos de unicidade e duplicidade antes de concluir a operação.
- O sistema deve reconstruir projeções derivadas do atleta consolidado após o merge.

### Tabelas operacionais mínimas afetadas

- `team_members`, quando houver contexto de time na origem
- `team_players`
- `match_players`
- `match_goals.player_id`
- `match_goals.assist_player_id`
- `match_attendance_responses`, quando a origem contextual ainda apontar para `team_member` operacional
- `match_ratings.target_match_player_id`, quando a nota estiver amarrada à atuação específica da partida
- `match_ratings.target_player_id`, para agregações e leituras derivadas por atleta
- `player_modalities`
- `player_positions`

### Regra de consolidação contextual no time

- se o merge vier de um atleta operacional já vinculado a um time:
  - o backend deve identificar o `source_team_member_id` ligado à origem operacional;
  - o backend deve identificar ou criar o `target_team_member_id` da pessoa real naquele mesmo time;
  - o backend deve consolidar o vínculo esportivo do time em favor do `target_team_member_id`;
  - depois da consolidação e do reapontamento do histórico útil, o `integrante de origem do time (source_team_member)` não precisa ser preservado como registro operacional separado;
  - o backend pode remover ou inutilizar definitivamente o `source_team_member_id`, desde que a trilha auditável da operação permaneça preservada fora dele.
- quando existir histórico contextual do time ligado ao `source_team_member_id`, como presença em compromissos:
  - esse histórico deve ser reapontado para o `target_team_member_id`, quando a semântica indicar que se trata da mesma pessoa.
- quando existir histórico de notas ligado ao atleta operacional:
  - o backend deve preservar a coerência entre a atuação contextual da partida (`target_match_player_id`) e a agregação por atleta (`target_player_id`);
  - se houver consolidação de linhas em `match_players`, as dependências de `match_ratings` também devem ser reapontadas antes da inutilização da origem.

### Regras de segurança

- o merge nunca pode unir atletas de pessoas diferentes sem decisão explícita e contextual da gestão;
- a origem operacional precisa ser compatível com o contexto do vínculo sendo reivindicado;
- o backend deve registrar trilha auditável da operação;
- projeções como `player_statistics_summary` e `player_profile_summary` devem ser reconstruídas, não editadas manualmente.

### Response conceitual

```json
{
  "player_id": "uuid-player-lucas",
  "claim_mode": "MERGE_OPERATIONAL_PLAYER",
  "merge_result": {
    "source_player_id": "uuid-operational-player",
    "target_player_id": "uuid-player-lucas",
    "reassigned_records": true,
    "projections_rebuild_enqueued": true
  }
}
```

## GET /api/v1/players/:playerId/timeline

Retorna a timeline narrativa do atleta em ordem cronológica reversa.

## Objetivo da timeline

Mostrar fatos relevantes da trajetória do atleta dentro do FUTSTATS sem misturar isso com estatística agregada.

Ela deve responder coisas como:

- quando entrou em um time;
- em quais partidas apareceu recentemente;
- quando foi apresentado em evento social do time;
- quais mudanças ou marcos merecem aparecer no perfil.

## Resposta conceitual

```json
{
  "player_id": "uuid",
  "items": [
    {
      "id": "timeline_item_1",
      "type": "TEAM_JOINED",
      "occurred_at": "2026-07-09T10:00:00Z",
      "team": {
        "team_id": "uuid",
        "name": "Uniao de Artur Alvim",
        "crest_url": "https://..."
      },
      "summary": {
        "title": "Entrou no Uniao de Artur Alvim",
        "subtitle": "Agora faz parte do elenco"
      },
      "related": {
        "team_join_request_id": "uuid"
      }
    },
    {
      "id": "timeline_item_2",
      "type": "PLAYER_WELCOME_POST",
      "occurred_at": "2026-07-09T10:05:00Z",
      "team": {
        "team_id": "uuid",
        "name": "Uniao de Artur Alvim"
      },
      "summary": {
        "title": "Foi apresentado pelo time",
        "subtitle": "Post de boas-vindas publicado"
      },
      "related": {
        "post_id": "uuid"
      }
    },
    {
      "id": "timeline_item_3",
      "type": "MATCH_APPEARANCE",
      "occurred_at": "2026-07-12T16:30:00Z",
      "team": {
        "team_id": "uuid",
        "name": "Uniao de Artur Alvim"
      },
      "match": {
        "match_id": "uuid",
        "modality": "FUTSAL",
        "opponent_name": "Ajax da Leste"
      },
      "summary": {
        "title": "Participou de uma partida",
        "subtitle": "Futsal contra Ajax da Leste"
      },
      "related": {
        "match_player_id": "uuid"
      }
    }
  ],
  "pagination": {
    "next_cursor": null
  }
}
```

## Tipos iniciais

- `TEAM_JOINED`
- `PLAYER_WELCOME_POST`
- `MATCH_APPEARANCE`
- `PROFILE_CLAIMED`

## Fontes iniciais

- aprovação efetiva com vínculo em `team_players`;
- posts `TEAM_EVENT` com `metadata.event_type = PLAYER_WELCOME`;
- participações em `match_players`;
- reivindicação de perfil, quando aplicável.

## Regras

- a timeline deve ser ordenada por `occurred_at` desc;
- um item da timeline não substitui o conteúdo completo da entidade relacionada;
- a timeline deve trazer resumo renderizável e também referências técnicas para navegação;
- `MATCH_APPEARANCE` representa presença/relacionamento em partida, não estatística agregada;
- se um evento não tiver valor narrativo para o perfil, ele não deve entrar na timeline do atleta;
- o endpoint deve ser paginado por cursor.

## GET /api/v1/players/:playerId/gallery

Retorna a galeria social do atleta.

## Query params conceituais

- `scope`
  - `GENERAL`
  - `MODALITY`
  - `TEAM`
- `modality`
  - `FUTSAL`
  - `FIELD`
  - `SOCIETY`
- `team_id`
- `cursor`
- `limit`

## Resposta conceitual

```json
{
  "player_id": "uuid",
  "scope": {
    "type": "MODALITY",
    "modality": "FUTSAL",
    "team_id": null
  },
  "items": [
    {
      "id": "uuid",
      "platform": "INSTAGRAM",
      "source_url": "https://...",
      "embed_status": "EMBEDDABLE",
      "thumbnail_url": "https://...",
      "team": {
        "team_id": "uuid",
        "name": "Uniao de Artur Alvim"
      },
      "context": {
        "match_id": "uuid",
        "modality": "FUTSAL",
        "linked_goal_id": "uuid"
      },
      "published_at": "2026-07-10T19:00:00Z"
    }
  ],
  "pagination": {
    "next_cursor": null
  }
}
```

## Regras

- a galeria geral mostra tudo por ordem de publicação mais recente;
- a galeria por modalidade mostra apenas itens daquela modalidade;
- a galeria por time mostra apenas itens daquele time;
- itens podem ser `EMBEDDABLE`, `LINK_ONLY` ou `UNAVAILABLE`;
- o FUTSTATS guarda referência ao conteúdo, não o vídeo bruto da plataforma.

## Regras centrais

1. O uso casual nunca deve ser bloqueado por recursos avançados.
2. Dados técnicos devem ser persistidos com nomenclatura em inglês.
3. A experiência exibida ao usuário pode variar por tema, linguagem e contexto.
4. Histórico e legado são consequências do uso recorrente, não barreiras de entrada.
5. Toda regra deve preservar a integridade histórica de partidas, atletas e times.

## Critérios de aceite

- O recurso entrega valor sem exigir preenchimento excessivo.
- Casos simples e avançados estão contemplados.
- Há separação entre dado canônico e apresentação.
- Há rastreabilidade de decisões quando impactar histórico.
