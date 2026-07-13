---
title: Match Operation Reusables
status: Draft
version: 1.1.0
owner: Product Architecture
last_update: 2026-07-13
related_documents:
  - ./Screens/Lineup_And_Live_Operation.md
  - ../Implementation/Match_Operation_Technical_Contract.md
---

# Match Operation Reusables

## Objetivo

Centralizar componentes, hooks e metodos reutilizaveis da superficie operacional de partida sem depender do catalogo legado enquanto ele nao for normalizado.

## Reaproveitados

### ConfirmationModal

- usar em edicao rapida de gol e confirmacoes sensiveis.

### ImagePreviewCard

- usar em foto opcional de jogador adversario local.

### ImageAcquisitionFlow

- usar quando o operador quiser foto de jogador adversario local.

### EntitySearchInput

- pode ser evoluido para busca de atleta e adversario em fluxos auxiliares.

### ToggleField

- pode ser reaproveitado em preferencias operacionais simples.

## Novos componentes

### MatchScoreStrip

- escudos, placar e cronometro;
- suporte a gol rapido e edicao rapida.

### MatchBoardCanvas

- superficie isometrica de quadra ou campo.

### MatchActorCardGrid

- grid de cards dos atletas fora da quadra.

### MatchActorToken

- avatar ou circulo com numero para atores em quadra.

### QuickGoalAttributionSheet

- atribuicao rapida do autor do gol por avatar ou numero.

### ContextualRadialMenu

- menu radial com `Ataque (ATTACK)` e `Defesa (DEFENSE)`.

### BallTargetBoard

- destino espacial da bola em fluxos ricos.

### BenchSwapTray

- substituicao por selecao do banco.

### PartialSaveActionBar

- `Salvar`, `Cancelar` e `Desfazer` em qualquer etapa do microfluxo.

### OperatorScopePanel

- configuracao visual de responsabilidades dos operadores.

### MatchMomentumTimeline

- nome em português: `Timeline de pressão do jogo`;
- renderiza a leitura visual de pressão da partida;
- deve usar `@shopify/react-native-skia` para a área gráfica;
- chips, bottom sheets e popovers devem continuar como componentes React Native normais por cima do canvas;
- usado em:
  - `Momento do jogo` vertical, visível abaixo da quadra;
  - `Momento do jogo` horizontal, aberto por botão/overlay;
  - futura análise pós-jogo em versão expandida.

Responsabilidades:

- desenhar linha central de tempo;
- desenhar pulsos, barras ou marcadores acima e abaixo da linha;
- diferenciar próprio time e adversário;
- renderizar ícones de eventos;
- aceitar filtros por tipo de evento;
- aceitar filtro por jogador;
- permitir toque em marcador para abrir detalhe do lance.

O componente não deve:

- buscar eventos crus diretamente;
- recalcular regras de domínio divergentes do backend;
- persistir dados próprios;
- substituir `match_events`, `match_goals` ou `match_substitutions`.

### MatchMomentumPlayerPickerSheet

- bottom sheet acionado pelo filtro `Jogador (PLAYER)`;
- lista titulares e reservas da partida;
- usa foto/avatar e número da camisa no mesmo padrão dos atores em quadra;
- ao selecionar um jogador, aplica `match_player_id` no filtro da timeline.

### MatchMomentumEventPopover

- popover curto aberto ao tocar em marcador da timeline;
- mostra tempo, tipo do evento, lado e participantes principais;
- deve suportar eventos agrupados no mesmo intervalo.

## Iconografia da timeline

Mapa inicial:

- `ALL`
  - nome em português: `Todos`
  - ícone: bola ou filtro discreto.
- `SHOTS`
  - nome em português: `Chutes`
  - ícone: alvo, mira ou bola com trajetória.
- `GOALS`
  - nome em português: `Gols`
  - ícone: gol, rede ou bola na rede.
- `FOULS`
  - nome em português: `Faltas`
  - ícone: apito ou alerta esportivo.
- `SAVES`
  - nome em português: `Defesas`
  - ícone: luva de goleiro.
- `DRIBBLES`
  - nome em português: `Dribles`
  - ícone: chuteira, marcador de movimento ou rastro curto.
- `PASSES`
  - nome em português: `Passes`
  - ícone: seta/linha de passe.
- `PLAYER`
  - nome em português: `Jogador`
  - ícone: camisa, atleta ou avatar circular.

Regra:

- usar `lucide-react-native` para ícones genéricos quando houver equivalência boa;
- criar SVGs proprietários do FUTSTATS para ícones esportivos sem boa equivalência, como luva, chuteira, gol/rede e bola com trajetória;
- ícones da timeline devem ser pequenos, legíveis e não podem competir com os marcadores do gráfico.

## Novos hooks e metodos

### useMatchBoardActors

- hidrata atores da partida para a superficie.

### useLineupSelection

- controla relacionados, titulares e banco.

### useCasualGoalRegistration

- registra gol por toque no escudo e abre atribuicao rapida.

### useContextualMicroflow

- controla o estado do microfluxo contextual.

### usePartialEventDraft

- salva o nucleo minimo e permite enriquecimento posterior.

### useBenchSubstitution

- trata o gesto de substituicao.

### useMatchOperatorAssignments

- carrega e valida responsabilidades dos operadores.

### useMatchClockControl

- controla o cronometro no operador autorizado.

### useMatchMomentum

- carrega `GET /api/v1/matches/:match_id/momentum`;
- aplica filtros de janela, tipo de evento e jogador;
- escuta realtime de eventos, gols e substituições da partida;
- incorpora eventos locais pendentes quando existirem;
- recalcula o estado visual da timeline sem depender de consulta completa a cada lance.

### useMatchMomentumPlayerFilter

- controla abertura do seletor de jogador;
- aplica e limpa o filtro por `match_player_id`;
- preserva a janela de tempo e o tipo de evento selecionados.
