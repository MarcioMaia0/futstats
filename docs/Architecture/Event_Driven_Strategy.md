---
title: Event Driven Strategy
status: Approved
version: 1.1.0
owner: Product Architecture
last_update: 2026-07-10
related_documents:
  - ./Architecture_Principles.md
  - ../Backend/Backend_Architecture.md
  - ../Backend/Jobs_and_Queues.md
  - ../Documentation_Index.md
  - ../Release_1_0/Source_of_Truth_Map.md
  - ../Database/Tables.md
  - ../Database/Relationships.md
  - ../Database/Entity_Relationships.md
---

# Event Driven Strategy

## Objetivo

Documentar a estrategia de eventos do FUTSTATS.

Eventos devem permitir que acoes simples gerem efeitos colaterais sem acoplar dominios diretamente.

## Por que eventos?

O produto gera muitos efeitos colaterais a partir de acoes simples.

Um gol registrado pode alterar:

- placar;
- ranking;
- card social;
- estatisticas do atleta;
- timeline do time;
- notificacoes;
- experiencia do usuario.

Sem eventos, a tendencia e criar casos de uso gigantes que conhecem modulos demais.

Com eventos, cada dominio reage ao que importa para ele.

## Conceito central

Evento representa um fato que ja aconteceu.

Exemplo:

```text
GoalRegistered
```

Nao significa "registre um gol".

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

- entidades de dominio;
- domain services;
- use cases.

Eventos nao devem depender de triggers de banco como origem principal das regras de negocio.

Triggers podem existir para necessidades tecnicas, mas nao devem ser o orquestrador principal do produto.

## Fluxo padrao

```text
Use Case
  -> Domain Entity
  -> Domain Event
  -> Event Bus
  -> Event Handler
  -> Queue/Worker quando necessario
```

## Exemplo: gol registrado

```text
RegisterGoalUseCase
  -> Match.registerGoal
  -> GoalRegistered
  -> EventBus.publish
```

Handlers possiveis:

```text
Statistics.OnGoalRegistered
  -> recalcula artilharia ou agenda job

PlayerProfile.OnGoalRegistered
  -> atualiza projecoes do atleta impactado

Social.OnGoalRegistered
  -> atualiza feed ou prepara card

Experience.OnGoalRegistered
  -> concede experiencia

Notifications.OnGoalRegistered
  -> notifica interessados
```

## Event Bus

O Event Bus e responsavel por publicar eventos para handlers registrados.

Na primeira versao, pode ser implementado internamente no backend.

Em escala maior, pode evoluir para:

- queue dedicada;
- pub/sub;
- message broker;
- worker assincrono;
- outbox pattern.

## Handlers

Handlers reagem a eventos.

Regras:

1. Handler deve ter responsabilidade unica.
2. Handler deve ser idempotente quando possivel.
3. Handler nao deve modificar o evento recebido.
4. Handler nao deve assumir ordem global de execucao, salvo quando explicitamente garantido.
5. Handler pode chamar use cases do proprio dominio.

## Eventos sincronos e assincronos

### Sincronos

Usar quando a consistencia for obrigatoria para concluir o fluxo principal.

Exemplo:

- atualizar placar dentro da mesma transacao de registro de gol.

### Assincronos

Usar quando o efeito colateral puder ocorrer depois.

Exemplo:

- gerar card;
- recalcular ranking pesado;
- enviar push;
- atualizar feed derivado;
- consolidar estatisticas historicas;
- consolidar projecoes do perfil do atleta.

## Filas

Eventos que geram processamento pesado devem criar jobs em fila.

```text
Domain Event
  -> Handler
  -> Queue
  -> Worker
  -> Job
```

## Idempotencia

Handlers e jobs devem ser idempotentes.

Isso significa que processar o mesmo evento mais de uma vez nao deve gerar duplicidade ou corrupcao.

Estrategias:

- event_id unico;
- idempotency_key;
- unique constraints;
- processed_events table;
- upsert controlado;
- versionamento de snapshots.

## Retry

Falhas transitorias devem ter retry.

Exemplos:

- erro de rede;
- timeout em storage;
- falha ao gerar imagem;
- indisponibilidade temporaria de servico externo.

Falhas permanentes devem ser registradas para analise.

## Dead Letter Queue futura

Quando houver volume, jobs que falham repetidamente devem ir para uma Dead Letter Queue.

A DLQ permite investigacao sem bloquear a fila principal.

## Outbox Pattern futuro

Quando eventos precisarem ser confiaveis entre banco e fila, considerar Outbox Pattern.

Fluxo:

```text
Transacao principal
  -> grava dado de negocio
  -> grava evento em outbox
  -> worker publica evento
  -> marca como publicado
```

## Realtime

Supabase Realtime pode ser usado para experiencia ao vivo.

Casos recomendados:

- placar ao vivo;
- gols;
- feed;
- notificacoes leves;
- atualizacoes de partida.

Realtime nao substitui Domain Events.

Domain Events organizam o backend.  
Realtime entrega atualizacao para o cliente.

## Regras

1. Eventos devem representar fatos que ja aconteceram.
2. Eventos nao devem carregar regras de UI.
3. Eventos devem ter nomes em ingles tecnico.
4. Handlers podem falhar sem desfazer a acao principal, salvo quando a consistencia for obrigatoria.
5. Eventos criticos devem ser idempotentes.
6. Eventos devem preservar rastreabilidade historica quando impactarem estatisticas, ranking ou auditoria.
7. Dominios devem preferir eventos a chamadas diretas quando houver efeitos colaterais entre modulos.
