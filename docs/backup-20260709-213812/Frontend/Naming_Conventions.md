---
title: Frontend Naming Conventions
status: Draft
version: 1.0.1
owner: Product Architecture
last_update: 2026-07-07
related_documents:
  - ../ADR/ADR_002_English_Canonical_Naming.md
  - ../Database/Naming_Conventions.md
  - ../API/API_Conventions.md
  - App_Structure.md
  - Frontend_Architecture.md
---

# Frontend Naming Conventions

## Objetivo

Padronizar a nomenclatura de telas, componentes, classes, funcoes, variaveis e arquivos do frontend, complementando a ADR 002 e as convencoes ja definidas para banco e API.

## Convencoes

### Telas

- `PascalCase` com sufixo `Screen`: `QuickMatchScreen`, `PlayerProfileScreen`, `TeamHomeScreen`.
- Uma tela por arquivo, com o mesmo nome: `QuickMatchScreen.tsx`.

### Componentes

- `PascalCase`, sem sufixo: `MatchScoreCard`, `GoalListItem`, `TeamBadge`.
- Arquivo com o mesmo nome: `MatchScoreCard.tsx`.

### Hooks

- `camelCase` com prefixo `use`: `useMatchGoals`, `useTeamTheme`, `useOfflineQueue`.
- Arquivo com o mesmo nome: `useMatchGoals.ts`.

### Funcoes e variaveis

- `camelCase`, em ingles, descritivas: `registerGoal()`, `generateShareCard()`.
- Booleanos com prefixo `is`, `has` ou `can`: `isMatchFinished`, `hasClaimedProfile`, `canEditScore`.

### Classes e services

- Classes em `PascalCase`.
- Services com sufixo `Service`: `CardGenerationService`, `StatisticsService`.

### Types, interfaces e enums (TypeScript)

- Types e interfaces em `PascalCase`, sem prefixo `I`: `Match`, `PlayerProfile`.
- Enums com nome em `PascalCase` e membros em `UPPER_SNAKE_CASE`, espelhando os enums canonicos do banco: `MatchStatus.FINISHED`, `MatchStatus.CANCELLED_BY_OPPONENT`.
- O valor canonico do enum nunca e traduzido no codigo; a traducao pertence a camada de linguagem.

### Constantes

- `UPPER_SNAKE_CASE`: `MAX_GOALS_PER_MATCH`, `DEFAULT_THEME_ID`.

### Arquivos e pastas

- Componentes e telas: `PascalCase.tsx`.
- Hooks, services, utils e demais modulos: `camelCase.ts`.
- Pastas em minusculas, refletindo dominios de produto: `features/matches/`, `features/identity/`.

### JSON da API

- `snake_case`, espelhando as colunas do banco: `home_score`, `opponent_name`, `match_date`.
- Nao converter para `camelCase` na borda; o payload trafega canonico do banco a UI.

### Rotas

- Minusculas, kebab-case quando compostas, refletindo dominios: `/teams`, `/matches/:matchId`.
- Parametros de rota em `camelCase`: `:teamId`, `:matchId`.

### Arquivos de documentacao

- `Snake_Title.md`: `Quick_Match_Creation.md`, `Naming_Conventions.md`.

## Regra

Todo identificador tecnico e em ingles. Portugues, varzea e resenha pertencem a camada de linguagem da UI, nunca a nomes de codigo, payloads ou banco.
