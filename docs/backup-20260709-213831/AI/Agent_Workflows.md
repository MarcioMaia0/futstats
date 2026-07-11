---
title: Agent Workflows
status: Approved
version: 1.0.0
owner: Product Architecture
last_update: 2026-07-06
related_documents:
  - AI/AI_Development_Framework.md
  - AI/Agent_Roles.md
  - AI/Decision_Protocols.md
---

# Agent Workflows

## Objetivo

Definir como agentes de IA devem colaborar em tarefas de desenvolvimento, revisao, refatoracao e documentacao do FUTSTATS.

## Workflow padrao de feature

1. Technical Lead entende a solicitacao.
2. Product Reviewer valida valor e escopo.
3. Architecture Guardian identifica impacto arquitetural.
4. Domain Expert valida regras de negocio.
5. Database Designer avalia impacto em persistencia.
6. Backend Developer define use cases, eventos e contratos.
7. Frontend Developer define impacto na experiencia.
8. Security Reviewer valida autenticacao, autorizacao e privacidade.
9. QA Engineer define cenarios de teste.
10. Documentation Maintainer atualiza documentacao e indices.

## Workflow de bug fix

1. Technical Lead classifica o bug.
2. Consistency Guardian verifica se ha divergencia entre codigo e documentacao.
3. Domain Expert identifica se o bug viola regra de negocio.
4. Backend ou Frontend Developer corrige no local adequado.
5. QA Engineer cria teste de regressao.
6. Documentation Maintainer atualiza documentos se o comportamento esperado mudou.

## Workflow de refatoracao

1. Technical Lead define escopo e limites.
2. Architecture Guardian valida objetivo arquitetural.
3. Consistency Guardian identifica duplicacoes e inconsistencias.
4. Desenvolvedor responsavel refatora sem alterar comportamento.
5. QA Engineer valida testes existentes.
6. Documentation Maintainer atualiza estrutura documentada se necessario.

## Workflow de banco de dados

1. Domain Expert valida necessidade de dado.
2. Database Designer projeta tabela, relacao, indices, constraints e RLS.
3. Backend Developer ajusta repositories e mappers.
4. Security Reviewer revisa RLS e exposicao.
5. QA Engineer define testes de persistencia e permissao.
6. Documentation Maintainer atualiza documentos de banco.

## Workflow de evento de dominio

1. Domain Expert valida se o evento representa um fato ocorrido.
2. Architecture Guardian valida desacoplamento entre dominios.
3. Backend Developer cria evento e handlers.
4. Jobs/Queues sao definidos se houver processamento assincrono.
5. QA Engineer testa idempotencia e falhas.
6. Documentation Maintainer atualiza catalogo de eventos.

## Workflow de revisao de PR

1. Architecture Guardian revisa estrutura.
2. Domain Expert revisa regras.
3. Security Reviewer revisa acesso e dados.
4. QA Engineer revisa testes.
5. Consistency Guardian revisa nomes e documentacao.
6. Documentation Maintainer confirma atualizacao documental.

## Modos permitidos

### Discovery

Analisar apenas.

### Design

Propor sem implementar.

### Development

Implementar seguindo os documentos oficiais.

### Review

Revisar sem criar novas funcionalidades.

### Refactor

Melhorar estrutura sem mudar comportamento.

### Documentation

Criar ou atualizar documentacao.

## Regra anti-atalho

Nenhum agente deve pular diretamente para codigo quando a tarefa altera dominio, arquitetura, banco, seguranca ou eventos.
