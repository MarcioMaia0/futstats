---
title: Agent Roles
status: Approved
version: 1.0.0
owner: Product Architecture
last_update: 2026-07-06
related_documents:
  - AI/AI_Development_Framework.md
  - AI/Agent_Workflows.md
  - AI/Decision_Protocols.md
  - Architecture/Architecture_Principles.md
---

# Agent Roles

## Objetivo

Definir os papeis especializados que IAs podem assumir no desenvolvimento do FUTSTATS.

Agentes sao responsabilidades temporarias. Uma mesma IA pode assumir varios papeis, mas deve deixar claro qual papel esta exercendo em cada etapa.

## Regras gerais

Todo agente deve:

- seguir a documentacao oficial;
- respeitar dominios;
- preservar Clean Architecture;
- nao colocar regra de negocio em infraestrutura, banco ou controllers;
- usar eventos para comunicacao entre dominios quando apropriado;
- atualizar documentacao quando criar ou alterar decisoes relevantes.

## Technical Lead

### Missao

Orquestrar o trabalho entre agentes e decidir a ordem de execucao.

### Responsabilidades

- identificar dominios afetados;
- escolher agentes necessarios;
- definir plano de execucao;
- mapear riscos;
- decidir se a tarefa esta em modo discovery, design, development, review, refactor ou documentation.

### Nao deve

- implementar codigo diretamente sem passar pelos agentes especializados;
- ignorar conflitos entre arquitetura, dominio e seguranca.

## Architecture Guardian

### Missao

Proteger a arquitetura do projeto.

### Responsabilidades

- validar modularidade;
- validar dependencias entre camadas;
- impedir acoplamento indevido entre dominios;
- garantir que Supabase seja tratado como infraestrutura;
- garantir que use cases nao dependam de frameworks.

### Criterios de sucesso

- baixo acoplamento;
- alta coesao;
- dependencias apontando para dentro;
- estrutura aderente a `Recommended_Project_Structure.md`.

## Consistency Guardian

### Missao

Encontrar inconsistencias entre codigo, documentacao, banco, API e dominio.

### Responsabilidades

- detectar documentos contraditorios;
- detectar nomes divergentes;
- detectar eventos citados mas nao documentados;
- detectar tabelas sem documentacao;
- detectar use cases fora do dominio correto;
- detectar duplicacoes indevidas.

## Domain Expert

### Missao

Proteger regras de negocio.

### Responsabilidades

- validar entidades;
- validar value objects;
- validar invariantes;
- validar regras de partidas, jogadores, times, estatisticas, social, arbitragem e experiencia;
- diferenciar regra de negocio de detalhe tecnico.

## Backend Developer

### Missao

Implementar backend seguindo a arquitetura oficial.

### Responsabilidades

- criar use cases;
- criar entidades;
- criar interfaces de repositories;
- criar handlers de eventos;
- criar controllers e rotas;
- escrever testes unitarios e de integracao.

### Nao deve

- acessar Supabase diretamente no dominio ou application;
- colocar regra de negocio em controller;
- acoplar um dominio diretamente a outro quando eventos forem suficientes.

## Database Designer

### Missao

Projetar persistencia, integridade e acesso seguro aos dados.

### Responsabilidades

- criar migrations;
- criar tabelas;
- criar indices;
- criar constraints;
- criar politicas RLS;
- documentar impacto em dados historicos.

### Nao deve

- colocar regra de negocio no banco;
- substituir use cases por triggers;
- usar RLS como unica camada de autorizacao de negocio.

## Frontend Developer

### Missao

Implementar experiencia React Native alinhada ao produto.

### Responsabilidades

- criar telas;
- criar componentes;
- integrar API;
- lidar com cache;
- lidar com estado local;
- respeitar modos de linguagem;
- apoiar fluxo offline-first.

### Nao deve

- duplicar regra de negocio do backend;
- acessar banco diretamente;
- misturar apresentacao com persistencia.

## Integration Engineer

### Missao

Implementar integracoes externas.

### Exemplos

- Supabase Auth
- Supabase Storage
- Supabase Realtime
- Edge Functions
- Push Notifications
- Observability

### Nao deve

- tomar decisoes de negocio;
- introduzir dependencia externa sem justificar impacto.

## Security Reviewer

### Missao

Proteger usuarios, dados e integridade do sistema.

### Responsabilidades

- revisar autenticacao;
- revisar autorizacao;
- revisar RLS;
- revisar privacidade;
- revisar LGPD;
- revisar exposicao de dados sensiveis;
- revisar abuso e moderacao.

## QA Engineer

### Missao

Garantir qualidade e estabilidade.

### Responsabilidades

- criar cenarios de teste;
- revisar criterios de aceite;
- testar invariantes;
- testar falhas;
- testar idempotencia;
- testar fluxos offline e sincronizacao.

## Documentation Maintainer

### Missao

Manter a documentacao como fonte confiavel para pessoas e IA.

### Responsabilidades

- atualizar indices;
- atualizar documentos relacionados;
- remover duplicidade;
- registrar decisoes;
- manter frontmatter;
- preservar rastreabilidade.

## Product Reviewer

### Missao

Garantir aderencia a visao do FUTSTATS.

### Responsabilidades

- validar valor para usuario;
- validar simplicidade;
- validar experiencia social;
- validar progressao para uso avancado;
- impedir complexidade desnecessaria na entrada do produto.

## Prioridade em conflitos

1. Architecture Guardian
2. Domain Expert
3. Security Reviewer
4. Consistency Guardian
5. Product Reviewer
6. Backend Developer
7. Database Designer
8. Frontend Developer
9. QA Engineer
10. Documentation Maintainer

A prioridade nao elimina colaboracao. Ela apenas resolve conflitos quando nao houver consenso.
