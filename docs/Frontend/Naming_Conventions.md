---
title: Frontend Naming Conventions
status: Draft
version: 1.0.0
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

Padronizar a nomenclatura de telas, componentes, classes, funções, variáveis e arquivos do frontend, complementando a ADR 002 (inglês canônico) e as convenções já definidas para banco e API.

## Convenções

### Telas

- `PascalCase` com sufixo `Screen`: `QuickMatchScreen`, `PlayerProfileScreen`, `TeamHomeScreen`.
- Uma tela por arquivo, com o mesmo nome: `QuickMatchScreen.tsx`.

### Componentes

- `PascalCase`, sem sufixo: `MatchScoreCard`, `GoalListItem`, `TeamBadge`.
- Arquivo com o mesmo nome: `MatchScoreCard.tsx`.

### Hooks

- `camelCase` com prefixo `use`: `useMatchGoals`, `useTeamTheme`, `useOfflineQueue`.
- Arquivo com o mesmo nome: `useMatchGoals.ts`.

### Funções e variáveis

- `camelCase`, em inglês, descritivas: `registerGoal()`, `generateShareCard()`.
- Booleanos com prefixo `is`, `has` ou `can`: `isMatchFinished`, `hasClaimedProfile`, `canEditScore`.

### Classes e services

- Classes em `PascalCase`.
- Services com sufixo `Service`: `CardGenerationService`, `StatisticsService`.

### Types, interfaces e enums (TypeScript)

- Types e interfaces em `PascalCase`, sem prefixo `I`: `Match`, `PlayerProfile`.
- Enums com nome em `PascalCase` e membros em `UPPER_SNAKE_CASE`, espelhando os enums canônicos do banco: `MatchStatus.FINISHED`, `MatchStatus.CANCELLED_BY_OPPONENT`.
- O valor canônico do enum nunca é traduzido no código; a tradução pertence à camada de linguagem (i18n).

### Constantes

- `UPPER_SNAKE_CASE`: `MAX_GOALS_PER_MATCH`, `DEFAULT_THEME_ID`.

### Arquivos e pastas

- Componentes e telas: `PascalCase.tsx`.
- Hooks, services, utils e demais módulos: `camelCase.ts`.
- Pastas em minúsculas, refletindo domínios de produto: `features/matches/`, `features/identity/`.

### JSON da API

- `snake_case`, espelhando as colunas do banco: `home_score`, `opponent_name`, `match_date`.
- Não converter para `camelCase` na borda; o payload trafega canônico do banco à UI.

### Rotas

- Minúsculas, kebab-case quando compostas, refletindo domínios: `/teams`, `/matches/:matchId`.
- Parâmetros de rota em `camelCase`: `:teamId`, `:matchId`.

### Arquivos de documentação

- `Snake_Title.md`: `Screen_Spec_Quick_Match.md`, `Naming_Conventions.md`.

## Regra

Todo identificador técnico é em inglês. Português, várzea e resenha pertencem à camada de linguagem da UI, nunca a nomes de código, payloads ou banco.
