---
title: Navigation Model
status: Draft
document_type: Reference
version: 1.1.0
owner: Product Architecture
last_update: 2026-07-08
related_documents:
  []
---

# Navigation Model

## Objetivo

Documentar a navegacao principal do produto e servir como referencia oficial para organizacao de abas, entradas e percursos principais.

## Abas iniciais do MVP

- Home
- Matches
- Team
- Players
- Profile

## Percursos principais

### Primeiro acesso autenticado

Depois de `Welcome`, autenticação e `Complete Profile` quando necessário, a pessoa pode passar por `Start Path Selection` antes de chegar ao fluxo principal do app.

Esse passo oferece três caminhos:

- criar meu time;
- entrar em um time;
- explorar primeiro.

### Home

Mostra próximo jogo, último resultado, busca e atalhos para criar partida ou explorar feed.

Quando a pessoa ainda não tem time ativo, a Home pode operar em modo neutro e evoluir com personalização baseada em interesse implícito de navegação.

### Matches

Lista historico e permite criar partida rapida.

### Team

Perfil do time, cores, elenco e estatisticas simples.

### Players

Lista jogadores, artilharia e acesso aos perfis.

### Profile

Preferencias do usuario, tema, linguagem e privacidade.

## Regras centrais

1. O uso casual nunca deve ser bloqueado por recursos avancados.
2. Dados tecnicos devem ser persistidos com nomenclatura em ingles.
3. A experiencia exibida ao usuario pode variar por tema, linguagem e contexto.
4. Historico e legado sao consequencias do uso recorrente, nao barreiras de entrada.
5. Toda regra deve preservar a integridade historica de partidas, atletas e times.

## Regra

Quando houver divergencia com rascunhos antigos, este documento prevalece como mapa oficial de navegacao.
