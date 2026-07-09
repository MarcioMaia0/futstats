---
title: Endpoint Detail Teams
status: Draft
version: 1.5.0
owner: Product Architecture
last_update: 2026-07-08
---

# Endpoint Detail Teams

## Objetivo

Detalhar endpoints de times.

## Endpoints

```http
POST /api/v1/teams
GET /api/v1/teams/{teamId}
PATCH /api/v1/teams/{teamId}
GET /api/v1/teams/{teamId}/profile
GET /api/v1/teams/{teamId}/members
PATCH /api/v1/teams/{teamId}/settings
GET /api/v1/teams/{teamId}/social-connections
PATCH /api/v1/teams/{teamId}/social-connections/{platform}
POST /api/v1/teams/{teamId}/social-connections/{platform}/connect/start
POST /api/v1/teams/{teamId}/social-connections/{platform}/connect/complete
POST /api/v1/teams/{teamId}/social-connections/{platform}/disconnect
POST /api/v1/teams/{teamId}/social-connections/{platform}/validate
GET /api/v1/teams/{teamId}/statistics
GET /api/v1/teams/{teamId}/join-requests
POST /api/v1/teams/{teamId}/join-requests/{requestId}/approve
POST /api/v1/teams/{teamId}/join-requests/{requestId}/reject
POST /api/v1/teams/{teamId}/join-requests/{requestId}/cancel
```

## Regras

- criação deve aceitar apenas nome como mínimo obrigatório;
- dados avançados continuam opcionais no fluxo de criação;
- o time só deve ser persistido ao concluir o wizard;
- criar time também deve criar vínculo de gestão em `user_team_roles` com `DIRECTOR`;
- `crest_upload_token` deve referenciar upload temporário previamente concluído;
- o backend deve validar propriedade, expiração, propósito, status e consumo do token antes de promover o escudo;
- o token deve ser consumido uma única vez no momento da criação do time;
- se a promoção do escudo falhar, o backend não deve deixar o time apontando para mídia inválida;
- handles públicos de YouTube, Instagram e TikTok podem nascer já no fluxo de criação, mas a conexão real da plataforma deve ser tratada em contrato específico;
- permissões dependem do papel contextual da pessoa;
- aprovação de `join_request` deve ser ação de domínio explícita, não simples patch de status;
- a aprovação deve resolver a função inicial da pessoa no time na mesma transação;
- o backend deve validar `approved_membership_mode` e impedir combinações inválidas;
- o evento social ligado à aprovação deve ser modelado como objeto genérico `event`;
- `PLAYER_WELCOME` é apenas o primeiro tipo oficial desse contrato;
- `event.distribution` deve controlar somente distribuição externa;
- o post/evento interno do app continua sendo a publicação primária;
- falha externa não deve desfazer a operação principal.

## Critérios de qualidade

- o fluxo deve funcionar para usuário casual sem exigir cadastro excessivo;
- recursos avançados devem ser progressivos e opcionais;
- o comportamento deve preservar consistência entre frontend, backend, API e banco;
- todas as entidades técnicas, payloads, enums e nomes internos devem usar inglês;
- textos exibidos ao usuário devem passar por camada de linguagem ou configuração.
