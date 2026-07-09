---
title: Handoff Guide
status: Approved
version: 1.3.0
owner: Product Architecture
last_update: 2026-07-09
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
6. `Product/PRD_MVP.md`
7. `Domain/README.md`
8. `Database/Database_Architecture.md`
9. `Implementation/Data_Model/MVP_Data_Model.md`
10. `Implementation/Backlog/Product_Backlog.md`
11. `Release_1_0/FINAL_README.md`

## O que entender antes de codar

- O público casual é prioridade de adoção; o analítico é prioridade de profundidade e retenção.
- Social não é extra; é porta de entrada. Scout avançado não pode bloquear uso simples.
- Código, banco, APIs e enums usam inglês; a UI pode usar Technical, Varzea ou Resenha.
- Dados canônicos não dependem de texto de interface; a linguagem é resolvida por camada de i18n.
- Nunca expor linguagem de anúncios ou publicidade ao usuário.

## Fonte da verdade

- **Tabelas (colunas)**: `Implementation/Database/Table_Spec_*.md` é a fonte única. `Database/Tables.md` é apenas um mapa de alto nível.
- **Nomenclatura**: `Database/Naming_Conventions.md` e `Frontend/Naming_Conventions.md`.
- **Telas**: `Frontend/Screens/*.md`.
- **Layout do Stitch -> React Native**: `Frontend/Stitch_Conversion_Guide.md`.
- **Decisões arquiteturais**: `ADR/`.

## Decisões-chave (2026-07)

- **ADR 010**: MVP casual-first.
- **ADR 011**: multi-modalidade (`FUTSAL`, `SOCIETY`, `FIELD`).
- **ADR 012**: identidade no Supabase Auth. `auth.users` é a conta e `public.users` referencia 1:1.
- **Stack**: React Native + Supabase.
- **Primeiro acesso autenticado**: depois do perfil mínimo, a pessoa escolhe entre criar time, entrar em um time ou explorar primeiro. Ver `Frontend/Screens/Start_Path_Selection.md`.
- **Pessoas**: `persons` é a identidade canônica. `users` é a presença autenticada no app. `players` é a identidade esportiva opcional dessa pessoa. Papéis de gestão ficam em `user_team_roles`; "ser jogador" não é papel de gestão.
- **Visibilidade e nome**: `user_preferences.profile_visibility` e exibição de nome por audiência são resolvidos de forma consistente com `Table_Spec_user_preferences.md`.
- **Interesse implícito**: buscas e navegação podem gerar sinais leves para sugestão de times e personalização futura da Home, sem criar vínculo automático.

## Como usar a documentação

Para implementar um módulo, leia primeiro:

1. domínio correspondente (`Domain/`);
2. especificação de banco (`Implementation/Database/Table_Spec_*.md`);
3. especificação de API;
4. especificação de UX e frontend (`Frontend/Screens/`);
5. testes de aceite;
6. ADRs relacionados.
