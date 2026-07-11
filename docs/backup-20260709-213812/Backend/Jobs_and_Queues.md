---
title: Jobs and Queues
status: Approved
version: 1.0.0
owner: Product Architecture
last_update: 2026-07-06
related_documents:
  - Architecture/Architecture_Principles.md
  - Architecture/Event_Driven_Strategy.md
  - Backend/Backend_Architecture.md
---

# Jobs and Queues

## Objetivo

Documentar a estratégia de jobs, filas e processamento assíncrono do FUTSTATS.

Jobs existem para executar efeitos colaterais, tarefas pesadas e processamentos que não devem bloquear o fluxo principal do usuário.

## Fluxo recomendado

```text
Use Case
  -> Domain Event
  -> Event Handler
  -> Queue
  -> Worker
  -> Job
```

Nem todo evento precisa virar job.

Um evento vira job quando:

- o processamento é pesado;
- depende de serviço externo;
- pode falhar e ser tentado novamente;
- não precisa bloquear a resposta ao usuário;
- precisa ser rastreável;
- pode ser executado em segundo plano.

## Jobs iniciais

- RecalculateStatisticsJob
- RebuildPlayerProfileReadModelJob
- RebuildPlayerMatchStatisticsJob
- RebuildPlayerTimelineJob
- RebuildPlayerGalleryJob
- GenerateMatchCardJob
- SendNotificationJob
- UpdateRankingJob
- ProcessReportJob
- GenerateReportJob
- CleanupTemporaryFilesJob
- ConsolidateRefereeReputationJob
- SyncOfflineCommandJob

## RecalculateStatisticsJob

Responsável por recalcular estatísticas derivadas.

Pode ser acionado por:

- GoalRegistered
- GoalUpdated
- GoalRemoved
- MatchFinished
- PlayerLinkedToTeam

Deve ser idempotente.

## RebuildPlayerProfileReadModelJob

Responsável por reconstruir projeções do perfil do atleta.

Pode ser acionado por:

- PlayerCreated
- TeamJoinRequestApproved
- MatchFinished
- GoalRegistered
- GoalUpdated
- PostPublished com vínculo ao atleta

Pode executar rebuild parcial ou total conforme payload.

## GenerateMatchCardJob

Responsável por gerar cards compartilháveis.

Pode ser acionado por:

- MatchFinished
- GoalRegistered quando houver card parcial
- MatchCardRequested

Pode usar Edge Functions, processamento server-side ou serviço de renderização.

A imagem final pode ser salva no Supabase Storage.

## SendNotificationJob

Responsável por enviar notificações.

Pode ser acionado por:

- GoalRegistered
- MatchFinished
- PostPublished
- RefereeReviewed

Não deve bloquear o fluxo principal.

## UpdateRankingJob

Responsável por atualizar rankings derivados.

Pode trabalhar com snapshots para evitar consultas pesadas em tempo real.

## ProcessReportJob

Responsável por processar denúncias, moderação e revisão.

Pode integrar com assistência de IA quando permitido pelas políticas do projeto.

## SyncOfflineCommandJob

Responsável por processar comandos criados offline no cliente.

Deve considerar:

- idempotency_key;
- created_at_client;
- device_id;
- user_id;
- conflict resolution;
- command status.

## Regras obrigatórias

1. Jobs devem ser idempotentes.
2. Falhas devem ser registradas.
3. Jobs críticos devem ter retry.
4. Jobs não devem bloquear fluxo casual.
5. Jobs devem ter identificador único.
6. Jobs devem armazenar status de execução quando necessário.
7. Jobs não devem conter regra de negócio fora dos use cases.
8. Workers devem chamar casos de uso ou application services.

## Estados recomendados

```text
queued
processing
completed
failed
cancelled
retrying
dead_letter
```

## Campos recomendados para tabela de jobs

```text
id uuid primary key
type text not null
status text not null
payload jsonb not null
attempts integer not null default 0
max_attempts integer not null default 3
scheduled_at timestamptz
started_at timestamptz
completed_at timestamptz
failed_at timestamptz
last_error text
idempotency_key text
created_at timestamptz not null
updated_at timestamptz not null
```

## Retry

Retry deve ser usado para falhas transitórias.

Recomendações:

- backoff progressivo;
- limite de tentativas;
- registro do erro;
- dead letter após falhas repetidas.

## Dead Letter

Jobs que falham repetidamente devem ser movidos para dead letter.

Isso preserva o erro para análise sem travar a fila principal.

## Relação com Supabase Edge Functions

Edge Functions podem executar workers ou tarefas específicas.

Mas a origem da decisão deve continuar sendo o domínio ou aplicação.

Evitar:

```text
Database Trigger
  -> Edge Function
  -> regra de negócio complexa
```

Preferir:

```text
Use Case
  -> Domain Event
  -> Queue
  -> Worker/Edge Function
```

## Observabilidade

Jobs devem permitir rastrear:

- quando foram criados;
- quem ou qual evento originou;
- payload mínimo;
- tentativas;
- erro atual;
- conclusão;
- tempo de execução.

## Segurança

Payloads de jobs não devem carregar dados sensíveis sem necessidade.

Quando possível, carregar IDs e buscar dados no momento da execução.
