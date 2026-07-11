---
title: Player Profile Read Model Strategy
status: Draft
version: 1.0.0
owner: Product Architecture
last_update: 2026-07-09
related_documents:
  - Event_Driven_Strategy.md
  - ../Backend/Jobs_and_Queues.md
  - ../Domain/Players.md
  - ../API/Players_API.md
---

# Player Profile Read Model Strategy

## Objetivo

Definir a estratégia completa de leitura otimizada para o perfil rico do atleta.

Esta estratégia existe porque o perfil do atleta combina:

- identidade esportiva declarada;
- estatísticas agregadas;
- histórico cronológico;
- galeria social;
- gráfico temporal;
- interpretação contextual do estilo de jogo.

Montar tudo isso apenas com consultas dinâmicas sobre tabelas operacionais tende a ficar caro e frágil com o crescimento do produto.

## Princípio central

O FUTSTATS deve separar:

- escrita operacional, que guarda o fato bruto;
- leitura otimizada, que guarda projeções prontas para consumo.

## Camadas

### Camada operacional

Fonte de verdade do sistema.

Exemplos:

- `persons`
- `players`
- `player_modalities`
- `player_positions`
- `team_players`
- `matches`
- `match_players`
- `match_players_positions`
- `match_goals`
- `match_events`
- `posts`

### Camada de projeção do perfil do atleta

Leitura pronta e otimizada.

Exemplos:

- `player_profile_summary`
- `player_match_statistics`
- `player_statistics_summary`
- `player_statistics_by_modality`
- `player_statistics_by_team_modality`
- `player_timeline_items`
- `player_gallery_items`
- `player_gallery_group_counters`
- `player_performance_series`
- `player_style_inference`

## Regra arquitetural

- tabelas operacionais continuam sendo a fonte única da verdade;
- tabelas de projeção não substituem a origem;
- projeções podem ser apagadas e reconstruídas;
- perfil do atleta deve continuar funcionando em modo degradado se uma projeção avançada for desativada.

## Quem guarda

### Módulos operacionais

- `Identity`
  - guarda pessoas e contas;
- `Players`
  - guarda perfil esportivo declarado;
- `Teams`
  - guarda vínculo oficial com time;
- `Matches`
  - guarda participação, placar, gols e eventos;
- `Social`
  - guarda posts e relacionamento com comunidade;
- `Media`
  - guarda referências de mídia.

### Módulo de projeção do perfil

Um módulo dedicado de leitura do atleta deve ser o dono das tabelas de projeção.

Responsabilidades:

- consolidar visão geral;
- consolidar visão por modalidade;
- consolidar visão por time + modalidade;
- construir timeline;
- construir galeria;
- construir série temporal;
- inferir estilo contextual.

## Como guarda

### Fato bruto

Persistido na transação principal do caso de uso.

Exemplos:

- entrada aprovada em time;
- atleta relacionado para partida;
- gol registrado;
- post publicado.

### Projeção

Atualizada por handlers e jobs derivados dos fatos do domínio.

Formas de atualização:

- incremental, quando o impacto for localizado;
- rebuild parcial por contexto, quando necessário;
- rebuild total, quando mudar regra ou houver correção estrutural.

## Em que momento guarda

### Quando o atleta é criado ou editado

Disparadores:

- `PlayerCreated`
- edição do perfil do atleta
- `ProfileCompleted`
- eventos de claim

Atualiza:

- `player_profile_summary`
- `player_statistics_summary` inicial
- `player_statistics_by_modality` inicial
- `player_style_inference`

Regra:

- `player` criado apenas para uso operacional do time não é obrigado a receber imediatamente todas as projeções ricas do perfil;
- o módulo pode criar apenas o mínimo necessário, ou nenhum read model avançado, até que o atleta seja reivindicado por uma pessoa real;
- quando houver claim com merge para um `player` canônico, as projeções passam a ser reconstruídas a partir da origem operacional consolidada.

### Quando entra em time

Disparadores:

- `TeamJoinRequestApproved`
- futuros eventos de saída, remoção ou reativação

Atualiza:

- `player_profile_summary`
- `player_statistics_by_team_modality` inicial
- `player_timeline_items`

Regra:

- se a entrada no time estiver vinculando um atleta operacional já existente ao `player` canônico do usuário, a projeção deve usar o `target_player_id` consolidado, nunca manter visões paralelas por atleta duplicado.

### Quando uma partida é finalizada

Disparadores:

- `MatchFinished`
- correção posterior relevante de partida

Atualiza:

- `player_match_statistics`
- `player_statistics_summary`
- `player_statistics_by_modality`
- `player_statistics_by_team_modality`
- `player_performance_series`
- `player_style_inference`
- `player_timeline_items`

### Quando um gol ou evento relevante é ajustado

Disparadores:

- `GoalRegistered`
- `GoalUpdated`
- futuros eventos de scout fino

Atualiza:

- linha da partida do atleta;
- agregados impactados;
- série temporal impactada;
- inferência de estilo quando necessário.

### Quando conteúdo social vinculado ao atleta é publicado

Disparadores:

- `PlayerWelcomePostPublished`
- futuro `GoalHighlightPublished`
- futuro `TeamPostLinkedToPlayer`

Atualiza:

- `player_gallery_items`
- `player_gallery_group_counters`
- `player_timeline_items`
- `player_profile_summary.last_post_at`

## Feature flags e desligamento rápido

Para reduzir risco operacional, o read model deve aceitar desligamento rápido.

Flags recomendadas:

- `player_profile_match_stats_write_enabled`
- `player_profile_match_stats_read_enabled`
- `player_profile_gallery_enabled`
- `player_profile_style_inference_enabled`

## Estratégia de degradação

### Se projeções avançadas estiverem desativadas

O perfil do atleta continua com:

- identidade;
- modalidades declaradas;
- posições declaradas;
- times atuais;
- resumo simples disponível.

Pode esconder temporariamente:

- gráfico temporal;
- galeria avançada;
- estilo inferido;
- cortes analíticos mais ricos.

## Rebuild e recuperação

Jobs recomendados:

- `RebuildPlayerProfileSummaryJob`
- `RebuildPlayerMatchStatisticsJob`
- `RebuildPlayerStatisticsSummaryJob`
- `RebuildPlayerStatisticsByModalityJob`
- `RebuildPlayerStatisticsByTeamModalityJob`
- `RebuildPlayerTimelineJob`
- `RebuildPlayerGalleryJob`
- `RebuildPlayerPerformanceSeriesJob`
- `RebuildPlayerStyleInferenceJob`
- `MergeOperationalPlayerIntoCanonicalPlayerJob`

## Regra de consistência

- a transação principal nunca deve depender do sucesso da projeção para ser considerada concluída;
- projeção pode falhar e ser reprocessada;
- a origem bruta deve ser suficiente para reconstrução integral.
- merge de `player_id` deve atuar primeiro nos fatos operacionais e só depois reconstruir projeções;
- projeções do `source_player_id` podem ser descartadas após merge bem-sucedido.
