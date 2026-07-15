---
title: CreateTeamService
status: Draft
version: 0.8.0
owner: Product Architecture
last_update: 2026-07-14
related_documents:
  - ../../Frontend/Screens/Create_Team_Wizard.md
  - ../../API/Teams_API.md
  - ../../Implementation/Database/Table_Spec_media_assets.md
  - ../../Implementation/Database/Table_Spec_team_members.md
  - ../../Implementation/Database/Table_Spec_team_modalities.md
  - ../../Implementation/Database/Table_Spec_team_settings.md
  - ../../Implementation/Database/Table_Spec_teams.md
  - ../../Implementation/Database/Table_Spec_user_team_roles.md
  - ../../Implementation/Database/Table_Spec_venues.md
---

# CreateTeamService

## Objetivo

Criar um time e conceder papel inicial de gestão para a pessoa autenticada.

## Entrada

Dados definidos pelo caso de uso correspondente, com nome obrigatório e demais campos opcionais:

- `name`
- `crest_upload_token`
- `modalities`
- localidade do time
- cores oficiais do time
- dados opcionais de quadra principal
- dados opcionais de redes sociais

## Saída

Resultado do processamento ou erro de domínio.

## Regras

- validar sessão autenticada;
- validar nome do time;
- validar integridade dos dados opcionais;
- criar o time apenas no fechamento do fluxo;
- promover escudo temporário para `media_assets` e gravar `teams.crest_media_id`, quando houver `crest_upload_token`;
- persistir modalidades preferenciais em `team_modalities`, quando enviadas;
- criar `team_members` ativo para a pessoa fundadora;
- criar vínculo em `user_team_roles` com `DIRECTOR`;
- criar `team_settings` com valores padrão;
- se existir quadra principal válida, criar e vincular no mesmo fluxo;
- criar registros iniciais em `team_social_connections`, quando houver redes sociais informadas;
- não colocar regra de negócio em controllers;
- emitir eventos de domínio quando necessário.

## Eventos possíveis

- `TeamCreated`
- `TeamThemeChanged` quando a identidade visual inicial exigir evento separado no futuro

## Testes

Todo serviço deve possuir testes unitários para regras principais.

Casos mínimos esperados:

- cria time apenas com nome;
- cria time, `team_members` e vínculo de gestão;
- não deixa time órfão se falhar o vínculo;
- não deixa a pessoa fundadora sem pertencimento canônico ao time;
- aceita criação sem quadra;
- aceita criação com quadra principal válida;
- aceita criação com modalidades preferenciais;
- promove escudo temporário válido para `crest_media_id`;
- rejeita escudo temporário inválido, expirado, consumido ou de propósito incompatível;
- rejeita criação com nome inválido.
