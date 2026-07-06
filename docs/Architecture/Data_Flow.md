---
title: Data Flow
status: Draft
version: 1.0.0
owner: Product Architecture
last_update: 2026-07-06
related_documents:
  []
---

# Data Flow

## Fluxo casual

```text
Criar partida → Registrar placar/gols → Gerar card → Compartilhar → Feed/Histórico
```

## Fluxo avançado

```text
Agendar partida → Relação de atletas → Escalação → Eventos → Finalização → Estatísticas → Relatórios
```

## Fluxo social

```text
Partida finalizada → Card gerado → Post publicado → Reações/comentários → Engajamento
```

## Fluxo analítico

```text
Eventos estruturados → Agregações → Métricas → Relatórios → Insights
```

## Princípio

Todo fluxo avançado deve ser opcional. O fluxo casual deve permanecer curto.
