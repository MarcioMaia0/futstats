---
title: Backend Architecture
status: Approved
version: 1.1.0
owner: Product Architecture
last_update: 2026-07-10
related_documents:
  - ../Architecture/Architecture_Principles.md
  - ../Architecture/Recommended_Project_Structure.md
  - ../Architecture/Event_Driven_Strategy.md
  - ./Jobs_and_Queues.md
  - ../Documentation_Index.md
  - ../Release_1_0/Source_of_Truth_Map.md
  - ../Database/Tables.md
  - ../Database/Relationships.md
  - ../Database/Entity_Relationships.md
---

# Backend Architecture

## Objetivo

Definir a estrutura backend recomendada para o FUTSTATS.

O backend deve proteger regras de negocio, organizar os dominios do produto e manter infraestrutura desacoplada do nucleo da aplicacao.

## Arquitetura oficial

O backend deve seguir:

- Modular Monolith;
- Clean Architecture;
- Domain-Driven Design tatico;
- Domain Events;
- Repository Pattern;
- CQRS leve quando fizer sentido.

## Regra complementar para persistencia

- O backend deve consultar os mapas de banco em `Database/` para entender o recorte estrutural.
- O backend deve consultar a `Implementation/Database/Table_Spec_*.md` correspondente para contrato real de persistencia antes de propor tabela, coluna, enum, constraint, indice ou relacao.
- Material legado que cite `Database/Database_Architecture.md` nao substitui as `Table_Spec_*`.

## Organizacao base

```text
src/
  modules/
    identity/
    teams/
    players/
    matches/
    statistics/
    social/
    referees/
    experience/

  shared/
  bootstrap/
  config/
```

## Estrutura de cada modulo

```text
modules/{module}/
  domain/
  application/
  infra/
  presentation/
  tests/
```

## Domain

Responsavel pelas regras essenciais do negocio.

Pode conter:

- entities;
- value objects;
- domain events;
- repository interfaces;
- domain services;
- business errors;
- invariants.

Nao pode conter:

- Supabase SDK;
- SQL direto;
- controllers;
- rotas;
- React Native;
- HTTP;
- logica de tela;
- integracoes externas.

## Application

Responsavel por orquestrar acoes do sistema.

Pode conter:

- use cases;
- application services;
- commands;
- queries;
- DTOs;
- ports;
- handlers de eventos;
- regras de autorizacao de negocio.

Exemplos:

- CreateMatchUseCase
- RegisterGoalUseCase
- FinishMatchUseCase
- AddPlayerToTeamUseCase
- RecalculateStatisticsUseCase
- GenerateMatchCardUseCase

Application nao deve depender diretamente de Supabase ou outro SDK externo.

## Infrastructure

Responsavel por detalhes tecnicos.

Pode conter:

- Supabase repositories;
- mappers;
- queue adapters;
- storage adapters;
- external API clients;
- database transaction adapters;
- workers;
- logger implementations.

Infrastructure implementa contratos definidos em Domain ou Application.

## Presentation

Responsavel por adaptar entrada e saida.

Pode conter:

- controllers;
- routes;
- request validators;
- response presenters;
- HTTP-specific mappers.

Presentation nao deve conter regra de negocio.

## Fluxo recomendado

```text
HTTP Request
  -> Controller
  -> Use Case
  -> Domain Entity / Domain Service
  -> Repository Interface
  -> Supabase Repository
  -> Domain Event
  -> Event Bus
  -> Handlers / Jobs
```

## Exemplo: registrar gol

```text
MatchController.registerGoal
  -> RegisterGoalUseCase
  -> Match.registerGoal
  -> MatchRepository.save
  -> emit GoalRegistered
  -> Statistics handler recalcula ranking
  -> Social handler prepara card/feed
  -> Experience handler atualiza experiencia
```

## Repositories

Casos de uso devem depender de interfaces.

```text
MatchRepository
PlayerRepository
TeamRepository
StatisticsRepository
PostRepository
```

Implementacoes tecnicas ficam em infra.

```text
SupabaseMatchRepository
SupabasePlayerRepository
SupabaseTeamRepository
```

## Eventos

Casos de uso podem emitir eventos quando uma acao relevante ocorrer.

Eventos representam fatos passados.

Exemplos:

- MatchCreated
- GoalRegistered
- MatchFinished
- PlayerLinkedToTeam
- RefereeReviewed
- PostPublished

Eventos nao devem carregar regra de UI.

## Jobs e workers

Processos pesados ou assincronos devem ser executados por jobs/workers.

Exemplos:

- gerar card de partida;
- recalcular estatisticas;
- enviar notificacoes;
- atualizar rankings;
- processar denuncias.

Jobs devem ser idempotentes e rastreaveis.

## Supabase

Supabase deve ser usado como infraestrutura.

Permitido:

- Auth;
- PostgreSQL;
- Storage;
- Realtime;
- Edge Functions;
- RLS;
- migrations;
- constraints;
- audit logs.

Evitar:

- colocar regra de negocio complexa em triggers;
- acessar Supabase diretamente em use cases;
- deixar o banco orquestrar o fluxo principal do sistema.

## Autorizacao

A autorizacao deve ter duas camadas:

1. RLS no banco para proteger acesso aos dados.
2. Regras de negocio na aplicacao para decisoes contextuais.

Exemplo:

- RLS impede alteracao por usuario sem vinculo com o time.
- Application decide se uma partida finalizada pode ou nao ser alterada.

## Shared

Shared deve conter apenas elementos genericos.

Permitido:

- Result;
- DomainEvent base;
- EventBus contract;
- common errors;
- logger contract;
- pagination;
- UUID helpers;
- date helpers.

Nao permitido:

- CreateMatch;
- RegisterGoal;
- CalculateStatistics;
- GenerateMatchCard;
- regras especificas de dominio.

## Testes

Prioridade de testes:

1. Domain tests.
2. Use case tests.
3. Event handler tests.
4. Repository integration tests.
5. API/controller tests.

Domain e Application devem ser testaveis sem banco real.

## Regra final

Cada modulo deve possuir seus proprios casos de uso, DTOs, entidades, repositorios, eventos e testes.

A arquitetura deve permitir evolucao de longo prazo sem bloquear a velocidade de desenvolvimento.
