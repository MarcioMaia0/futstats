---
title: AI Development Framework
status: Approved
version: 1.0.0
owner: Product Architecture
last_update: 2026-07-06
related_documents:
  - AI/AI_Development_Guidelines.md
  - AI/Agent_Roles.md
  - AI/Agent_Workflows.md
  - AI/Decision_Protocols.md
  - AI/Code_Generation_Checklist.md
  - AI/Review_Checklist.md
  - AI/Prompt_Playbook.md
  - Architecture/Architecture_Principles.md
---

# AI Development Framework

## Objetivo

Definir como pessoas e IAs devem colaborar no desenvolvimento do FUTSTATS.

Este documento e a referencia principal para desenvolvimento assistido por IA. Ele organiza papeis, fluxos, protocolos, checklists e limites para que qualquer geracao de codigo ou documentacao siga a arquitetura oficial do projeto.

## Principio central

IAs devem acelerar o desenvolvimento sem degradar arquitetura, dominio, seguranca ou documentacao.

Velocidade so e aceitavel quando preserva consistencia.

## Documentos obrigatorios

Antes de criar ou alterar codigo relevante, uma IA deve consultar:

1. `Architecture/Architecture_Principles.md`
2. `Architecture/Recommended_Project_Structure.md`
3. `Backend/Backend_Architecture.md`
4. `Database/Database_Architecture.md`
5. `Architecture/Event_Driven_Strategy.md`
6. `AI/AI_Development_Guidelines.md`
7. o documento do dominio afetado em `Domain/`
8. os documentos especificos da area afetada

## Componentes do framework

### Agent Roles

Define os papeis especializados que uma IA pode assumir.

### Agent Workflows

Define como os agentes colaboram durante discovery, design, desenvolvimento, revisao, refatoracao e documentacao.

### Decision Protocols

Define perguntas obrigatorias antes de criar codigo, alterar banco, introduzir eventos, adicionar dependencias ou modificar documentacao.

### Code Generation Checklist

Checklist obrigatorio antes de aceitar codigo gerado por IA.

### Review Checklist

Checklist para revisar mudancas tecnicas, arquiteturais, seguranca, QA e documentacao.

### Prompt Playbook

Modelos de prompts para tarefas recorrentes.

## Modos de trabalho

### Discovery

A IA apenas analisa contexto, documentos, codigo existente e riscos. Nao cria codigo.

### Design

A IA propoe estrutura, fluxo, contratos, entidades, use cases, eventos e impactos. Ainda nao implementa.

### Development

A IA gera ou altera codigo seguindo os documentos oficiais.

### Review

A IA revisa codigo, documentacao, arquitetura e riscos. Nao cria novas features.

### Refactor

A IA reorganiza codigo sem alterar comportamento esperado.

### Documentation

A IA cria ou atualiza documentacao, indices e rastreabilidade.

## Hierarquia de decisao

Quando houver conflito entre agentes ou sugestoes, prevalece esta ordem:

1. Documentacao oficial aprovada
2. Architecture Principles
3. Regras de dominio
4. Seguranca e privacidade
5. Integridade historica dos dados
6. Simplicidade de produto
7. Preferencias de implementacao

## Regra de ouro

A IA nunca deve assumir que a tecnologia define o produto.

No FUTSTATS, o dominio define o comportamento. Tecnologia implementa o comportamento.

## Resultado esperado

Toda contribuicao assistida por IA deve:

- respeitar dominios;
- preservar Clean Architecture;
- manter Supabase como infraestrutura;
- evitar regra de negocio em banco, controllers ou adapters;
- emitir eventos quando houver efeitos colaterais entre dominios;
- atualizar testes e documentacao quando necessario;
- ser simples de revisar por humanos.
