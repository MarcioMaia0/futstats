---
title: Match Operation Technical Contract
status: Draft
version: 1.12.0
owner: Product Architecture
last_update: 2026-07-13
related_documents:
  - ../Frontend/Screens/Lineup_And_Live_Operation.md
  - ../Frontend/Screens/Match_Scoreboard.md
  - Match_Operation_Phase_1_Checklist.md
  - ../Implementation/Database/Table_Spec_matches.md
  - ../Implementation/Database/Table_Spec_match_events.md
  - ../Implementation/Database/Table_Spec_match_players.md
  - ../Implementation/Database/Table_Spec_match_substitutions.md
---

# Match Operation Technical Contract

## Objetivo

Fechar o recorte tecnico da superficie operacional de partida, incluindo:

- tabelas e colunas;
- enums;
- metodos e servicos;
- componentes e hooks;
- itens novos e itens reaproveitados.

## Tabelas reaproveitadas

- `matches`
- `match_players`
- `match_players_positions`
- `match_events`
- `match_substitutions`
- `scheduled_matches`
- `local_opponents`

## Tabelas novas

- `local_opponent_players`
- `match_opponent_players`
- `match_operator_assignments`

## Regras tecnicas centrais

- a mesma base visual deve suportar:
  - escalacao;
  - operacao ao vivo;
  - revisao por video;
- o modo casual e o modo hardcore compartilham a mesma entidade de partida;
- eventos podem ser salvos de forma parcial;
- jogadores adversarios locais nao entram no dominio global de `persons/players`;
- a memoria de adversario pertence ao time que registrou.

## Enums novos ou consolidados

### `participant_side`

- `HOME`
- `OPPONENT`

### `event_context_side`

- `ATTACK`
- `DEFENSE`

### `event_completion_stage`

- `MINIMAL`
- `PARTIAL`
- `DETAILED`
- `REVIEWED`

### `body_part`

- `RIGHT_FOOT`
- `LEFT_FOOT`
- `HEAD`
- `OTHER`

### `shot_outcome`

- `GOAL`
- `SAVED`
- `OFF_TARGET`
- `BLOCKED`

### `save_difficulty`

- `EASY`
- `MEDIUM`
- `HARD`
- `MIRACLE`

### `match_operator_scope`

- `CLOCK`
- `SCOREBOARD`
- `LINEUP`
- `SUBSTITUTION`
- `SHOT_EVENTS`
- `PASS_EVENTS`
- `FOUL_EVENTS`
- `DEFENSIVE_EVENTS`
- `FULL_REVIEW`

## Componentes reaproveitados

- `ConfirmationModal`
  - usar em edicao rapida de gol e confirmacoes sensiveis;
- `ImagePreviewCard`
  - usar em foto opcional de jogador adversario local;
- `ImageAcquisitionFlow`
  - usar quando o operador quiser foto de jogador adversario local;
- `EntitySearchInput`
  - pode ser evoluido para busca de atleta e adversario em fluxos auxiliares;
- `ToggleField`
  - pode ser reaproveitado em preferencias operacionais simples.

## Componentes novos

- `MatchScoreStrip`
  - container superior com escudos, placar e cronometro;
- `MatchBoardCanvas`
  - superficie isometrica de quadra ou campo;
- `MatchActorCardGrid`
  - grid de cards dos atletas fora da quadra;
- `MatchActorToken`
  - avatar ou circulo com numero para atores em quadra;
- `QuickGoalAttributionSheet`
  - selecao rapida do autor do gol por avatar ou numero;
- `ContextualRadialMenu`
  - menu radial de contexto `Ataque/Defesa` e acoes primarias;
- `BallTargetBoard`
  - visao frontal do gol para destino da bola;
- `BenchSwapTray`
  - area de banco para substituicoes;
- `GuestPlayerQuickCreateCard`
  - ultimo card da lista para adicionar jogador avulso;
- `GuestPlayerQuickCreateFlow`
  - mini-fluxo de cadastro rapido de avulso na escalação;
- `PartialSaveActionBar`
  - acoes `Salvar`, `Cancelar`, `Desfazer` em qualquer etapa do microfluxo;
- `OperatorScopePanel`
  - configuracao de responsabilidades dos operadores da partida;
- `MatchMomentumTimeline`
  - `Timeline de pressão do jogo`;
  - leitura visual de pressão e participação por eventos;
  - deve usar `@shopify/react-native-skia` na área gráfica;
- `MatchMomentumPlayerPickerSheet`
  - seletor de jogador para filtro da timeline;
- `MatchMomentumEventPopover`
  - detalhe curto do lance ao tocar em marcador da timeline.

## Hooks e metodos reaproveitados

- `useTemporaryUpload`
  - para fotos opcionais de jogador adversario local;
- `TemporaryUploadPromotionService`
  - promocao de foto opcional de jogador adversario local.

## Hooks e metodos novos

- `useMatchBoardActors`
  - hidrata atores da partida para a superficie;
- `useLineupSelection`
  - controla relacionados, titulares e banco;
- `useCasualGoalRegistration`
  - registra gol por toque no escudo e abre atribuicao rapida;
- `useContextualMicroflow`
  - controla o estado de cada microfluxo contextual;
- `usePartialEventDraft`
  - permite salvamento antecipado do evento;
- `useBenchSubstitution`
  - executa substituicao por gesto de saida da area jogavel;
- `useMatchOperatorAssignments`
  - carrega e valida escopos dos operadores;
- `useMatchClockControl`
  - controla o cronometro no operador autorizado;
- `useMatchMomentum`
  - hidrata e atualiza a `Timeline de pressão do jogo`;
- `useMatchMomentumPlayerFilter`
  - controla o filtro por jogador da timeline;
- `useGuestPlayerQuickCreate`
  - executa o fluxo rapido de `person + player` para avulso;
- `MatchOperationService`
  - servico de aplicacao para comandos operacionais da superficie.

## Regra de entrada de avulso na superfície

- o último card da lista de atletas deve ser `Adicionar jogador avulso`;
- o contrato também deve suportar entrada de atleta atrasado ou avulso durante a partida;
- o ponto visual final dentro da prancheta ainda pode evoluir;
- por ora, o contrato já deve permitir essa ação também a partir da área de banco.

## Endpoints novos ou consolidados

- `POST /api/v1/matches`
- `GET /api/v1/matches/:match_id`
- `PATCH /api/v1/matches/:match_id`
- `POST /api/v1/matches/:match_id/lineups/save`
- `PATCH /api/v1/matches/:match_id/related-players`
- `POST /api/v1/matches/:match_id/goals/quick`
- `PATCH /api/v1/matches/:match_id/goals/:goal_id`
- `POST /api/v1/matches/:match_id/events`
- `PATCH /api/v1/matches/:match_id/events/:event_id`
- `POST /api/v1/matches/:match_id/substitutions`
- `GET /api/v1/matches/:match_id/momentum`
- `POST /api/v1/matches/:match_id/opponent-players`
- `PATCH /api/v1/matches/:match_id/opponent-players/:match_opponent_player_id`
- `POST /api/v1/matches/:match_id/operator-assignments`
- `PATCH /api/v1/matches/:match_id/operator-assignments/:assignment_id`
- `POST /api/v1/matches/:match_id/finish`
- `POST /api/v1/matches/:match_id/cancel`

## Contrato de leitura para reabrir a escalação

- `GET /api/v1/matches/:match_id`
  - deve reidratar a tela de escalação quando a `match` ainda estiver em rascunho;
  - deve devolver:
    - `match`
    - `lineup_draft`
    - `related_players`
    - `available_players`
    - `coach_context`
  - `available_players` deve respeitar a ordem oficial de sugestão:
    - quadro atual com `vou`
    - quadro atual com `talvez`
    - quadro atual com `vou mas não vou jogar`
    - outro quadro na mesma ordem
    - avulsos por último

## Regra do técnico na superfície

- o técnico aparece em bloco contextual, não na lista de atletas;
- `coach_context` deve separar:
  - técnico sugerido por `team_staff_defaults`
  - técnico confirmado em `match_staff`
- a superfície deve permitir:
  - confirmar o sugerido;
  - trocar por outra pessoa;
  - deixar sem técnico confirmado naquele momento.

## Regra de travamento parcial da escalação

- quando o cronômetro começar:
  - os `titulares iniciais` ficam travados como saída oficial;
- porém, o `elenco relacionado` continua editável durante a partida;
- esse mesmo elenco continua ajustável depois em revisão por vídeo.

## Separação oficial dos comandos

- `lineups/save`
  - salva a saída oficial;
- `related-players`
  - mantém o elenco disponível depois da saída oficial.

Operações mínimas de `related-players`:

- `ADD`
- `ADD_GUEST`
- `UPDATE_SHIRT_NUMBER`
- `REMOVE`

Regra de `REMOVE`:

- sem dependência factual, pode apagar fisicamente;
- com dependência factual, deve virar remoção lógica.

Dependências factuais que bloqueiam exclusão física de `relacionado da partida (match_player)`:

- `eventos da partida (match_events)`:
  - `primary_match_player_id`
  - `secondary_match_player_id`
  - `marking_failure_match_player_id`
- `gols da partida (match_goals)`:
  - `match_player_id`
- `substituições da partida (match_substitutions)`:
  - `player_in_match_player_id`
  - `player_out_match_player_id`
- `avaliações da partida (match_ratings)`:
  - `target_match_player_id`

Exceção:

- `posições usadas pelo atleta na partida (match_players_positions)` não bloqueia exclusão física sozinha e pode ser limpa junto com a remoção física do relacionado.

Operações mínimas de `jogadores adversários da partida (opponent-players)`:

- `ADD`
- `UPDATE`
- `REMOVE`

Regra de `REMOVE` para `jogador adversário da partida (match_opponent_player)`:

- sem dependência factual, pode apagar fisicamente;
- com dependência factual, deve virar remoção lógica.

Dependências factuais que bloqueiam exclusão física de `jogador adversário da partida (match_opponent_player)`:

- `eventos da partida (match_events)`:
  - `primary_match_opponent_player_id`
  - `secondary_match_opponent_player_id`
- `substituições da partida (match_substitutions)`:
  - `opponent_player_in_match_opponent_player_id`
  - `opponent_player_out_match_opponent_player_id`

## Criterio de implementacao

- o fluxo casual deve funcionar sem exigir o fluxo hardcore;
- o fluxo intermediario deve poder salvar parcial;
- o fluxo hardcore deve conseguir enriquecer o mesmo evento depois;
- dados espaciais relevantes devem sair de `metadata` sempre que forem analiticamente importantes.

## Fases tecnicas de implementacao

### Fase tecnica 1: Base operacional minima

Objetivo:

- colocar a partida operacional basica para funcionar com escalacao, gol rapido e substituicao.

Escopo:

- `matches`
- `match_players`
- `match_substitutions`
- `Matches API`
- `Match Service`

Entrega esperada:

- salvar escalacao do quadro;
- registrar gol rapido;
- registrar substituicao basica;
- finalizar partida.

### Fase tecnica 2: Fluxo casual de jogo

Objetivo:

- atender quem quer apenas registrar placar e gol com o menor atrito possivel.

Escopo:

- `MatchScoreStrip`
- `useCasualGoalRegistration`
- `POST /api/v1/matches/:match_id/goals/quick`
- edicao rapida de gol

Entrega esperada:

- toque no escudo registra gol;
- atribuicao rapida do autor por avatar ou numero;
- correcao rapida de gol errado.

### Fase tecnica 3: Superficie de escalacao

Objetivo:

- fechar bem a ponte entre agenda, escalacao e inicio da partida operacional.

Escopo:

- `MatchBoardCanvas`
- `MatchActorCardGrid`
- `MatchActorToken`
- `useLineupSelection`
- `POST /api/v1/matches/:match_id/lineups/save`

Entrega esperada:

- relacionados;
- titulares;
- banco;
- salvamento por quadro.
- validacao de minimo por modalidade;
- ajuste operacional de `Quantidade de titulares (starters_count)` em `SOCIETY`;
- persistencia coerente desse valor na agenda e na partida.
- reserva automatica para todo relacionado nao titular;
- camisa obrigatoria para todo relacionado;
- posicao inicial obrigatoria apenas para o goleiro titular.
- confirmacao contextual do numero da camisa no momento em que o atleta e relacionado.
- definicao dinamica do goleiro durante a montagem da escalação, com bloqueio de salvamento sem goleiro.

### Fase tecnica 4: Microfluxo parcial

Objetivo:

- permitir scout progressivo sem exigir preenchimento total do microfluxo.

Escopo:

- `ContextualRadialMenu`
- `PartialSaveActionBar`
- `useContextualMicroflow`
- `usePartialEventDraft`
- `POST /api/v1/matches/:match_id/events`
- `PATCH /api/v1/matches/:match_id/events/:event_id`

Entrega esperada:

- evento salvo em estagio minimo;
- enriquecimento posterior do mesmo evento;
- pre-filtro `Ataque (ATTACK)` e `Defesa (DEFENSE)`.

### Fase tecnica 5: Camada espacial rica

Objetivo:

- iniciar o scout espacial rico da prancheta.

Escopo:

- campos espaciais de `match_events`
- `BallTargetBoard`
- `body_part`
- `shot_outcome`
- `save_difficulty`
- `marking_failure_match_player_id`

Entrega esperada:

- origem e destino do lance;
- parte do corpo;
- defesa do goleiro;
- falha de marcacao.

### Fase tecnica 6: Adversario operacional

Objetivo:

- enriquecer a leitura do confronto com memoria privada do adversario.

Escopo:

- `local_opponent_players`
- `match_opponent_players`
- fluxo minimo por numero de camisa

Entrega esperada:

- cadastro privado de jogadores adversarios;
- atribuicao de gol adversario por numero;
- eventos do lado adversario com ator identificado.

### Fase tecnica 7: Operacao colaborativa

Objetivo:

- suportar multiplos operadores na mesma partida com escopos definidos.

Escopo:

- `match_operator_assignments`
- `useMatchOperatorAssignments`
- `useMatchClockControl`
- regras de validacao de escopo no backend

Entrega esperada:

- operador de cronometro;
- operadores por familia de evento;
- revisao ampla controlada.

### Fase técnica 7.5: Timeline de pressão do jogo

Objetivo:

- entregar leitura visual de momentum durante a partida sem criar nova fonte factual.

Escopo:

- `MatchMomentumTimeline`
- `MatchMomentumPlayerPickerSheet`
- `MatchMomentumEventPopover`
- `useMatchMomentum`
- `GET /api/v1/matches/:match_id/momentum`
- realtime de eventos, gols e substituições

Entrega esperada:

- timeline visível por padrão na versão vertical de `Momento do jogo`;
- timeline aberta por overlay na versão horizontal;
- filtros por tipo de evento;
- filtro por jogador;
- detalhe curto do lance ao tocar em marcador;
- suporte a eventos pendentes locais com estado visual discreto;
- atualização por realtime;
- uso do heartbeat apenas como base de confiança temporal dos eventos.

### Fase tecnica 8: Revisao por video

Objetivo:

- consolidar a camada analitica depois do jogo.

Escopo:

- `analysis_status`
- enriquecimento pos-jogo
- revisao ampla de evento

Entrega esperada:

- partida encerrada em campo, mas ainda aberta para analise;
- consolidacao posterior de dados.

## Regra de prioridade

- implementar ate a `Fase tecnica 4` antes de abrir demais o scout espacial rico;
- ao fim da `Fase tecnica 4`, o produto ja deve suportar:
  - fluxo casual;
  - escalacao;
  - gol rapido;
  - substituicao;
  - evento parcial;
  - enriquecimento posterior basico.
