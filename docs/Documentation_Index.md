---
title: Documentation Index
status: Approved
version: 1.1.0
owner: Product Architecture
last_update: 2026-07-06
related_documents: []
---

# Documentation Index

## Objetivo

Servir como índice principal da documentação FUTSTATS.

Este arquivo deve ajudar pessoas e IA a entenderem rapidamente onde cada assunto está documentado e qual é a ordem recomendada de leitura.

## Leitura essencial

Para entender o projeto como um todo, leia nesta ordem:

1. `README.md`
2. `Documentation_Index.md`
3. `Product/Product_Overview.md`
4. `Product/Product_Vision.md`
5. `Product/Product_Principles.md`
6. `Domain/README.md`
7. `Architecture/README.md`
8. `Architecture/Architecture_Principles.md`
9. `Architecture/Recommended_Project_Structure.md`
10. `Backend/Backend_Architecture.md`
11. `Database/Database_Architecture.md`
12. `Architecture/Event_Driven_Strategy.md`
13. `Backend/Jobs_and_Queues.md`
14. `AI/AI_Development_Guidelines.md`
15. `Release_1_0/Handoff_Guide.md`

## Arquitetura oficial

A arquitetura oficial do FUTSTATS é definida pelos documentos:

- `Architecture/Architecture_Principles.md`
- `Architecture/Recommended_Project_Structure.md`
- `Architecture/Event_Driven_Strategy.md`
- `Backend/Backend_Architecture.md`
- `Backend/Jobs_and_Queues.md`
- `Database/Database_Architecture.md`
- `AI/AI_Development_Guidelines.md`

Esses documentos devem orientar implementação humana e assistida por IA.

## Principais áreas

- `Product/`: visão, princípios, pilares, roadmap, personas, UX de produto e decisões.
- `Domain/`: domínios de negócio.
- `Architecture/`: princípios arquiteturais, estrutura recomendada, eventos, runtime, integrações e decisões técnicas.
- `Backend/`: arquitetura backend, serviços, casos de uso, jobs, filas e validações.
- `Database/`: banco de dados, tabelas, relacionamentos, RLS, snapshots e estratégia.
- `Frontend/`: estrutura do app, telas, componentes e navegação.
- `API/`: contratos, endpoints e convenções.
- `UX/`: fluxos, experiência, acessibilidade e estados.
- `AI/`: usos, limites, segurança e diretrizes para desenvolvimento assistido por IA.
- `QA/`: testes, critérios de aceite e regressão.
- `Security/`: segurança, privacidade, RBAC e abuso.
- `Operations/`: deploy, observabilidade, backup e incidentes.
- `Monetization/`: planos, receita e estratégia comercial.
- `Analytics/`: métricas, eventos e North Star Metric.
- `ADR/`: decisões arquiteturais.
- `Implementation/`: especificações mais próximas de construção.
- `Release_1_0/`: handoff, validação e fechamento da documentação base.

## Documentos novos ou consolidados

### `Architecture/Architecture_Principles.md`

Documento mestre da arquitetura do FUTSTATS.

Define Modular Monolith, Clean Architecture, DDD tático, Domain Events, Supabase como infraestrutura, React Native como experiência e regras obrigatórias para evolução do projeto.

### `Architecture/Recommended_Project_Structure.md`

Define a estrutura recomendada de pastas, módulos, camadas, nomes e regras de importação.

### `AI/AI_Development_Guidelines.md`

Define como IAs devem gerar, alterar e revisar código do projeto respeitando a arquitetura oficial.

## Documentos substituídos por consolidação

O arquivo `sinergia_reacte_supabase_x_projeto.txt` foi tratado como artefato de análise e suas decisões relevantes foram incorporadas à documentação oficial.

Ele pode ser removido do repositório para evitar duplicidade documental.

## Regra para novas documentações

Todo novo documento deve:

1. ter frontmatter;
2. usar nomenclatura técnica em inglês quando se referir a código, banco, rotas e enums;
3. explicar regras e decisões em português;
4. apontar documentos relacionados;
5. evitar duplicar decisões que já existam em documentos oficiais;
6. atualizar este índice quando criar nova área ou documento relevante.
