---
title: AI Development Guidelines
status: Approved
version: 1.0.0
owner: Product Architecture
last_update: 2026-07-06
related_documents:
  - Architecture/Architecture_Principles.md
  - Architecture/Recommended_Project_Structure.md
  - Backend/Backend_Architecture.md
  - Database/Database_Architecture.md
  - Architecture/Event_Driven_Strategy.md
---

# AI Development Guidelines

## Objetivo

Orientar IAs e desenvolvedores humanos na criação, alteração e revisão de código do FUTSTATS.

Este documento deve ser lido antes de gerar código para o projeto.

## Regra principal

Nunca comece pela tecnologia.

Comece perguntando:

```text
A qual domínio isso pertence?
```

Depois pergunte:

```text
Qual caso de uso representa essa ação?
```

## Arquitetura obrigatória

O FUTSTATS usa:

- Modular Monolith;
- Clean Architecture;
- DDD tático;
- Domain Events;
- Repository Pattern;
- Supabase como infraestrutura;
- React Native como camada de experiência.

## Antes de criar código

Toda IA deve identificar:

1. Domínio afetado.
2. Caso de uso principal.
3. Entidades envolvidas.
4. Value objects necessários.
5. Repositórios necessários.
6. Eventos emitidos.
7. Handlers afetados.
8. Tabelas envolvidas.
9. Regras de autorização.
10. Testes necessários.

## Estrutura obrigatória

Novas funcionalidades devem seguir:

```text
modules/{module}/
  domain/
  application/
  infra/
  presentation/
```

## O que nunca fazer

Não colocar regra de negócio em:

- controllers;
- routes;
- Supabase repository;
- SQL trigger complexa;
- React Native screen;
- componentes visuais;
- arquivos shared genéricos;
- migration sem documentação;
- Edge Function isolada sem caso de uso.

## Supabase

Supabase deve ser usado por adaptadores de infraestrutura.

Use cases não devem chamar Supabase diretamente.

Errado:

```text
RegisterGoalUseCase -> supabase.from('match_goals').insert(...)
```

Correto:

```text
RegisterGoalUseCase -> MatchRepository.save(match)
SupabaseMatchRepository -> supabase.from(...)
```

## React Native

React Native não deve conter regra central de negócio.

Pode conter:

- tela;
- navegação;
- estado de UI;
- cache;
- fila offline;
- i18n;
- integração com Share API;
- experiência visual.

Não deve decidir sozinho regras históricas ou críticas do produto.

## Eventos

Quando uma ação gera efeitos colaterais em outros domínios, usar Domain Events.

Exemplo:

```text
GoalRegistered
```

Pode gerar:

- recalcular estatísticas;
- atualizar ranking;
- gerar card;
- atualizar feed;
- enviar notificação;
- conceder experiência.

A IA não deve criar uma função gigante que faça tudo em sequência dentro do mesmo use case.

## Shared

Usar shared apenas para elementos genéricos.

Permitido:

- Result;
- DomainEvent base;
- EventBus;
- logger;
- pagination;
- UUID helper;
- date helper;
- base errors.

Não permitido:

- Match rules;
- Player rules;
- Team rules;
- Statistics rules;
- Social rules.

## Repository Pattern

Para persistência, criar contrato interno e implementação externa.

Exemplo:

```text
modules/matches/domain/repositories/MatchRepository.ts
modules/matches/infra/repositories/SupabaseMatchRepository.ts
```

## Value Objects

Usar value objects quando houver validação ou comportamento recorrente.

Exemplos:

- Score;
- Email;
- PlayerName;
- MatchStatus;
- TeamRole;
- MetricKey;
- LanguageMode.

## Commands e Queries

Usar commands para alterações.

Usar queries para leitura.

Separar quando o recurso tiver leitura complexa, estatísticas, rankings ou dashboards.

## Banco de dados

Ao propor tabelas ou migrations:

1. Usar nomes técnicos em inglês.
2. Usar UUIDs.
3. Considerar auditabilidade.
4. Considerar RLS.
5. Considerar índices.
6. Preservar histórico quando impactar partidas, jogadores ou estatísticas.
7. Não colocar regra de negócio complexa em triggers.

## RLS

RLS é obrigatório para proteger dados sensíveis.

Mas RLS não substitui regras de aplicação.

A IA deve sugerir ambos quando necessário:

- política de acesso no banco;
- validação de negócio no use case.

## Offline-first

Ao criar fluxo relacionado a partidas, gols, jogadores ou placar, considerar conectividade instável.

Recomendações:

- UUID gerado no cliente;
- idempotency_key;
- fila local;
- sincronização posterior;
- tratamento de conflito;
- status de sync.

## Testes

Toda funcionalidade relevante deve sugerir testes para:

- domínio;
- use case;
- repository quando aplicável;
- handler de evento;
- controller quando aplicável.

Domain e Application devem ser testáveis sem Supabase real.

## Checklist antes de finalizar uma resposta de código

A IA deve verificar:

1. O código respeita o domínio correto?
2. Há regra de negócio fora do lugar?
3. O use case depende de interface, não de SDK?
4. Eventos foram usados quando há efeitos colaterais?
5. Shared não recebeu regra específica?
6. Supabase ficou em infra?
7. React Native ficou como experiência?
8. Há testes sugeridos?
9. Há impacto em documentação?
10. Há impacto em banco/RLS?

## Regra final

A IA deve proteger a arquitetura mesmo quando o pedido do usuário for apenas "crie uma função".

Toda função nova deve nascer no lugar certo, com responsabilidade clara e sem acoplamento desnecessário.
