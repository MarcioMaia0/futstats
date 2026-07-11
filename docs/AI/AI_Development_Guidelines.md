---
title: AI Development Guidelines
status: Approved
version: 1.1.0
owner: Product Architecture
last_update: 2026-07-10
related_documents:
  - ../Documentation_Index.md
  - ../Release_1_0/Source_of_Truth_Map.md
  - ../Architecture/Architecture_Principles.md
  - ../Architecture/Recommended_Project_Structure.md
  - ../Backend/Backend_Architecture.md
  - ../Database/Tables.md
  - ../Database/Relationships.md
  - ../Database/Entity_Relationships.md
  - ../Architecture/Event_Driven_Strategy.md
---

# AI Development Guidelines

## Objetivo

Orientar IAs e desenvolvedores humanos na criacao, alteracao e revisao de codigo do FUTSTATS.

Este documento deve ser lido antes de gerar codigo para o projeto.

## Regra principal

Nunca comece pela tecnologia.

Comece perguntando:

```text
A qual dominio isso pertence?
```

Depois pergunte:

```text
Qual caso de uso representa essa acao?
```

## Arquitetura obrigatoria

O FUTSTATS usa:

- Modular Monolith;
- Clean Architecture;
- DDD tatico;
- Domain Events;
- Repository Pattern;
- Supabase como infraestrutura;
- React Native como camada de experiencia.

## Ordem minima de consulta

Antes de criar ou alterar codigo relevante, a IA deve consultar nesta ordem:

1. `Documentation_Index.md`
2. `Release_1_0/Source_of_Truth_Map.md`
3. `Architecture/Architecture_Principles.md`
4. `Backend/Backend_Architecture.md`
5. `Architecture/Event_Driven_Strategy.md`
6. o documento do dominio afetado em `Domain/`
7. a API da area afetada em `API/`
8. os mapas de banco em `Database/Tables.md`, `Database/Relationships.md` e `Database/Entity_Relationships.md`, quando houver impacto estrutural
9. a `Implementation/Database/Table_Spec_*.md` correspondente, quando houver impacto em persistencia
10. a tela ou fluxo correspondente em `Frontend/Screens/`, quando houver impacto de superficie

## Regra para banco

- `Database/Tables.md`, `Database/Relationships.md` e `Database/Entity_Relationships.md` sao mapas de alto nivel.
- A verdade detalhada de colunas, enums, constraints, checks, unicidade e semantica de persistencia esta nas `Implementation/Database/Table_Spec_*.md`.
- `Database/Database_Architecture.md`, quando citado em material legado, nao substitui os mapas nem as `Table_Spec_*`.

## Antes de criar codigo

Toda IA deve identificar:

1. Dominio afetado.
2. Caso de uso principal.
3. Entidades envolvidas.
4. Value objects necessarios.
5. Repositorios necessarios.
6. Eventos emitidos.
7. Handlers afetados.
8. Tabelas envolvidas.
9. Regras de autorizacao.
10. Testes necessarios.

## Estrutura obrigatoria

Novas funcionalidades devem seguir:

```text
modules/{module}/
  domain/
  application/
  infra/
  presentation/
```

## O que nunca fazer

Nao colocar regra de negocio em:

- controllers;
- routes;
- Supabase repository;
- SQL trigger complexa;
- React Native screen;
- componentes visuais;
- arquivos shared genericos;
- migration sem documentacao;
- Edge Function isolada sem caso de uso.

## Supabase

Supabase deve ser usado por adaptadores de infraestrutura.

Use cases nao devem chamar Supabase diretamente.

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

React Native nao deve conter regra central de negocio.

Pode conter:

- tela;
- navegacao;
- estado de UI;
- cache;
- fila offline;
- i18n;
- integracao com Share API;
- experiencia visual.

Nao deve decidir sozinho regras historicas ou criticas do produto.

## Eventos

Quando uma acao gera efeitos colaterais em outros dominios, usar Domain Events.

Exemplo:

```text
GoalRegistered
```

Pode gerar:

- recalcular estatisticas;
- atualizar ranking;
- gerar card;
- atualizar feed;
- enviar notificacao;
- conceder experiencia.

A IA nao deve criar uma funcao gigante que faca tudo em sequencia dentro do mesmo use case.

## Shared

Usar shared apenas para elementos genericos.

Permitido:

- Result;
- DomainEvent base;
- EventBus;
- logger;
- pagination;
- UUID helper;
- date helper;
- base errors.

Nao permitido:

- Match rules;
- Player rules;
- Team rules;
- Statistics rules;
- Social rules.

## Repository Pattern

Para persistencia, criar contrato interno e implementacao externa.

Exemplo:

```text
modules/matches/domain/repositories/MatchRepository.ts
modules/matches/infra/repositories/SupabaseMatchRepository.ts
```

## Value Objects

Usar value objects quando houver validacao ou comportamento recorrente.

Exemplos:

- Score;
- Email;
- PlayerName;
- MatchStatus;
- TeamRole;
- MetricKey;
- LanguageMode.

## Commands e Queries

Usar commands para alteracoes.

Usar queries para leitura.

Separar quando o recurso tiver leitura complexa, estatisticas, rankings ou dashboards.

## Banco de dados

Ao propor tabelas ou migrations:

1. Usar nomes tecnicos em ingles.
2. Usar UUIDs.
3. Considerar auditabilidade.
4. Considerar RLS.
5. Considerar indices.
6. Preservar historico quando impactar partidas, jogadores ou estatisticas.
7. Nao colocar regra de negocio complexa em triggers.

## RLS

RLS e obrigatorio para proteger dados sensiveis.

Mas RLS nao substitui regras de aplicacao.

A IA deve sugerir ambos quando necessario:

- politica de acesso no banco;
- validacao de negocio no use case.

## Offline-first

Ao criar fluxo relacionado a partidas, gols, jogadores ou placar, considerar conectividade instavel.

Recomendacoes:

- UUID gerado no cliente;
- idempotency_key;
- fila local;
- sincronizacao posterior;
- tratamento de conflito;
- status de sync.

## Testes

Toda funcionalidade relevante deve sugerir testes para:

- dominio;
- use case;
- repository quando aplicavel;
- handler de evento;
- controller quando aplicavel.

Domain e Application devem ser testaveis sem Supabase real.

## Checklist antes de finalizar uma resposta de codigo

A IA deve verificar:

1. O codigo respeita o dominio correto?
2. Ha regra de negocio fora do lugar?
3. O use case depende de interface, nao de SDK?
4. Eventos foram usados quando ha efeitos colaterais?
5. Shared nao recebeu regra especifica?
6. Supabase ficou em infra?
7. React Native ficou como experiencia?
8. Ha testes sugeridos?
9. Ha impacto em documentacao?
10. Ha impacto em banco/RLS?

## Regra final

A IA deve proteger a arquitetura mesmo quando o pedido do usuario for apenas "crie uma funcao".

Toda funcao nova deve nascer no lugar certo, com responsabilidade clara e sem acoplamento desnecessario.
