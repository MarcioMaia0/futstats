---
title: Recommended Project Structure
status: Approved
version: 1.0.0
owner: Product Architecture
last_update: 2026-07-06
related_documents:
  - Architecture/Architecture_Principles.md
  - Backend/Backend_Architecture.md
  - AI/AI_Development_Guidelines.md
---

# Recommended Project Structure

## Objetivo

Definir a estrutura recomendada para implementação do FUTSTATS.

Esta estrutura deve orientar desenvolvimento backend, serviços, integrações e geração de código por IA.

## Estrutura base

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
    domain/
    application/
    infra/
    utils/

  bootstrap/
  config/
```

## Estrutura padrão de módulo

```text
modules/{module}/
  domain/
    entities/
    value-objects/
    events/
    repositories/
    services/
    errors/

  application/
    use-cases/
    commands/
    queries/
    dtos/
    ports/

  infra/
    persistence/
    repositories/
    mappers/
    supabase/
    workers/

  presentation/
    controllers/
    routes/
    presenters/
    validators/

  tests/
    domain/
    application/
    infra/
```

## Exemplo: Matches

```text
modules/matches/
  domain/
    entities/
      Match.ts
      Goal.ts
    value-objects/
      Score.ts
      MatchStatus.ts
    events/
      MatchCreated.ts
      GoalRegistered.ts
      MatchFinished.ts
    repositories/
      MatchRepository.ts
    errors/
      MatchAlreadyFinishedError.ts

  application/
    use-cases/
      CreateMatchUseCase.ts
      RegisterGoalUseCase.ts
      FinishMatchUseCase.ts
    dtos/
      CreateMatchInput.ts
      MatchOutput.ts

  infra/
    repositories/
      SupabaseMatchRepository.ts
    mappers/
      MatchMapper.ts

  presentation/
    controllers/
      MatchController.ts
    routes/
      matchRoutes.ts
```

## Exemplo: Statistics

```text
modules/statistics/
  domain/
    entities/
      StatisticsSnapshot.ts
      Ranking.ts
    value-objects/
      MetricKey.ts
    events/
      StatisticsRecalculated.ts
    repositories/
      StatisticsRepository.ts

  application/
    use-cases/
      RecalculatePlayerStatisticsUseCase.ts
      RecalculateTeamRankingUseCase.ts
    handlers/
      OnGoalRegisteredHandler.ts
      OnMatchFinishedHandler.ts

  infra/
    repositories/
      SupabaseStatisticsRepository.ts
    workers/
      RecalculateStatisticsWorker.ts
```

## Exemplo: Social

```text
modules/social/
  domain/
    entities/
      Post.ts
      Comment.ts
      Reaction.ts
    events/
      PostPublished.ts
    repositories/
      PostRepository.ts

  application/
    use-cases/
      PublishPostUseCase.ts
      GenerateMatchCardUseCase.ts
    handlers/
      OnMatchFinishedGenerateCardHandler.ts

  infra/
    storage/
      SupabaseMediaStorage.ts
    workers/
      GenerateMatchCardWorker.ts
```

## Shared

Shared deve ser pequeno, estável e genérico.

```text
shared/
  domain/
    events/
      DomainEvent.ts
      EventBus.ts
    errors/
      DomainError.ts
    value-objects/
      UniqueEntityId.ts

  application/
    Result.ts
    Pagination.ts
    UseCase.ts

  infra/
    logger/
    env/
    database/
    queue/

  utils/
    date.ts
    string.ts
```

## Bootstrap

Bootstrap liga as dependências.

```text
bootstrap/
  container.ts
  eventHandlers.ts
  routes.ts
  workers.ts
```

A injeção de dependência deve ser configurada nessa área ou em composição equivalente.

## Config

```text
config/
  env.ts
  supabase.ts
  queue.ts
  storage.ts
```

Configuração não deve conter regra de negócio.

## Convenções de nome

### Use cases

Usar verbo no imperativo de negócio:

- CreateMatchUseCase
- RegisterGoalUseCase
- FinishMatchUseCase
- AddPlayerToTeamUseCase
- GenerateMatchCardUseCase

### Events

Usar fato no passado:

- MatchCreated
- GoalRegistered
- MatchFinished
- PlayerLinkedToTeam

### Repositories

Interface no domínio:

- MatchRepository
- PlayerRepository
- TeamRepository

Implementação na infraestrutura:

- SupabaseMatchRepository
- SupabasePlayerRepository
- SupabaseTeamRepository

### Mappers

- MatchMapper
- PlayerMapper
- TeamMapper

## Regras de importação

Permitido:

```text
presentation -> application
application -> domain
automation/worker -> application
infra -> domain/application contracts
```

Evitar:

```text
domain -> infra
domain -> presentation
domain -> Supabase SDK
application -> Supabase SDK
application -> React Native
```

## Comunicação entre módulos

Preferir eventos para efeitos colaterais.

Exemplo:

```text
matches/RegisterGoalUseCase
  emits GoalRegistered

statistics/OnGoalRegisteredHandler
  recalculates ranking

social/OnGoalRegisteredHandler
  prepares feed update
```

## Quando criar um novo módulo

Criar módulo quando houver:

- linguagem própria;
- regras próprias;
- dados próprios;
- casos de uso próprios;
- evolução independente.

Não criar módulo apenas por agrupamento técnico.

## Quando usar shared

Usar shared apenas quando algo for genérico e reutilizável por vários módulos sem carregar regra específica de negócio.

Se houver dúvida, manter no domínio específico até surgir reutilização real.
