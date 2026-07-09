---
title: CreateTeamService
status: Draft
version: 0.7.0
owner: Product Architecture
last_update: 2026-07-08
related_documents:
  - ../../Frontend/Screens/Create_Team_Wizard.md
  - ../../API/Teams_API.md
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
- `default_modality`
- localidade do time
- cores principais
- dados opcionais de quadra principal

## Saída

Resultado do processamento ou erro de domínio.

## Regras

- validar sessão autenticada;
- validar nome do time;
- validar integridade dos dados opcionais;
- criar o time apenas no fechamento do fluxo;
- criar vínculo em `user_team_roles` com `DIRECTOR`;
- se existir quadra principal válida, criar e vincular no mesmo fluxo;
- não colocar regra de negócio em controllers;
- emitir eventos de domínio quando necessário.

## Eventos possíveis

- `TeamCreated`
- `TeamThemeChanged` quando a identidade visual inicial exigir evento separado no futuro

## Testes

Todo serviço deve possuir testes unitários para regras principais.

Casos mínimos esperados:

- cria time apenas com nome;
- cria time e vínculo de gestão;
- não deixa time órfão se falhar o vínculo;
- aceita criação sem quadra;
- aceita criação com quadra principal válida;
- rejeita criação com nome inválido.
