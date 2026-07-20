---
title: Handoff Guide
status: Approved
version: 1.9.0
owner: Product Architecture
last_update: 2026-07-20
related_documents:
  - ../Documentation_Index.md
  - ./Current_Project_Status.md
  - ./Source_of_Truth_Map.md
  - ../Architecture/Architecture_Principles.md
  - ../Database/Tables.md
  - ../Database/Relationships.md
  - ../Database/Entity_Relationships.md
---

# Handoff Guide

## AtualizaÃ§Ã£o de estado em 2026-07-20

O estado atual consolidado está em `Current_Project_Status.md` e deve ser a primeira referência para retomar o desenvolvimento.

Resumo operacional:

- app mobile em `apps/mobile`, com React Native + Expo + Supabase remoto;
- projeto Supabase remoto em uso: `vjivzajsnbhunnbacrgh`;
- MCP do Supabase jÃ¡ foi usado para aplicar e verificar migrations recentes;
- autenticaÃ§Ã£o por e-mail/senha, Google OAuth e login por identificador estÃ£o implementados;
- criaÃ§Ã£o de conta normaliza telefone com DDD quando informado;
- avatar do provider social Ã© copiado para o bucket `user-avatars` e exibido no app com fallback;
- Create Team Wizard cria time e pode ser aberto por `?wizardteam=true`;
- Team Settings hidrata e salva dados reais, incluindo modalidades, mÃºltiplas quadras e quantidade padrÃ£o de quadros por modalidade;
- Team Roster lÃª elenco do banco, filtra por modalidades configuradas e agrupa jogadores por quadro;
- notificaÃ§Ãµes de solicitaÃ§Ã£o de entrada permitem aprovar papÃ©is e configurar modalidade/quadro quando o solicitante vira jogador;
- prÃ³xima prioridade: tela de visualizaÃ§Ã£o/configuraÃ§Ã£o de integrantes do time com permissÃµes por papel.

## Estado atual para continuação

Consulte `Current_Project_Status.md` para o estado consolidado do projeto em 2026-07-20. O próximo passo recomendado é construir a tela de visualização/configuração de integrantes do time e depois retornar ao fechamento da fase 6.

## Objetivo

Orientar qualquer pessoa ou IA que esteja entrando no projeto FUTSTATS pela primeira vez, reduzindo interpretaÃ§Ã£o errada sobre fonte de verdade, fluxo de leitura e contrato tÃ©cnico vigente.

## Leitura obrigatÃ³ria

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

Ler quando o assunto exigir contexto de origem, recorte inicial, ideia futura ou decisÃ£o histÃ³rica:

1. `Product/Launch_Scope_Snapshot.md`
2. `Implementation/Data_Model/Launch_Snapshot_Data_Model.md`
3. `Future_Ideas/*.md`
4. documentos histÃ³ricos de recorte inicial que ainda guardem contratos ou fluxos nÃ£o migrados

## O que entender antes de codar

- O pÃºblico casual Ã© prioridade de adoÃ§Ã£o; o analÃ­tico Ã© prioridade de profundidade e retenÃ§Ã£o.
- Social nÃ£o Ã© extra; Ã© porta de entrada. Scout avanÃ§ado nÃ£o pode bloquear uso simples.
- CÃ³digo, banco, APIs e enums usam inglÃªs; a UI pode usar Technical, VÃ¡rzea ou Resenha.
- Dados canÃ´nicos nÃ£o dependem de texto de interface; a linguagem Ã© resolvida por camada de i18n.
- Nem todo documento histÃ³rico de recorte inicial Ã© descartÃ¡vel. Alguns ainda preservam detalhes Ãºnicos e devem ser tratados como material histÃ³rico Ãºtil atÃ© migraÃ§Ã£o completa.
- Documento com origem em MVP nÃ£o deve ser removido sÃ³ pelo rÃ³tulo. Se ele ainda for a Ãºnica fonte de uma regra, precisa ser preservado atÃ© a migraÃ§Ã£o do conteÃºdo.

## Fonte da verdade

- **GovernanÃ§a documental**: `Documentation_Index.md`.
- **Mapa de fontes por assunto**: `Release_1_0/Source_of_Truth_Map.md`.
- **Arquitetura e princÃ­pios estruturais**: `Architecture/Architecture_Principles.md`.
- **Banco em alto nÃ­vel**: `Database/Tables.md`, `Database/Relationships.md` e `Database/Entity_Relationships.md`.
- **Banco em detalhe**: `Implementation/Database/Table_Spec_*.md`.
- **APIs por domÃ­nio**: `API/*.md`.
- **Detalhamento tÃ©cnico de endpoint**: `Implementation/API/Endpoint_Detail_*.md`.
- **ServiÃ§os de aplicaÃ§Ã£o**: `Implementation/Services/*.md`.
- **Telas e UX**: `Frontend/Screens/*.md`.
- **ReutilizaÃ§Ã£o de componentes e blocos de interface**: `Frontend/Reusable_Building_Blocks.md`.
- **Layout do Stitch para React Native**: `Frontend/Stitch_Conversion_Guide.md`.
- **DecisÃµes arquiteturais**: `ADR/`.
- **Ideias futuras ainda nÃ£o fechadas**: `Future_Ideas/*.md`.

## Regras rÃ¡pidas para nÃ£o errar

- `Database/Tables.md` e arquivos correlatos mostram mapa, nÃ£o substituem `Table_Spec_*`.
- Se houver conflito entre mapa de banco e especificaÃ§Ã£o detalhada, prevalece `Implementation/Database/Table_Spec_*.md`.
- Tela nÃ£o substitui API. API nÃ£o substitui tabela. Cada camada define seu prÃ³prio contrato.
- `Future_Ideas/` nÃ£o define regra vigente; serve para direÃ§Ã£o futura ainda nÃ£o fechada.
- Documento histÃ³rico sÃ³ pode ser removido quando o conteÃºdo Ãºnico jÃ¡ estiver absorvido por fonte canÃ´nica melhor organizada.

## DecisÃµes-chave

- **ADR 010**: entrada casual-first para o primeiro valor percebido.
- **ADR 011**: multi-modalidade (`FUTSAL`, `SOCIETY`, `FIELD`).
- **ADR 012**: identidade no Supabase Auth. `auth.users` Ã© a conta e `public.users` referencia 1:1.
- **Stack**: React Native + Supabase.
- **Primeiro acesso autenticado**: depois do perfil mÃ­nimo, a pessoa escolhe entre criar time, entrar em um time ou explorar primeiro.
- **Pessoas**: `persons` Ã© a identidade canÃ´nica. `users` Ã© a presenÃ§a autenticada no app. `players` Ã© a identidade esportiva opcional.
- **Time**: pertencimento canÃ´nico fica em `team_members`; vÃ­nculo esportivo oficial fica em `team_players`; papÃ©is de gestÃ£o ficam em `user_team_roles`.
- **Agenda x partida**: `scheduled_matches` representa planejamento e confirmaÃ§Ã£o operacional; `matches` representa a execuÃ§Ã£o real por quadro.
- **Interesse implÃ­cito**: buscas e navegaÃ§Ã£o podem gerar sinais leves para sugestÃ£o de times e personalizaÃ§Ã£o futura da Home.

## Como usar a documentaÃ§Ã£o

Para implementar ou revisar um mÃ³dulo:

1. ler o domÃ­nio correspondente;
2. localizar a fonte canÃ´nica do assunto em `Source_of_Truth_Map.md`;
3. ler o mapa de banco em alto nÃ­vel, quando existir impacto estrutural;
4. ler a `Table_Spec_*` correspondente para contrato real de persistÃªncia;
5. ler a especificaÃ§Ã£o de API;
6. ler a especificaÃ§Ã£o de UX e frontend;
7. ler serviÃ§os, endpoints detalhados, testes de aceite e ADRs relacionados;
8. consultar material histÃ³rico apenas quando a fonte canÃ´nica atual nÃ£o cobrir toda a decisÃ£o.

## Atalho prÃ¡tico por tipo de mudanÃ§a

### Se a mudanÃ§a envolver banco

1. `Database/Tables.md`
2. `Database/Relationships.md`
3. `Database/Entity_Relationships.md`
4. `Implementation/Database/Table_Spec_*.md` da tabela afetada

### Se a mudanÃ§a envolver fluxo de tela

1. `Frontend/Screens/*.md`
2. `API/*.md`
3. `Implementation/Database/Table_Spec_*.md`
4. `Frontend/Reusable_Building_Blocks.md`

### Se a mudanÃ§a envolver regra de negÃ³cio

1. `Domain/*.md`
2. `API/*.md`
3. `Implementation/Services/*.md`
4. `ADR/` quando houver decisÃ£o arquitetural associada

