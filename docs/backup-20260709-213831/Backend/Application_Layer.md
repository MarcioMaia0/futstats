---
title: Backend Application Layer
status: Draft
version: 1.0.0
owner: Product Architecture
last_update: 2026-07-06
related_documents:
  []
---

# Backend Application Layer

## Objetivo

Orquestrar casos de uso da aplicação sem misturar regras de domínio com infraestrutura.

## Responsabilidades

- validar permissões;
- coordenar serviços de domínio;
- controlar transações;
- publicar eventos;
- chamar repositórios;
- retornar DTOs para API.

## Exemplos de use cases

- `CreateQuickMatch`
- `RegisterGoal`
- `FinishMatch`
- `CreateTeam`
- `AssignTeamRole`
- `GenerateMatchCard`
- `ReviewReferee`

## Regra

Controllers não devem conter regra de negócio.
