---
title: Event Driven Strategy
status: Approved
version: 1.0.0
owner: Product Architecture
last_update: 2026-07-06
related_documents:
  - Architecture/Architecture_Principles.md
  - Backend/Backend_Architecture.md
  - Backend/Jobs_and_Queues.md
  - Database/Database_Architecture.md
---

# Event Driven Strategy

## Objetivo

Documentar a estratégia de eventos do FUTSTATS.

Eventos devem permitir que ações simples gerem efeitos colaterais sem acoplar domínios diretamente.

## Por que eventos?

O produto gera muitos efeitos colaterais a partir de ações simples.

Um gol registrado pode alterar:

- placar;
- ranking;
- card social;
- estatísticas do atleta;
- timeline do time;
- notificações;
- experiência do usuário.

Sem eventos, a tendência é criar casos de uso gigantes que conhecem módulos demais.

Com eventos, cada domínio reage ao que importa para ele.

## Conceito central

Evento representa um fato que já aconteceu.

Exemplo:

```text
GoalRegistered
```

Não significa "registre um gol".

Significa:

```text
Um gol foi registrado.
```

## Eventos principais

- MatchCreated
- GoalRegistered
- GoalUpdated
- GoalRemoved
- MatchFinished
- MatchCancelled
- PlayerCreated
- PlayerLinkedToTeam
- PlayerClaimedByUser
- PlayerProfileProjectionRefreshRequested
- PlayerGalleryProjectionRefreshRequested
- RefereeReviewed
- PostPublished
- MatchCardGenerated
- StatisticsRecalculated
- ThemeUpdated

## Origem dos eventos

Eventos devem ser emitidos por:

- entidades de domínio;
- domain services;
- use cases.

Eventos não devem depender de triggers de banco como origem principal das regras de negócio.

Triggers podem existir para necessidades técnicas, mas não devem ser o orquestrador principal do produto.

## Fluxo padrão

```text
Use Case
  -> Domain Entity
  -> Domain Event
  -> Event Bus
  -> Event Handler
  -> Queue/Worker quando necessário
```

## Exemplo: gol registrado

```text
RegisterGoalUseCase
  -> Match.registerGoal
  -> GoalRegistered
  -> EventBus.publish
```

Handlers possíveis:

```text
Statistics.OnGoalRegistered
  -> recalcula artilharia ou agenda job

PlayerProfile.OnGoalRegistered
  -> atualiza projeções do atleta impactado

Social.OnGoalRegistered
  -> atualiza feed ou prepara card

Experience.OnGoalRegistered
  -> concede experiência

Notifications.OnGoalRegistered
  -> notifica interessados
```

## Event Bus

O Event Bus é responsável por publicar eventos para handlers registrados.

Na primeira versão, pode ser implementado internamente no backend.

Em escala maior, pode evoluir para:

- queue dedicada;
- pub/sub;
- message broker;
- worker assíncrono;
- outbox pattern.

## Handlers

Handlers reagem a eventos.

Regras:

1. Handler deve ter responsabilidade única.
2. Handler deve ser idempotente quando possível.
3. Handler não deve modificar o evento recebido.
4. Handler não deve assumir ordem global de execução, salvo quando explicitamente garantido.
5. Handler pode chamar use cases do próprio domínio.

## Eventos síncronos e assíncronos

### Síncronos

Usar quando a consistência for obrigatória para concluir o fluxo principal.

Exemplo:

- atualizar placar dentro da mesma transação de registro de gol.

### Assíncronos

Usar quando o efeito colateral puder ocorrer depois.

Exemplo:

- gerar card;
- recalcular ranking pesado;
- enviar push;
- atualizar feed derivado;
- consolidar estatísticas históricas.
- consolidar projeções do perfil do atleta.

## Filas

Eventos que geram processamento pesado devem criar jobs em fila.

```text
Domain Event
  -> Handler
  -> Queue
  -> Worker
  -> Job
```

## Idempotência

Handlers e jobs devem ser idempotentes.

Isso significa que processar o mesmo evento mais de uma vez não deve gerar duplicidade ou corrupção.

Estratégias:

- event_id único;
- idempotency_key;
- unique constraints;
- processed_events table;
- upsert controlado;
- versionamento de snapshots.

## Retry

Falhas transitórias devem ter retry.

Exemplos:

- erro de rede;
- timeout em storage;
- falha ao gerar imagem;
- indisponibilidade temporária de serviço externo.

Falhas permanentes devem ser registradas para análise.

## Dead Letter Queue futura

Quando houver volume, jobs que falham repetidamente devem ir para uma Dead Letter Queue.

A DLQ permite investigação sem bloquear a fila principal.

## Outbox Pattern futuro

Quando eventos precisarem ser confiáveis entre banco e fila, considerar Outbox Pattern.

Fluxo:

```text
Transação principal
  -> grava dado de negócio
  -> grava evento em outbox
  -> worker publica evento
  -> marca como publicado
```

## Realtime

Supabase Realtime pode ser usado para experiência ao vivo.

Casos recomendados:

- placar ao vivo;
- gols;
- feed;
- notificações leves;
- atualizações de partida.

Realtime não substitui Domain Events.

Domain Events organizam o backend.
Realtime entrega atualização para o cliente.

## Regras

1. Eventos devem representar fatos que já aconteceram.
2. Eventos não devem carregar regras de UI.
3. Eventos devem ter nomes em inglês técnico.
4. Handlers podem falhar sem desfazer a ação principal, salvo quando a consistência for obrigatória.
5. Eventos críticos devem ser idempotentes.
6. Eventos devem preservar rastreabilidade histórica quando impactarem estatísticas, ranking ou auditoria.
7. Domínios devem preferir eventos a chamadas diretas quando houver efeitos colaterais entre módulos.
