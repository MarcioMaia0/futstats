---
title: Statistics Service
status: Draft
version: 1.0.0
owner: Product Architecture
last_update: 2026-07-09
---

# Statistics Service

## Objetivo

Especificar o serviço de estatísticas.

## Responsabilidades

- calcular estatísticas simples;
- calcular agregados;
- recalcular rankings;
- calcular Plus/Minus quando possível;
- gerar snapshots;
- identificar limitações por falta de dados.

## Recorte obrigatório atual para atleta

O serviço deve sustentar `GET /api/v1/players/:player_id/statistics` com:

- `matches_played`
- `starter_matches`
- `bench_matches`
- `official_team_matches`
- `guest_matches`
- `wins`
- `draws`
- `losses`
- `goals_scored`
- `recorded_assists`
- `own_goals`
- consolidação por `modality`
- consolidação por `team`
- bloco `coverage`
- bloco `limitations`
- inferência contextual de estilo de jogo, quando houver base suficiente
- série temporal de desempenho, quando a granularidade dos dados permitir

## Regras

- Estatística deve funcionar com dados incompletos.
- Métrica avançada deve declarar pré-condições.
- Snapshots devem registrar versão do cálculo.
- Reprocessamentos devem ser idempotentes.
- Assistências do estado atual do produto devem ser tratadas como `recorded_assists`, nunca como verdade absoluta quando o registro não for obrigatório.
- Métricas de resultado devem considerar apenas partidas finalizadas.
- O serviço não deve inferir minutos, scout fino ou plus/minus sem base factual suficiente.
- Inferência de estilo de jogo deve combinar dado declarado e dado observado.
- O serviço deve expor grau de confiança quando gerar inferência de estilo.
- Sem base suficiente, o serviço deve preferir ausência de inferência a chute fraco.

## Inferência de estilo de jogo

Entrada conceitual da inferência:

- `player_positions`
- `match_players_positions`
- métricas disponíveis por evento/estatística

Saída conceitual:

- `OFFENSIVE`
- `DEFENSIVE`
- `BALANCED`
- `GOALKEEPER`

Com confiança, por exemplo:

- `LOW`
- `MEDIUM`
- `HIGH`

## Jobs

- `RecalculateMatchStatisticsJob`
- `RecalculateTeamRankingsJob`
- `RebuildPlayerStatisticsJob`

## Critérios de qualidade

- O fluxo deve funcionar para usuário casual sem exigir cadastro excessivo.
- Recursos avançados devem ser progressivos e opcionais.
- O comportamento deve preservar consistência entre frontend, backend, API e banco.
- Todas as entidades técnicas, payloads, enums e nomes internos devem usar inglês.
- Textos exibidos ao usuário devem passar por camada de linguagem/configuração.

## Regras para IA

Ao usar este documento como contexto para implementação, a IA deve:

1. preservar o princípio de uso casual simples;
2. não criar campos obrigatórios que bloqueiem o primeiro valor operacional;
3. respeitar separação entre dado canônico e texto de interface;
4. manter compatibilidade com evolução futura;
5. sugerir migrations, testes e endpoints quando alterar domínio.
