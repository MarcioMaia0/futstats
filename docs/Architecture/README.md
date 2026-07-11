---
title: Architecture Documentation
status: Approved
version: 1.1.0
owner: Product Architecture
last_update: 2026-07-10
related_documents:
  - ./Architecture_Principles.md
  - ./Recommended_Project_Structure.md
  - ./Event_Driven_Strategy.md
  - ../Backend/Backend_Architecture.md
  - ../Documentation_Index.md
  - ../Release_1_0/Source_of_Truth_Map.md
  - ../Database/Tables.md
  - ../Database/Relationships.md
  - ../Database/Entity_Relationships.md
  - ../AI/AI_Development_Guidelines.md
---

# Architecture Documentation

## Objetivo

Centralizar as decisoes e modelos arquiteturais do FUTSTATS.

Esta pasta deve servir como ponto de partida para pessoas desenvolvedoras, produto, QA, design, operacoes e IA entenderem como o sistema deve ser estruturado e evoluir.

## Arquitetura oficial

O FUTSTATS adota oficialmente:

- Modular Monolith;
- Clean Architecture;
- Domain-Driven Design tatico;
- Domain Events;
- Event-driven internal architecture;
- Repository Pattern;
- CQRS leve quando fizer sentido;
- Supabase como infraestrutura;
- React Native como camada de experiencia mobile.

A referencia principal e:

```text
Architecture/Architecture_Principles.md
```

## Fluxo recomendado de leitura

Para entender a arquitetura do projeto, leia nesta ordem:

1. `README.md`
2. `Documentation_Index.md`
3. `Release_1_0/Source_of_Truth_Map.md`
4. `Architecture/Architecture_Principles.md`
5. `Architecture/Recommended_Project_Structure.md`
6. `Backend/Backend_Architecture.md`
7. `Architecture/Event_Driven_Strategy.md`
8. `Database/Tables.md`
9. `Database/Relationships.md`
10. `Database/Entity_Relationships.md`
11. `Backend/Jobs_and_Queues.md`
12. `Domain/README.md`
13. `AI/AI_Development_Guidelines.md`

## Regra de leitura para banco

- Os arquivos em `Database/` funcionam como mapa estrutural de alto nivel.
- O contrato real de colunas, enums, constraints e semantica de persistencia vive em `Implementation/Database/Table_Spec_*.md`.
- `Database/Database_Architecture.md`, quando ainda aparecer em material antigo, deve ser tratado como apoio historico e nao como fonte principal do schema.

## Principio central

Tudo no FUTSTATS pertence primeiro a um dominio de negocio.

Tecnologias como Supabase, React Native, Edge Functions, Storage, Realtime e bancos locais sao ferramentas de implementacao, nao a fonte das regras do produto.

## Regras centrais

1. O uso casual nunca deve ser bloqueado por recursos avancados.
2. Dados tecnicos devem ser persistidos com nomenclatura em ingles.
3. A experiencia exibida ao usuario pode variar por tema, linguagem e contexto.
4. Historico e legado sao consequencias do uso recorrente, nao barreiras de entrada.
5. Toda regra deve preservar a integridade historica de partidas, atletas e times.
6. Dominio nao deve depender de infraestrutura.
7. Supabase nao deve concentrar regra de negocio.
8. React Native nao deve concentrar regra de negocio central.
9. Efeitos colaterais relevantes devem ser modelados por eventos.
10. Codigo compartilhado deve ser generico e nao esconder regras de dominio.

## Documentos principais

### `Architecture_Principles.md`

Documento mestre da arquitetura.

Define as regras obrigatorias para organizacao, dependencias, dominios, eventos, Supabase, React Native, shared e evolucao do projeto.

### `Recommended_Project_Structure.md`

Define a estrutura recomendada de pastas e modulos.

Deve ser usado como referencia ao criar novos arquivos, modulos, casos de uso, repositorios e handlers.

### `Event_Driven_Strategy.md`

Define como eventos de dominio, event bus, handlers, queues e workers devem ser usados.

### `Backend/Backend_Architecture.md`

Define como o backend deve implementar os modulos, camadas e dependencias.

### `Database/Tables.md`, `Database/Relationships.md` e `Database/Entity_Relationships.md`

Definem o mapa estrutural de alto nivel do banco e o relacionamento entre entidades.

### `Implementation/Database/Table_Spec_*.md`

Define o contrato detalhado de cada tabela e deve prevalecer quando houver conflito com material mais resumido.

### `AI/AI_Development_Guidelines.md`

Define instrucoes especificas para desenvolvimento assistido por IA.

## Impactos

- Produto: define comportamento esperado e priorizacao tecnica.
- UX: orienta fluxos simples, progressivos e coerentes.
- Backend: orienta servicos, casos de uso, eventos e invariantes.
- Database: orienta entidades, relacionamentos, RLS, indices e auditoria.
- API: orienta contratos estaveis e evolutivos.
- IA: fornece contexto claro para implementacao assistida.

## Criterios de aceite arquitetural

Uma nova funcionalidade deve responder:

1. A qual dominio pertence?
2. Qual caso de uso representa?
3. Quais entidades ou value objects sao afetados?
4. Precisa emitir eventos?
5. Precisa reagir a eventos?
6. Quais repositorios ou portas sao necessarios?
7. O que e regra de negocio e o que e infraestrutura?
8. O que precisa ser testavel sem banco real?
9. Existe impacto historico?
10. Existe documentacao relacionada para atualizar?
