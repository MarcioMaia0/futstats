---
title: Future Idea - Roles Catalog
status: Idea
version: 1.0.0
owner: Product Architecture
last_update: 2026-07-09
related_documents:
  - ../Implementation/Database/Table_Spec_user_team_roles.md
  - ../Domain/Teams.md
  - ../API/Identity_API.md
---

# Future Idea: Roles Catalog

## Objetivo

Avaliar a evolucao de papeis fixos por enum para um catalogo mais flexivel de funcoes contextuais no time.

## Problema que a ideia resolve

Hoje os papeis principais ja estao bem definidos no estado atual do produto, mas no futuro o time pode querer reconhecer funcoes mais especificas sem misturar tudo em enum fixo.

## Exemplos de papeis futuros

- tecnico;
- auxiliar tecnico;
- massagista;
- responsavel por midia;
- supervisor;
- tesoureiro;
- organizador.

## Valor potencial

- maior flexibilidade organizacional;
- configuracao por time;
- possibilidade de permissoes mais granulares no futuro;
- melhor representacao da estrutura real da varzea.

## Regra de cautela

No estado atual do produto, isso continua sendo apenas ideia.

Nao substitui o contrato atual de `DIRECTOR`, `PRESIDENT` e `COMMITTEE`.

## Status

Ideia valida para evolucao futura, mas ainda nao e estrutura canonica do modelo atual.
