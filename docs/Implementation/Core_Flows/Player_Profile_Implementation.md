---
title: Player Profile Implementation
status: Draft
version: 1.0.0
owner: Product Architecture
last_update: 2026-07-09
---

# Player Profile Implementation

## Objetivo

Definir a implementação do perfil de atleta como composição de identidade, perfil esportivo declarado e histórico factual.

## Contexto

O perfil do atleta precisa funcionar para resenha, identidade e estatísticas. Ele deve poder nascer simples, inclusive sem conta vinculada, e evoluir sem perder histórico.

## Camadas de dados

### Identidade-base

- `persons`
  - avatar;
  - apelido;
  - nome completo.

### Perfil esportivo declarado

- `players`
  - perna dominante;
  - nascimento;
  - altura;
  - peso;
  - status de completude;
- `player_modalities`
  - modalidades declaradas;
- `player_positions`
  - posições declaradas por modalidade.

### Histórico factual

- `team_players`
  - times atuais/oficiais;
- `match_players`
  - partidas em que foi relacionado;
- `match_players_positions`
  - posições efetivamente registradas no histórico;
- read models/snapshots
  - métricas e listas consolidadas para leitura.

## Níveis de perfil

### Perfil mínimo

- apelido;
- avatar opcional;
- ao menos uma identidade esportiva existente.

### Perfil básico

- ao menos uma modalidade declarada;
- ao menos uma posição declarada válida;
- perna dominante opcional;
- time atual quando existir.

### Perfil enriquecido

- dados físicos opcionais;
- histórico consolidado;
- estatísticas;
- timeline esportiva.

## Regras

- Player pode existir sem user.
- User pode reivindicar player.
- Histórico não deve ser perdido na reivindicação.
- Apelido deve ser destaque visual.
- Nome completo pode ser opcional em contextos sociais.
- O perfil deve separar leitura declarativa e leitura factual.
- `player_positions` não substitui `match_players_positions`.
- `player_modalities` não substitui histórico real de partidas por modalidade.
- O bloco público principal do perfil não depende de nascimento, altura ou peso.
- Timeline e estatísticas não devem ser misturadas no mesmo contrato.

## Contrato de leitura recomendado

### GET /api/v1/players/:player_id

Deve retornar, no mínimo:

- `player`
- `person`
- `declared_profile`
- `active_teams`
- `statistics_overview`
- `recent_matches`
- `historical_positions_by_modality`
- `permissions`

### GET /api/v1/players/:player_id/timeline

Deve retornar a camada narrativa do perfil, separada da camada agregada de estatísticas.

Itens iniciais do MVP:

- entrada em time;
- post de boas-vindas publicado;
- participação em partida;
- reivindicação do perfil, quando aplicável.

## Contrato de edição recomendado

### PATCH /api/v1/players/:player_id

Escopo do fluxo de edição do atleta:

- atualizar dados complementares do atleta;
- atualizar modalidades declaradas;
- atualizar posições declaradas;
- nunca sobrescrever histórico factual de partidas.

Regra:

- nome, apelido e avatar pertencem a `persons` e devem ser tratados na borda apropriada do fluxo de edição.

## API

```http
POST /api/v1/players
GET /api/v1/players/{playerId}
PATCH /api/v1/players/{playerId}
POST /api/v1/players/{playerId}/claim
GET /api/v1/players/{playerId}/statistics
GET /api/v1/players/{playerId}/timeline
```

## Critérios de qualidade

- O fluxo deve funcionar para usuário casual sem exigir cadastro excessivo.
- Recursos avançados devem ser progressivos e opcionais.
- O comportamento deve preservar consistência entre frontend, backend, API e banco.
- Todas as entidades técnicas, payloads, enums e nomes internos devem usar inglês.
- Textos exibidos ao usuário devem passar por camada de linguagem/configuração.

## Regras para IA

Ao usar este documento como contexto para implementação, a IA deve:

1. preservar o princípio de uso casual simples;
2. não criar campos obrigatórios que bloqueiem o MVP;
3. respeitar separação entre dado canônico e texto de interface;
4. manter compatibilidade com evolução futura;
5. sugerir migrations, testes e endpoints quando alterar domínio.
