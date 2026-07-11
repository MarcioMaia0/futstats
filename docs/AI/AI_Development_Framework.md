---
title: AI Development Framework
status: Approved
version: 1.1.0
owner: Product Architecture
last_update: 2026-07-10
related_documents:
  - ./AI_Development_Guidelines.md
  - ./Agent_Roles.md
  - ./Agent_Workflows.md
  - ./Decision_Protocols.md
  - ./Code_Generation_Checklist.md
  - ./Review_Checklist.md
  - ./Prompt_Playbook.md
  - ../Documentation_Index.md
  - ../Release_1_0/Source_of_Truth_Map.md
  - ../Architecture/Architecture_Principles.md
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

1. `Documentation_Index.md`
2. `Release_1_0/Source_of_Truth_Map.md`
3. `Architecture/Architecture_Principles.md`
4. `Architecture/Recommended_Project_Structure.md`
5. `Backend/Backend_Architecture.md`
6. `Architecture/Event_Driven_Strategy.md`
7. `AI/AI_Development_Guidelines.md`
8. o documento do dominio afetado em `Domain/`
9. os documentos especificos da area afetada

## Regra de navegacao tecnica

Quando houver impacto de banco:

1. consultar primeiro os mapas em `Database/Tables.md`, `Database/Relationships.md` e `Database/Entity_Relationships.md`;
2. consultar depois a `Implementation/Database/Table_Spec_*.md` correspondente;
3. so entao propor ajuste em API, servico, tela, job ou projecao derivada.

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
2. `Documentation_Index.md`
3. `Release_1_0/Source_of_Truth_Map.md`
4. Architecture Principles
5. Regras de dominio
6. Seguranca e privacidade
7. Integridade historica dos dados
8. Simplicidade de produto
9. Preferencias de implementacao

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
