---
title: Architecture Documentation
status: Approved
version: 1.0.0
owner: Product Architecture
last_update: 2026-07-06
related_documents:
  - Architecture/Architecture_Principles.md
  - Architecture/Recommended_Project_Structure.md
  - Architecture/Event_Driven_Strategy.md
  - Backend/Backend_Architecture.md
  - Database/Database_Architecture.md
  - AI/AI_Development_Guidelines.md
---

# Architecture Documentation

## Objetivo

Centralizar as decisões e modelos arquiteturais do FUTSTATS.

Esta pasta deve servir como ponto de partida para pessoas desenvolvedoras, produto, QA, design, operações e IA entenderem como o sistema deve ser estruturado e evoluído.

## Arquitetura oficial

O FUTSTATS adota oficialmente:

- Modular Monolith;
- Clean Architecture;
- Domain-Driven Design tático;
- Domain Events;
- Event-driven internal architecture;
- Repository Pattern;
- CQRS leve quando fizer sentido;
- Supabase como infraestrutura;
- React Native como camada de experiência mobile.

A referência principal é:

```text
Architecture/Architecture_Principles.md
```

## Fluxo recomendado de leitura

Para entender a arquitetura do projeto, leia nesta ordem:

1. `README.md`
2. `Documentation_Index.md`
3. `Architecture/Architecture_Principles.md`
4. `Architecture/Recommended_Project_Structure.md`
5. `Backend/Backend_Architecture.md`
6. `Database/Database_Architecture.md`
7. `Architecture/Event_Driven_Strategy.md`
8. `Backend/Jobs_and_Queues.md`
9. `Domain/README.md`
10. `AI/AI_Development_Guidelines.md`

## Princípio central

Tudo no FUTSTATS pertence primeiro a um domínio de negócio.

Tecnologias como Supabase, React Native, Edge Functions, Storage, Realtime e bancos locais são ferramentas de implementação, não a fonte das regras do produto.

## Regras centrais

1. O uso casual nunca deve ser bloqueado por recursos avançados.
2. Dados técnicos devem ser persistidos com nomenclatura em inglês.
3. A experiência exibida ao usuário pode variar por tema, linguagem e contexto.
4. Histórico e legado são consequências do uso recorrente, não barreiras de entrada.
5. Toda regra deve preservar a integridade histórica de partidas, atletas e times.
6. Domínio não deve depender de infraestrutura.
7. Supabase não deve concentrar regra de negócio.
8. React Native não deve concentrar regra de negócio central.
9. Efeitos colaterais relevantes devem ser modelados por eventos.
10. Código compartilhado deve ser genérico e não esconder regras de domínio.

## Documentos principais

### `Architecture_Principles.md`

Documento mestre da arquitetura.

Define as regras obrigatórias para organização, dependências, domínios, eventos, Supabase, React Native, shared e evolução do projeto.

### `Recommended_Project_Structure.md`

Define a estrutura recomendada de pastas e módulos.

Deve ser usado como referência ao criar novos arquivos, módulos, casos de uso, repositórios e handlers.

### `Event_Driven_Strategy.md`

Define como eventos de domínio, event bus, handlers, queues e workers devem ser usados.

### `Backend/Backend_Architecture.md`

Define como o backend deve implementar os módulos, camadas e dependências.

### `Database/Database_Architecture.md`

Define o papel do banco de dados, RLS, constraints, snapshots, auditoria e limites de responsabilidade.

### `AI/AI_Development_Guidelines.md`

Define instruções específicas para desenvolvimento assistido por IA.

## Impactos

- Produto: define comportamento esperado e priorização técnica.
- UX: orienta fluxos simples, progressivos e coerentes.
- Backend: orienta serviços, casos de uso, eventos e invariantes.
- Database: orienta entidades, relacionamentos, RLS, índices e auditoria.
- API: orienta contratos estáveis e evolutivos.
- IA: fornece contexto claro para implementação assistida.

## Critérios de aceite arquitetural

Uma nova funcionalidade deve responder:

1. A qual domínio pertence?
2. Qual caso de uso representa?
3. Quais entidades ou value objects são afetados?
4. Precisa emitir eventos?
5. Precisa reagir a eventos?
6. Quais repositórios ou portas são necessários?
7. O que é regra de negócio e o que é infraestrutura?
8. O que precisa ser testável sem banco real?
9. Existe impacto histórico?
10. Existe documentação relacionada para atualizar?
