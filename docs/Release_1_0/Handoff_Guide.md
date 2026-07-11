---
title: Handoff Guide
status: Approved
version: 1.6.0
owner: Product Architecture
last_update: 2026-07-10
related_documents:
  - ../Documentation_Index.md
  - ./Source_of_Truth_Map.md
  - ../Architecture/Architecture_Principles.md
  - ../Database/Tables.md
  - ../Database/Relationships.md
  - ../Database/Entity_Relationships.md
---

# Handoff Guide

## Objetivo

Orientar qualquer pessoa ou IA que esteja entrando no projeto FUTSTATS pela primeira vez, reduzindo interpretação errada sobre fonte de verdade, fluxo de leitura e contrato técnico vigente.

## Leitura obrigatória

1. `README.md`
2. `Documentation_Index.md`
3. `Release_1_0/Source_of_Truth_Map.md`
4. `Architecture/Architecture_Principles.md`
5. `Product/Product_Overview.md`
6. `Product/Product_Vision.md`
7. `Product/Product_Principles.md`
8. `Domain/README.md`
9. `Database/Tables.md`
10. `Database/Relationships.md`
11. `Database/Entity_Relationships.md`
12. `Implementation/Backlog/Product_Backlog.md`
13. `Release_1_0/FINAL_README.md`

## Leitura contextual complementar

Ler quando o assunto exigir contexto de origem, recorte inicial, ideia futura ou decisão histórica:

1. `Product/Launch_Scope_Snapshot.md`
2. `Implementation/Data_Model/Launch_Snapshot_Data_Model.md`
3. `Future_Ideas/*.md`
4. documentos históricos de recorte inicial que ainda guardem contratos ou fluxos não migrados

## O que entender antes de codar

- O público casual é prioridade de adoção; o analítico é prioridade de profundidade e retenção.
- Social não é extra; é porta de entrada. Scout avançado não pode bloquear uso simples.
- Código, banco, APIs e enums usam inglês; a UI pode usar Technical, Várzea ou Resenha.
- Dados canônicos não dependem de texto de interface; a linguagem é resolvida por camada de i18n.
- Nem todo documento histórico de recorte inicial é descartável. Alguns ainda preservam detalhes únicos e devem ser tratados como material histórico útil até migração completa.
- Documento com origem em MVP não deve ser removido só pelo rótulo. Se ele ainda for a única fonte de uma regra, precisa ser preservado até a migração do conteúdo.

## Fonte da verdade

- **Governança documental**: `Documentation_Index.md`.
- **Mapa de fontes por assunto**: `Release_1_0/Source_of_Truth_Map.md`.
- **Arquitetura e princípios estruturais**: `Architecture/Architecture_Principles.md`.
- **Banco em alto nível**: `Database/Tables.md`, `Database/Relationships.md` e `Database/Entity_Relationships.md`.
- **Banco em detalhe**: `Implementation/Database/Table_Spec_*.md`.
- **APIs por domínio**: `API/*.md`.
- **Detalhamento técnico de endpoint**: `Implementation/API/Endpoint_Detail_*.md`.
- **Serviços de aplicação**: `Implementation/Services/*.md`.
- **Telas e UX**: `Frontend/Screens/*.md`.
- **Reutilização de componentes e blocos de interface**: `Frontend/Reusable_Building_Blocks.md`.
- **Layout do Stitch para React Native**: `Frontend/Stitch_Conversion_Guide.md`.
- **Decisões arquiteturais**: `ADR/`.
- **Ideias futuras ainda não fechadas**: `Future_Ideas/*.md`.

## Regras rápidas para não errar

- `Database/Tables.md` e arquivos correlatos mostram mapa, não substituem `Table_Spec_*`.
- Se houver conflito entre mapa de banco e especificação detalhada, prevalece `Implementation/Database/Table_Spec_*.md`.
- Tela não substitui API. API não substitui tabela. Cada camada define seu próprio contrato.
- `Future_Ideas/` não define regra vigente; serve para direção futura ainda não fechada.
- Documento histórico só pode ser removido quando o conteúdo único já estiver absorvido por fonte canônica melhor organizada.

## Decisões-chave

- **ADR 010**: entrada casual-first para o primeiro valor percebido.
- **ADR 011**: multi-modalidade (`FUTSAL`, `SOCIETY`, `FIELD`).
- **ADR 012**: identidade no Supabase Auth. `auth.users` é a conta e `public.users` referencia 1:1.
- **Stack**: React Native + Supabase.
- **Primeiro acesso autenticado**: depois do perfil mínimo, a pessoa escolhe entre criar time, entrar em um time ou explorar primeiro.
- **Pessoas**: `persons` é a identidade canônica. `users` é a presença autenticada no app. `players` é a identidade esportiva opcional.
- **Time**: pertencimento canônico fica em `team_members`; vínculo esportivo oficial fica em `team_players`; papéis de gestão ficam em `user_team_roles`.
- **Agenda x partida**: `scheduled_matches` representa planejamento e confirmação operacional; `matches` representa a execução real por quadro.
- **Interesse implícito**: buscas e navegação podem gerar sinais leves para sugestão de times e personalização futura da Home.

## Como usar a documentação

Para implementar ou revisar um módulo:

1. ler o domínio correspondente;
2. localizar a fonte canônica do assunto em `Source_of_Truth_Map.md`;
3. ler o mapa de banco em alto nível, quando existir impacto estrutural;
4. ler a `Table_Spec_*` correspondente para contrato real de persistência;
5. ler a especificação de API;
6. ler a especificação de UX e frontend;
7. ler serviços, endpoints detalhados, testes de aceite e ADRs relacionados;
8. consultar material histórico apenas quando a fonte canônica atual não cobrir toda a decisão.

## Atalho prático por tipo de mudança

### Se a mudança envolver banco

1. `Database/Tables.md`
2. `Database/Relationships.md`
3. `Database/Entity_Relationships.md`
4. `Implementation/Database/Table_Spec_*.md` da tabela afetada

### Se a mudança envolver fluxo de tela

1. `Frontend/Screens/*.md`
2. `API/*.md`
3. `Implementation/Database/Table_Spec_*.md`
4. `Frontend/Reusable_Building_Blocks.md`

### Se a mudança envolver regra de negócio

1. `Domain/*.md`
2. `API/*.md`
3. `Implementation/Services/*.md`
4. `ADR/` quando houver decisão arquitetural associada
