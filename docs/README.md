---
title: FUTSTATS Documentation
status: Review
version: 1.1.0
owner: Product Architecture
last_update: 2026-07-20
related_documents:
  - ./Release_1_0/Current_Project_Status.md
  - ./Release_1_0/Handoff_Guide.md
---

# FUTSTATS Documentation

## Objetivo

Esta pasta é a base de conhecimento oficial do FUTSTATS. Ela organiza decisões de produto, domínio, banco de dados, backend, frontend, API, UX, IA, QA, segurança, operações, monetização, analytics e decisões arquiteturais.

## Princípio central do produto

> O FUTSTATS nunca deve exigir comportamento analítico para entregar valor.

A adoção inicial deve vir da experiência social, da resenha, do placar, dos gols e do compartilhamento. A inteligência esportiva deve ser uma camada progressiva para usuários e times que desejarem evoluir a maturidade de uso.

## Estrutura principal

```text
FUTSTATS_Docs/
├── Product/
├── Domain/
├── Database/
├── Backend/
├── Frontend/
├── API/
├── UX/
├── AI/
├── Architecture/
├── QA/
├── Security/
├── Operations/
├── Monetization/
├── Analytics/
├── ADR/
├── Templates/
└── Documentation_Index.md
```

## Convenções globais

- Código, banco, APIs, enums, rotas e identificadores técnicos em inglês.
- Explicações, regras de negócio e decisões de produto em português.
- Experiência social como porta de entrada.
- Recursos avançados como camadas opcionais.
- Dados canônicos independentes da linguagem exibida.
- Documentação modular para facilitar leitura por pessoas e IA.

## Status

Documentação em construção. Este pacote representa uma versão acumulada e utilizável da base de conhecimento do FUTSTATS.

## Estado atual do desenvolvimento

O estado real do projeto deve ser lido primeiro em:

- `Release_1_0/Current_Project_Status.md`
- `Release_1_0/Handoff_Guide.md`
- `Release_1_0/Open_Issues.md`

Em 2026-07-20, o desenvolvimento ativo está concentrado no app mobile React Native/Expo com Supabase remoto, cobrindo autenticação, criação/configuração de time, elenco, solicitações de entrada, avatares e padronização visual por ícones.

Pastas `docs/backup-*` são snapshots históricos e não devem ser tratadas como estado atual.
