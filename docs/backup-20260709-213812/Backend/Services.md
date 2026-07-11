---
title: Backend Services
status: Draft
version: 0.4.0
owner: Product Architecture
last_update: 2026-07-06
related_documents: []
---

# Backend Services

## Objetivo

Definir serviços de aplicação e domínio.

## Exemplos

### CreateQuickMatchService

Cria partida rápida com dados mínimos.

### RegisterGoalService

Registra gol e atualiza placar.

### FinishMatchService

Finaliza partida e dispara consolidação.

### CalculateStatisticsService

Calcula métricas disponíveis.

### GenerateShareCardService

Gera dados para card compartilhável.

### ResolveVocabularyService

Traduz chaves de UI conforme modo de linguagem.

### CheckPermissionService

Valida permissões contextuais.

## Regra

Serviços devem representar ações de negócio, não operações genéricas de banco.
