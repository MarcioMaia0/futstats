---
title: Architecture Principles
status: Approved
version: 1.1.0
owner: Product Architecture
last_update: 2026-07-10
related_documents:
  - ./README.md
  - ./Event_Driven_Strategy.md
  - ./Recommended_Project_Structure.md
  - ../Backend/Backend_Architecture.md
  - ../Backend/Jobs_and_Queues.md
  - ../Documentation_Index.md
  - ../Release_1_0/Source_of_Truth_Map.md
  - ../Database/Tables.md
  - ../Database/Relationships.md
  - ../Database/Entity_Relationships.md
  - ../AI/AI_Development_Guidelines.md
---

# Architecture Principles

## Objetivo

Definir os principios arquiteturais oficiais do FUTSTATS para orientar desenvolvimento humano e assistido por IA.

Este documento deve ser tratado como a referencia principal para decisoes tecnicas estruturais do projeto.

## Decisao arquitetural oficial

O FUTSTATS adota uma arquitetura baseada em:

1. Modular Monolith.
2. Clean Architecture.
3. Domain-Driven Design tatico.
4. Domain Events.
5. Event-driven internal architecture.
6. Repository Pattern.
7. CQRS leve quando fizer sentido.
8. Supabase como infraestrutura, nao como nucleo de negocio.
9. React Native como camada de experiencia, nao como fonte de regra de negocio.

## Filosofia central

Tudo no FUTSTATS pertence primeiro a um dominio de negocio.

Tecnologias como Supabase, React Native, Edge Functions, Storage, Realtime, banco local, APIs e bibliotecas sao ferramentas para entregar os dominios, nao o centro da arquitetura.

## Regra documental complementar

- A governanca da documentacao comeca em `Documentation_Index.md`.
- A fonte correta de cada assunto deve ser localizada em `Release_1_0/Source_of_Truth_Map.md`.
- Para banco, os mapas de alto nivel ficam em `Database/`.
- O contrato detalhado de persistencia fica em `Implementation/Database/Table_Spec_*.md`.

## Dominios principais

Os dominios oficiais iniciais sao:

- Identity
- Teams
- Players
- Matches
- Statistics
- Social
- Referees
- Experience

Cada dominio deve conter suas proprias regras, casos de uso, entidades, eventos, contratos e testes.

## Regra de dependencia

As dependencias de codigo devem apontar para dentro.

Camadas internas nao devem conhecer detalhes externos.

Exemplos:

- Domain nao conhece Supabase.
- Domain nao conhece React Native.
- Domain nao conhece HTTP.
- Application nao deve depender diretamente de SDKs externos.
- Infrastructure implementa contratos definidos pelas camadas internas.
- Presentation apenas traduz entrada e saida.

## Camadas padrao por modulo

Cada modulo relevante deve seguir a estrutura:

```text
module/
  domain/
  application/
  infra/
  presentation/
```

### Domain

Contem o coracao do negocio.

Pode conter:

- entities
- value objects
- domain services
- domain events
- repository interfaces
- invariants
- business errors

Nao pode conter:

- Supabase SDK
- React Native
- HTTP controllers
- SQL direto
- chamadas de API externa
- logica de tela

### Application

Orquestra casos de uso.

Pode conter:

- use cases
- application services
- DTOs
- ports
- commands
- queries
- transaction boundaries

A camada de application coordena o fluxo, mas nao deve conter detalhes de infraestrutura.

### Infrastructure

Implementa detalhes tecnicos.

Pode conter:

- Supabase repositories
- storage clients
- external API clients
- queue adapters
- event bus implementations
- mappers
- database adapters
- auth provider adapters

Infrastructure deve obedecer contratos definidos por Domain ou Application.

### Presentation

Recebe entrada e entrega saida.

Pode conter:

- controllers
- routes
- request validators
- presenters
- API response mappers

Presentation nao deve conter regra de negocio.

## Modular Monolith

O FUTSTATS deve comecar como um monolito modular bem organizado.

Isso significa:

- um unico deploy principal;
- modulos separados por dominio;
- baixo acoplamento entre modulos;
- contratos explicitos;
- comunicacao por eventos quando houver efeitos colaterais;
- possibilidade futura de extrair modulos sem reescrever o sistema inteiro.

Microsservicos nao sao a arquitetura inicial recomendada.

## DDD tatico

O projeto deve usar DDD de forma pragmatica.

Conceitos recomendados:

- Entities
- Value Objects
- Aggregates quando necessario
- Domain Events
- Repositories
- Domain Services
- Ubiquitous Language

Evitar DDD cerimonial excessivo quando a regra for simples.

## Domain Events

Eventos representam fatos que ja aconteceram.

Exemplos:

- MatchCreated
- GoalRegistered
- MatchFinished
- PlayerLinkedToTeam
- RefereeReviewed
- PostPublished

Eventos devem ser disparados por casos de uso ou entidades, nao por triggers de banco como mecanismo principal de negocio.

## Comunicacao entre dominios

Dominios nao devem chamar diretamente detalhes internos de outros dominios.

Preferir:

```text
Use Case
  -> Domain Event
  -> Event Bus
  -> Handler de outro dominio
```

Exemplo:

```text
RegisterGoalUseCase
  -> GoalRegistered
  -> Statistics recalcula artilharia
  -> Social prepara card
  -> Experience concede XP
```

## Jobs e efeitos colaterais

Efeitos colaterais assincronos devem ser modelados como jobs ou handlers.

Exemplos:

- recalcular estatisticas;
- gerar cards;
- enviar notificacoes;
- atualizar rankings;
- processar denuncias;
- consolidar reputacao de arbitros.

Jobs devem ser idempotentes, rastreaveis e possuir retry quando criticos.

## Supabase

Supabase e uma escolha adequada para o FUTSTATS, mas deve ser tratado como infraestrutura.

Supabase pode ser usado para:

- Auth;
- PostgreSQL;
- Row Level Security;
- Storage;
- Realtime;
- Edge Functions;
- migrations;
- views;
- constraints;
- auditabilidade.

Supabase nao deve ser o lugar principal das regras de negocio.

### RLS

RLS deve proteger dados no banco.

RLS pode controlar:

- leitura;
- escrita;
- update;
- delete;
- isolamento por usuario, time ou papel.

RLS nao substitui regras de negocio da aplicacao.

Exemplo:

- RLS pode impedir que um usuario edite uma partida de outro time.
- Application decide se uma partida finalizada ha muito tempo ainda pode ser alterada.

### Triggers

Triggers devem ser usadas com cuidado.

Podem ser usadas para:

- timestamps tecnicos;
- auditoria;
- sincronizacao tecnica;
- criacao de perfil publico apos criacao de conta;
- consistencia simples e local.

Nao devem ser usadas como orquestrador principal de regras de negocio complexas.

### Edge Functions

Edge Functions podem executar tarefas tecnicas ou assincronas.

Elas podem implementar workers, integracoes e processamento de midia, mas devem ser acionadas a partir de eventos ou filas sempre que possivel.

## React Native

React Native e a camada de experiencia mobile.

Pode conter:

- UI;
- navegacao;
- estado local;
- cache;
- fila offline;
- i18n e modos de linguagem;
- integracao com compartilhamento nativo.

Nao deve conter regra de negocio central que precise ser preservada no backend.

## Offline-first

O FUTSTATS deve considerar conectividade instavel como cenario normal.

Recomendacoes:

- gerar UUIDs no client;
- registrar acoes offline como comandos;
- manter fila local de sincronizacao;
- sincronizar em segundo plano;
- usar idempotency keys;
- versionar registros sensiveis;
- resolver conflitos explicitamente.

## Repository Pattern

Casos de uso nao devem acessar Supabase diretamente.

Eles devem depender de interfaces.

Exemplo:

```text
MatchRepository
  -> SupabaseMatchRepository
```

Isso protege o dominio contra mudancas de tecnologia.

## CQRS leve

O FUTSTATS pode separar comandos e consultas quando houver ganho claro.

Commands alteram estado.  
Queries leem estado.

Essa separacao e especialmente util em:

- estatisticas;
- rankings;
- dashboards;
- feed;
- relatorios;
- snapshots.

Nao e obrigatorio usar CQRS completo em todo o sistema.

## Shared

Shared deve conter apenas codigo verdadeiramente generico.

Permitido:

- Result;
- Either;
- BaseError;
- DomainEvent base;
- UUID helpers;
- date helpers;
- logger abstractions;
- pagination;
- common value objects;
- event bus contracts.

Evitar colocar regras de negocio em shared.

Se algo so faz sentido no FUTSTATS, provavelmente pertence a um dominio.

Se algo so faz sentido em partidas, pertence a Matches.

## Testabilidade

Regras de dominio e casos de uso devem ser testaveis sem:

- banco real;
- Supabase;
- React Native;
- HTTP server;
- rede;
- storage externo.

Infrastructure deve ser substituivel por mocks, fakes ou in-memory repositories.

## Regras obrigatorias

1. Todo recurso nasce em um dominio.
2. Toda regra de negocio vive em Domain ou Application.
3. Infrastructure nao decide regra de negocio.
4. Presentation nao decide regra de negocio.
5. Supabase nao e o cerebro do sistema.
6. React Native nao e o cerebro do sistema.
7. Dominios se comunicam por eventos quando houver efeitos colaterais relevantes.
8. Shared nao pode virar deposito de codigo sem dono.
9. Casos de uso devem representar acoes claras do produto.
10. Toda decisao que impacta historico deve preservar rastreabilidade.

## Quando simplificar

Nem toda funcionalidade precisa de cerimonia completa.

Funcionalidades simples podem ter menos arquivos, desde que respeitem as fronteiras principais.

A arquitetura deve proteger o produto, nao sufocar a entrega.
