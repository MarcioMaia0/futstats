---
title: Runtime Architecture
status: Draft
version: 0.9.0
owner: Product Architecture
last_update: 2026-07-06
---

# Runtime Architecture


## Objetivo

Definir como os principais componentes do FUTSTATS devem se comportar em tempo de execução.

## Contexto

A plataforma precisa atender uso casual, social e analítico sem criar dependências rígidas entre todos os módulos.

## Diretrizes

1. Fluxos casuais devem responder rapidamente.
2. Processamentos pesados devem ser assíncronos.
3. Geração de estatísticas pode ser eventual, desde que o usuário receba feedback claro.
4. Geração de cards, rankings e relatórios deve ser delegada a jobs quando necessário.
5. Falhas em módulos avançados não devem impedir o registro básico de partida.

## Fluxo recomendado

```text
Client App
   ↓
API Gateway / Backend
   ↓
Application Services
   ↓
Domain Services
   ↓
Repositories / Event Bus / Jobs
```

## Decisão

O runtime deve priorizar experiência rápida no MVP e desacoplar tarefas analíticas em pipelines assíncronos.
