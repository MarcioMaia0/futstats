---
title: Handoff Guide
status: Approved
version: 1.1.0
owner: Product Architecture
last_update: 2026-07-07
related_documents: []
---

# Handoff Guide

## Objetivo

Orientar qualquer pessoa ou IA que esteja entrando no projeto FUTSTATS pela primeira vez.

## Leitura obrigatória

1. `README.md`
2. `Documentation_Index.md`
3. `Product/Product_Overview.md`
4. `Product/Product_Vision.md`
5. `Product/Product_Principles.md`
6. `Product/MVP_Strategy.md`
7. `Domain/README.md`
8. `Database/Database_Architecture.md`
9. `Implementation/Data_Model/MVP_Data_Model.md`
10. `Implementation/Backlog/Product_Backlog.md`
11. `Release_1_0/FINAL_README.md`

## O que entender antes de codar

- O público casual é prioridade de adoção; o analítico é prioridade de profundidade e retenção.
- Social não é extra; é porta de entrada. Scout avançado não pode bloquear uso simples.
- Código, banco, APIs e enums usam inglês; a UI pode usar Technical, Varzea ou Resenha.
- Dados canônicos não dependem de texto de interface — a linguagem é resolvida por camada de i18n.
- Nunca expor linguagem de anúncios/publicidade ao usuário (ver `UX/UX_Principles.md`).

## Fonte da verdade

- **Tabelas (colunas)**: `Implementation/Database/Table_Spec_*.md` — fonte única. Os antigos stubs em `Database/Tables/` e `Implementation/Database/Tables/` foram removidos; `Database/Tables.md` é apenas um mapa de alto nível.
- **Nomenclatura**: `Database/Naming_Conventions.md` (banco) e `Frontend/Naming_Conventions.md` (front: PascalCase telas/componentes, camelCase funções, enums canônicos).
- **Telas**: `Frontend/Screens/*.md` (catálogo; auth já detalhado, demais em evolução).
- **Layout do Stitch → React Native**: `Frontend/Stitch_Conversion_Guide.md` + o agente `.claude/agents/stitch-to-rn.md`.
- **Decisões arquiteturais**: `ADR/`.

## Decisões-chave (2026-07)

- **ADR 010** — MVP casual-first.
- **ADR 011** — multi-modalidade (`FUTSAL/SOCIETY/FIELD`): `matches.modality` + `starters_count`, `teams.default_modality`.
- **ADR 012** — identidade no Supabase Auth (Opção A): `auth.users` é a conta; `public.users` referencia 1:1; `auth_provider` = `EMAIL|GOOGLE|APPLE|PHONE`; account linking por e-mail verificado.
- **Stack**: React Native + Supabase (Postgres/RLS). MVP de login: Google, Apple (iOS), e-mail; telefone/WhatsApp atrás de feature flag.
- **Pessoas**: `players` é um pool único (jogador/técnico/árbitro; user global ou registro do time reutilizável). Papéis de gestão em `user_team_roles` (DIRECTOR); "ser jogador" não é papel. Ver `Domain/Players.md`.
- **Visibilidade e nome**: `user_preferences.profile_visibility` (PUBLIC/FOLLOWERS/TEAM_MEMBERS) e exibição de nome por audiência; resolução de nome no banco, portável (ver `Table_Spec_user_preferences.md`).
- **Notas e social**: `match_ratings` (peer vs geral), `referee_reviews` (peso por papel), `follows`, `comments` (thread + ocultar), `reactions` (dialeto).
- **Moderação**: `team_blocks` — diretor modera o próprio time; ocultar é soft e visível a outros diretores; diretor não bloqueia diretor.

## Como usar a documentação

Para implementar um módulo, leia primeiro:

1. domínio correspondente (`Domain/`);
2. especificação de banco (`Implementation/Database/Table_Spec_*.md`);
3. especificação de API;
4. especificação de UX/frontend (`Frontend/Screens/`);
5. testes de aceite;
6. ADRs relacionados.