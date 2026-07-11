---
title: Endpoint Detail Teams
status: Draft
version: 1.6.0
owner: Product Architecture
last_update: 2026-07-10
related_documents:
  - ../../API/Teams_API.md
  - ../../API/Scheduled_Matches_API.md
  - ../../Implementation/Database/Table_Spec_teams.md
  - ../../Implementation/Database/Table_Spec_team_members.md
  - ../../Implementation/Database/Table_Spec_team_join_requests.md
  - ../../Implementation/Database/Table_Spec_team_social_connections.md
---

# Endpoint Detail Teams

## Objetivo

Detalhar endpoints de times.

Este documento nao cobre agenda de jogos, liberacao para o time nem presenca.

Esses comportamentos pertencem a `Endpoint_Detail_Scheduled_Matches.md`.

## Endpoints

```http
POST /api/v1/teams
GET /api/v1/teams/search
GET /api/v1/teams/{teamId}
PATCH /api/v1/teams/{teamId}
GET /api/v1/teams/{teamId}/members
PATCH /api/v1/teams/{teamId}/settings
GET /api/v1/teams/{teamId}/social-connections
PATCH /api/v1/teams/{teamId}/social-connections/{platform}
POST /api/v1/teams/{teamId}/social-connections/{platform}/connect/start
POST /api/v1/teams/{teamId}/social-connections/{platform}/connect/complete
POST /api/v1/teams/{teamId}/social-connections/{platform}/disconnect
POST /api/v1/teams/{teamId}/social-connections/{platform}/validate
GET /api/v1/teams/{teamId}/join-requests
POST /api/v1/teams/{teamId}/join-requests
POST /api/v1/teams/{teamId}/join-requests/{requestId}/approve
POST /api/v1/teams/{teamId}/join-requests/{requestId}/reject
POST /api/v1/teams/{teamId}/join-requests/{requestId}/cancel
```

## Regras

- criacao deve aceitar apenas nome como minimo obrigatorio;
- dados avancados continuam opcionais no fluxo de criacao;
- o time so deve ser persistido ao concluir o wizard;
- criar time deve criar:
  - o `team`;
  - o `team_member` canonico da pessoa fundadora;
  - o vinculo de gestao em `user_team_roles` com `DIRECTOR`;
- `crest_upload_token` deve referenciar upload temporario previamente concluido;
- o backend deve validar propriedade, expiracao, proposito, status e consumo do token antes de promover o escudo;
- o token deve ser consumido uma unica vez no momento da criacao do time;
- se a promocao do escudo falhar, o backend nao deve deixar o time apontando para midia invalida;
- handles publicos de YouTube, Instagram e TikTok podem nascer ja no fluxo de criacao, mas a conexao real da plataforma deve ser tratada em contrato especifico;
- permissoes dependem do papel contextual da pessoa;
- aprovacao de `join_request` deve ser acao de dominio explicita, nao simples patch de status;
- a aprovacao deve resolver a funcao inicial da pessoa no time na mesma transacao;
- o backend deve validar `approved_membership_mode` e impedir combinacoes invalidas;
- o evento social ligado a aprovacao deve ser modelado como objeto generico `event`;
- `PLAYER_WELCOME` e apenas o primeiro tipo oficial desse contrato;
- `event.distribution` deve controlar somente distribuicao externa;
- o post/evento interno do app continua sendo a publicacao primaria;
- falha externa nao deve desfazer a operacao principal;
- o documento nao deve reabrir contratos de agenda ou presenca.

## Criterios de qualidade

- o fluxo deve funcionar para usuario casual sem exigir cadastro excessivo;
- recursos avancados devem ser progressivos e opcionais;
- o comportamento deve preservar consistencia entre frontend, backend, API e banco;
- todas as entidades tecnicas, payloads, enums e nomes internos devem usar ingles;
- textos exibidos ao usuario devem passar por camada de linguagem ou configuracao.
