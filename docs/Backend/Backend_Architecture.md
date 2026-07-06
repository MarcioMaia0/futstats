---
title: Backend Architecture
status: Approved
version: 1.0.0
owner: Product Architecture
last_update: 2026-07-06
related_documents:
  - Architecture/Architecture_Principles.md
  - Architecture/Recommended_Project_Structure.md
  - Architecture/Event_Driven_Strategy.md
  - Backend/Jobs_and_Queues.md
  - Database/Database_Architecture.md
---

# Backend Architecture

## Objetivo

Definir a estrutura backend recomendada para o FUTSTATS.

O backend deve proteger regras de negócio, organizar os domínios do produto e manter infraestrutura desacoplada do núcleo da aplicação.

## Arquitetura oficial

O backend deve seguir:

- Modular Monolith;
- Clean Architecture;
- Domain-Driven Design tático;
- Domain Events;
- Repository Pattern;
- CQRS leve quando fizer sentido.

## Organização base

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

## Estrutura de cada módulo

```text
modules/{module}/
  domain/
  application/
  infra/
  presentation/
  tests/
```

## Domain

Responsável pelas regras essenciais do negócio.

Pode conter:

- entities;
- value objects;
- domain events;
- repository interfaces;
- domain services;
- business errors;
- invariants.

Não pode conter:

- Supabase SDK;
- SQL direto;
- controllers;
- rotas;
- React Native;
- HTTP;
- lógica de tela;
- integrações externas.

## Application

Responsável por orquestrar ações do sistema.

Pode conter:

- use cases;
- application services;
- commands;
- queries;
- DTOs;
- ports;
- handlers de eventos;
- regras de autorização de negócio.

Exemplos:

- CreateMatchUseCase
- RegisterGoalUseCase
- FinishMatchUseCase
- AddPlayerToTeamUseCase
- RecalculateStatisticsUseCase
- GenerateMatchCardUseCase

Application não deve depender diretamente de Supabase ou outro SDK externo.

## Infrastructure

Responsável por detalhes técnicos.

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

Responsável por adaptar entrada e saída.

Pode conter:

- controllers;
- routes;
- request validators;
- response presenters;
- HTTP-specific mappers.

Presentation não deve conter regra de negócio.

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
  -> Experience handler atualiza experiência
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

Implementações técnicas ficam em infra.

```text
SupabaseMatchRepository
SupabasePlayerRepository
SupabaseTeamRepository
```

## Eventos

Casos de uso podem emitir eventos quando uma ação relevante ocorrer.

Eventos representam fatos passados.

Exemplos:

- MatchCreated
- GoalRegistered
- MatchFinished
- PlayerLinkedToTeam
- RefereeReviewed
- PostPublished

Eventos não devem carregar regra de UI.

## Jobs e workers

Processos pesados ou assíncronos devem ser executados por jobs/workers.

Exemplos:

- gerar card de partida;
- recalcular estatísticas;
- enviar notificações;
- atualizar rankings;
- processar denúncias.

Jobs devem ser idempotentes e rastreáveis.

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

- colocar regra de negócio complexa em triggers;
- acessar Supabase diretamente em use cases;
- deixar o banco orquestrar o fluxo principal do sistema.

## Autorização

A autorização deve ter duas camadas:

1. RLS no banco para proteger acesso aos dados.
2. Regras de negócio na aplicação para decisões contextuais.

Exemplo:

- RLS impede alteração por usuário sem vínculo com o time.
- Application decide se uma partida finalizada pode ou não ser alterada.

## Shared

Shared deve conter apenas elementos genéricos.

Permitido:

- Result;
- DomainEvent base;
- EventBus contract;
- common errors;
- logger contract;
- pagination;
- UUID helpers;
- date helpers.

Não permitido:

- CreateMatch;
- RegisterGoal;
- CalculateStatistics;
- GenerateMatchCard;
- regras específicas de domínio.

## Testes

Prioridade de testes:

1. Domain tests.
2. Use case tests.
3. Event handler tests.
4. Repository integration tests.
5. API/controller tests.

Domain e Application devem ser testáveis sem banco real.

## Regra final

Cada módulo deve possuir seus próprios casos de uso, DTOs, entidades, repositórios, eventos e testes.

A arquitetura deve permitir evolução de longo prazo sem bloquear a velocidade de desenvolvimento.
