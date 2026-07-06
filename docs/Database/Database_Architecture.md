---
title: Database Architecture
status: Draft
version: 0.6.0
owner: Product Architecture
last_update: 2026-07-06
related_documents: []
---

# Database Architecture

## Objetivo

Definir a arquitetura de banco de dados do FUTSTATS.

## Princípios

1. Nomenclatura técnica em inglês.
2. Explicação documental em português.
3. Dados canônicos separados de textos de interface.
4. Histórico preservado.
5. Recursos avançados opcionais.
6. Agregados recalculáveis.
7. Eventos de partida como base para estatísticas.

## Camadas de dados

### Identity

Contas, usuários, papéis e permissões.

### Sports Core

Times, jogadores, partidas, quadras, adversários.

### Events

Eventos registrados nas partidas.

### Statistics

Agregações, rankings, snapshots e métricas.

### Experience

Temas, linguagem e preferências.

### Social

Posts, comentários, reações e compartilhamentos.

### Governance

Auditoria, logs, relatórios e moderação.

## Decisão

O banco deve favorecer integridade e evolução. A primeira versão pode ser relacional, mas o design deve permitir cache e snapshots para estatísticas no futuro.
