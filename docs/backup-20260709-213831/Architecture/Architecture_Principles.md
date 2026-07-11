---
title: Architecture Principles
status: Approved
version: 1.0.1
owner: Product Architecture
last_update: 2026-07-07
related_documents:
  - Architecture/README.md
  - Architecture/Event_Driven_Strategy.md
  - Architecture/Recommended_Project_Structure.md
  - Backend/Backend_Architecture.md
  - Database/Database_Architecture.md
  - Backend/Jobs_and_Queues.md
  - AI/AI_Development_Guidelines.md
---

# Architecture Principles

## Objetivo

Definir os princípios arquiteturais oficiais do FUTSTATS para orientar desenvolvimento humano e assistido por IA.

Este documento deve ser tratado como a referência principal para decisões técnicas estruturais do projeto.

## Decisão arquitetural oficial

O FUTSTATS adota uma arquitetura baseada em:

1. Modular Monolith.
2. Clean Architecture.
3. Domain-Driven Design tático.
4. Domain Events.
5. Event-driven internal architecture.
6. Repository Pattern.
7. CQRS leve quando fizer sentido.
8. Supabase como infraestrutura, não como núcleo de negócio.
9. React Native como camada de experiência, não como fonte de regra de negócio.

## Filosofia central

Tudo no FUTSTATS pertence primeiro a um domínio de negócio.

Tecnologias como Supabase, React Native, Edge Functions, Storage, Realtime, banco local, APIs e bibliotecas são ferramentas para entregar os domínios, não o centro da arquitetura.

## Domínios principais

Os domínios oficiais iniciais são:

- Identity
- Teams
- Players
- Matches
- Statistics
- Social
- Referees
- Experience

Cada domínio deve conter suas próprias regras, casos de uso, entidades, eventos, contratos e testes.

## Regra de dependência

As dependências de código devem apontar para dentro.

Camadas internas não devem conhecer detalhes externos.

Exemplos:

- Domain não conhece Supabase.
- Domain não conhece React Native.
- Domain não conhece HTTP.
- Application não deve depender diretamente de SDKs externos.
- Infrastructure implementa contratos definidos pelas camadas internas.
- Presentation apenas traduz entrada e saída.

## Camadas padrão por módulo

Cada módulo relevante deve seguir a estrutura:

```text
module/
  domain/
  application/
  infra/
  presentation/
```

### Domain

Contém o coração do negócio.

Pode conter:

- entities
- value objects
- domain services
- domain events
- repository interfaces
- invariants
- business errors

Não pode conter:

- Supabase SDK
- React Native
- HTTP controllers
- SQL direto
- chamadas de API externa
- lógica de tela

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

A camada de application coordena o fluxo, mas não deve conter detalhes de infraestrutura.

### Infrastructure

Implementa detalhes técnicos.

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

Recebe entrada e entrega saída.

Pode conter:

- controllers
- routes
- request validators
- presenters
- API response mappers

Presentation não deve conter regra de negócio.

## Modular Monolith

O FUTSTATS deve começar como um monólito modular bem organizado.

Isso significa:

- um único deploy principal;
- módulos separados por domínio;
- baixo acoplamento entre módulos;
- contratos explícitos;
- comunicação por eventos quando houver efeitos colaterais;
- possibilidade futura de extrair módulos sem reescrever o sistema inteiro.

Microsserviços não são a arquitetura inicial recomendada.

## DDD tático

O projeto deve usar DDD de forma pragmática.

Conceitos recomendados:

- Entities
- Value Objects
- Aggregates quando necessário
- Domain Events
- Repositories
- Domain Services
- Ubiquitous Language

Evitar DDD cerimonial excessivo quando a regra for simples.

## Domain Events

Eventos representam fatos que já aconteceram.

Exemplos:

- MatchCreated
- GoalRegistered
- MatchFinished
- PlayerLinkedToTeam
- RefereeReviewed
- PostPublished

Eventos devem ser disparados por casos de uso ou entidades, não por triggers de banco como mecanismo principal de negócio.

## Comunicação entre domínios

Domínios não devem chamar diretamente detalhes internos de outros domínios.

Preferir:

```text
Use Case
  -> Domain Event
  -> Event Bus
  -> Handler de outro domínio
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

Efeitos colaterais assíncronos devem ser modelados como jobs ou handlers.

Exemplos:

- recalcular estatísticas;
- gerar cards;
- enviar notificações;
- atualizar rankings;
- processar denúncias;
- consolidar reputação de árbitros.

Jobs devem ser idempotentes, rastreáveis e possuir retry quando críticos.

## Supabase

Supabase é uma escolha adequada para o FUTSTATS, mas deve ser tratado como infraestrutura.

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

Supabase não deve ser o lugar principal das regras de negócio.

### RLS

RLS deve proteger dados no banco.

RLS pode controlar:

- leitura;
- escrita;
- update;
- delete;
- isolamento por usuário, time ou papel.

RLS não substitui regras de negócio da aplicação.

Exemplo:

- RLS pode impedir que um usuário edite uma partida de outro time.
- Application decide se uma partida finalizada há muito tempo ainda pode ser alterada.

### Triggers

Triggers devem ser usadas com cuidado.

Podem ser usadas para:

- timestamps técnicos;
- auditoria;
- sincronização técnica;
- criação de perfil público após criação de conta;
- consistência simples e local.

Não devem ser usadas como orquestrador principal de regras de negócio complexas.

### Edge Functions

Edge Functions podem executar tarefas técnicas ou assíncronas.

Elas podem implementar workers, integrações e processamento de mídia, mas devem ser acionadas a partir de eventos ou filas sempre que possível.

## React Native

React Native é a camada de experiência mobile.

Pode conter:

- UI;
- navegação;
- estado local;
- cache;
- fila offline;
- i18n e modos de linguagem;
- integração com compartilhamento nativo.

Não deve conter regra de negócio central que precise ser preservada no backend.

## Offline-first

O FUTSTATS deve considerar conectividade instável como cenário normal.

Recomendações:

- gerar UUIDs no client;
- registrar ações offline como comandos;
- manter fila local de sincronização;
- sincronizar em segundo plano;
- usar idempotency keys;
- versionar registros sensíveis;
- resolver conflitos explicitamente.

## Repository Pattern

Casos de uso não devem acessar Supabase diretamente.

Eles devem depender de interfaces.

Exemplo:

```text
MatchRepository
  -> SupabaseMatchRepository
```

Isso protege o domínio contra mudanças de tecnologia.

## CQRS leve

O FUTSTATS pode separar comandos e consultas quando houver ganho claro.

Commands alteram estado.  
Queries leem estado.

Essa separação é especialmente útil em:

- estatísticas;
- rankings;
- dashboards;
- feed;
- relatórios;
- snapshots.

Não é obrigatório usar CQRS completo em todo o sistema.

## Shared

Shared deve conter apenas código verdadeiramente genérico.

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

Evitar colocar regras de negócio em shared.

Se algo só faz sentido no FUTSTATS, provavelmente pertence a um domínio.

Se algo só faz sentido em partidas, pertence a Matches.

## Testabilidade

Regras de domínio e casos de uso devem ser testáveis sem:

- banco real;
- Supabase;
- React Native;
- HTTP server;
- rede;
- storage externo.

Infrastructure deve ser substituível por mocks, fakes ou in-memory repositories.

## Regras obrigatórias

1. Todo recurso nasce em um domínio.
2. Toda regra de negócio vive em Domain ou Application.
3. Infrastructure não decide regra de negócio.
4. Presentation não decide regra de negócio.
5. Supabase não é o cérebro do sistema.
6. React Native não é o cérebro do sistema.
7. Domínios se comunicam por eventos quando houver efeitos colaterais relevantes.
8. Shared não pode virar depósito de código sem dono.
9. Casos de uso devem representar ações claras do produto.
10. Toda decisão que impacta histórico deve preservar rastreabilidade.

## Quando simplificar

Nem toda funcionalidade precisa de cerimônia completa.

Funcionalidades simples podem ter menos arquivos, desde que respeitem as fronteiras principais.

A arquitetura deve proteger o produto, não sufocar a entrega.
