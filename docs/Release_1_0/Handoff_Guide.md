---
title: Handoff Guide
status: Approved
version: 1.8.0
owner: Product Architecture
last_update: 2026-07-14
related_documents:
  - ../Documentation_Index.md
  - ./Source_of_Truth_Map.md
  - ../Architecture/Architecture_Principles.md
  - ../Database/Tables.md
  - ../Database/Relationships.md
  - ../Database/Entity_Relationships.md
---

# Handoff Guide

## Estado atual para continuação

Este é o ponto exato para retomar o projeto em outra conversa.

### Contexto do produto

- O FUTSTATS é um app multiplataforma em React Native + Expo + Supabase.
- A identidade visual oficial está seguindo a versão dark, com preto, dourado e linguagem de várzea.
- O fluxo inicial do usuário segue esta ordem: login/criação de conta, escolha do caminho inicial e, no recorte atual, criação de time.
- A tela atual após login é “Como você quer começar?”, com três caminhos:
  - Criar meu time (`CREATE_TEAM`)
  - Entrar em um time (`JOIN_TEAM`)
  - Explorar primeiro (`EXPLORE`)
- A documentação deve sempre preservar a versão mais rica do produto. Conteúdo marcado originalmente como MVP só deve ser removido quando existir fonte mais rica e canônica cobrindo a mesma regra.

### Estado do app

- O app está em `apps/mobile`.
- A tela de login já usa Supabase Auth e Google OAuth.
- Após login, o app direciona para a tela “Como você quer começar?”.
- A tela antiga de escolha inicial foi substituída pela versão nova com imagem única por breakpoint e botões posicionados por cima.
- Assets principais usados nesta tela estão em:
  - `apps/mobile/src/assets/start-path/containers/container-celular-portrait.png`
  - `apps/mobile/src/assets/start-path/containers/container-celular-landscape.png`
  - `apps/mobile/src/assets/start-path/containers/container-tablet-portrait.png`
  - `apps/mobile/src/assets/start-path/containers/container-tablet-landscape.png`
- A tela atual está em:
  - `apps/mobile/src/features/onboarding/screens/StartPathSelectionPosterScreen.tsx`
- O bootstrap de usuário foi conectado em:
  - `apps/mobile/src/AppRoot.tsx`
- Serviços criados para o app:
  - Identidade (`identityService`): `apps/mobile/src/features/identity/services/identityService.ts`
  - Times (`teamService`): `apps/mobile/src/features/teams/services/teamService.ts`
- Validação local executada:
  - `npm run typecheck` em `apps/mobile` passou sem erros.

### Estado do banco e APIs Supabase

Foi criada a primeira migration real para identidade e times:

- `supabase/migrations/20260714183000_initial_identity_and_teams.sql`

Ela contém:

- Enums principais de identidade, times, modalidades, papéis, redes sociais e mídia.
- Tabelas:
  - Pessoa (`persons`)
  - Usuário autenticado (`users`)
  - Preferências do usuário (`user_preferences`)
  - Atleta (`players`)
  - Mídias (`media_assets`)
  - Locais/quadras (`venues`)
  - Times (`teams`)
  - Modalidades do time (`team_modalities`)
  - Configurações do time (`team_settings`)
  - Redes sociais do time (`team_social_connections`)
  - Integrantes do time (`team_members`)
  - Atletas oficiais do time (`team_players`)
  - Papéis do usuário no time (`user_team_roles`)
  - Solicitações de entrada no time (`team_join_requests`)
- Funções RPC:
  - `bootstrap_current_user()`
  - `get_me()`
  - `complete_start_path_choice(start_path_choice)`
  - `create_team(jsonb)`
- Regras de RLS e grants para usuários autenticados.

Importante:

- A migration ainda não foi aplicada no banco remoto.
- O lint SQL pelo `supabase db lint --local` continua pendente porque a stack local oficial do Supabase não estava operacional em `127.0.0.1:54322`.
- A CLI do Supabase existe localmente e responde.
- O `supabase link --project-ref vjivzajsnbhunnbacrgh` falhou pela CLI com erro de privilégio da conta autenticada para consultar o status remoto do projeto.
- A migration foi validada tecnicamente em um sandbox Postgres local com stubs mínimos de ambiente Supabase (`auth.users`, `auth.uid()` e role `authenticated`) e executou até o fim sem erro estrutural de SQL.
- O MCP do Supabase aparece cadastrado e autenticado no Codex CLI:
  - Projeto: `vjivzajsnbhunnbacrgh`
  - Status: `enabled`
  - Auth: `OAuth`
- Foi confirmado pelo comando `codex mcp login supabase` que o OAuth concluiu com sucesso:
  - retorno observado: `Successfully logged in to MCP server 'supabase'.`
- Porém, na sessão em que isso foi validado, as ferramentas chamáveis do Supabase MCP não apareceram para o agente mesmo após o OAuth. A hipótese mais provável é estado antigo da UI/thread atual do Codex.

### Próximo passo recomendado

Ao abrir uma nova conversa, pedir:

> Leia `docs/Release_1_0/Handoff_Guide.md` e continue de onde paramos. Primeiro confirme se as ferramentas do Supabase MCP estão disponíveis nesta nova sessão após reiniciar o Codex. Considere a migration `supabase/migrations/20260714183000_initial_identity_and_teams.sql` já validada tecnicamente em sandbox local. Se o MCP estiver disponível, compare o estado remoto e só depois peça confirmação antes de aplicar no banco remoto.

Sequência recomendada:

1. Reiniciar o Codex Desktop e abrir nova conversa no projeto.
2. Confirmar que o MCP do Supabase está exposto como ferramenta chamável nesta nova sessão.
3. Se o MCP estiver disponível, inspecionar o estado remoto do projeto `vjivzajsnbhunnbacrgh` e comparar com a migration local `20260714183000_initial_identity_and_teams.sql`.
4. Aplicar a migration no Supabase remoto somente com confirmação explícita.
5. Testar login Google criando automaticamente `auth.users`, `persons`, `users` e `user_preferences`.
6. Começar a tela Create Team Wizard usando a documentação já existente.

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
