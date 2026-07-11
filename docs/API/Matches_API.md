---
title: Matches API
status: Draft
version: 1.7.0
owner: Product Architecture
last_update: 2026-07-10
related_documents:
  - ./Scheduled_Matches_API.md
  - ../Domain/Matches.md
  - ../Implementation/Database/Table_Spec_matches.md
---

# Matches API

## Objetivo

Definir a familia de endpoints da partida operacional, separada da agenda de jogos.

## Fronteira do agregado

`matches` representa:

- partida operacional;
- escalacao;
- placar;
- gols;
- eventos ao vivo;
- substituicoes;
- operadores da partida;
- encerramento e revisao analitica.

`matches` nao representa:

- planejamento inicial do jogo;
- liberacao da agenda para o time;
- presenca ao compromisso.

Esses comportamentos pertencem a `scheduled_matches`.

## Rotas iniciais

```text
POST /api/v1/matches
GET /api/v1/matches/:match_id
PATCH /api/v1/matches/:match_id
POST /api/v1/matches/:match_id/lineups/save
PATCH /api/v1/matches/:match_id/related-players
POST /api/v1/matches/:match_id/goals/quick
POST /api/v1/matches/:match_id/goals
PATCH /api/v1/matches/:match_id/goals/:goal_id
POST /api/v1/matches/:match_id/events
PATCH /api/v1/matches/:match_id/events/:event_id
POST /api/v1/matches/:match_id/substitutions
POST /api/v1/matches/:match_id/opponent-players
PATCH /api/v1/matches/:match_id/opponent-players/:match_opponent_player_id
POST /api/v1/matches/:match_id/operator-assignments
PATCH /api/v1/matches/:match_id/operator-assignments/:assignment_id
POST /api/v1/matches/:match_id/finish
POST /api/v1/matches/:match_id/cancel
```

## Regras

- Criar partida deve aceitar modo rapido.
- Criar partida deve aceitar fluxo sem agendamento previo.
- Se a partida nascer sem agendamento previo, o backend pode derivar um item de agenda vinculado para manter a leitura cronologica do time.
- Quando a partida nascer a partir de um compromisso planejado, a ponte oficial deve vir de `Scheduled Matches API`.
- A API de partida deve expor separadamente:
  - `status` para estado operacional;
  - `analysis_status` para estado analitico;
- `POST /api/v1/matches/:match_id/lineups/save`
  - cria ou atualiza a escalacao da propria `match`;
  - como `matches` ja representa um quadro especifico, a rota nao deve repetir `frame_type`.
  - deve validar o minimo de relacionados e titulares conforme `matches.starters_count`.
- `GET /api/v1/matches/:match_id`
  - deve conseguir reabrir uma partida em rascunho com todos os dados necessarios para remontar a tela de escalacao;
  - quando `status = DRAFT` e `operation_phase = READY_TO_START`, a resposta deve incluir a leitura completa do rascunho de escalação.
- `POST /api/v1/matches/:match_id/goals/quick`
  - suporta o modo casual por toque no escudo.
  - quando o gol for do adversário, o endpoint deve aceitar registro sem autor identificado.
- `POST /api/v1/matches/:match_id/goals`
  - registra gol com contexto adicional, sem exigir scout fino completo.
  - também deve aceitar gol adversário sem autor identificado.
- `PATCH /api/v1/matches/:match_id/goals/:goal_id`
  - edita autoria, assistência, tempo, lado e vínculo com evento fino.
  - também deve permitir manter ou voltar gol adversário para autoria indefinida.
- `POST /api/v1/matches/:match_id/events`
  - deve aceitar evento parcial.
  - deve aceitar `completion_stage = MINIMAL | PARTIAL | DETAILED`.
  - para eventos do adversário, o ator pode continuar opcional quando o tipo do evento permitir.
- `PATCH /api/v1/matches/:match_id/events/:event_id`
  - deve permitir enriquecer evento ja salvo parcialmente.
  - deve permitir promover o evento para `REVIEWED` durante revisão posterior.
- `POST /api/v1/matches/:match_id/substitutions`
  - registra troca de atletas do próprio time ou do adversário.
  - no caso do adversário, exige atores identificados de entrada e saída.
- `POST /api/v1/matches/:match_id/opponent-players`
  - cria ator adversario operacional para aquela partida.
  - esse cadastro é opcional e não é pré-requisito para registrar gol adversário.
- `POST /api/v1/matches/:match_id/operator-assignments`
  - define responsabilidades dos operadores da partida.
- Gol pode ser salvo sem jogador.
- Finalizar partida dispara consolidacao.
- Escopo de agenda, confirmacao interna, liberacao para o time e presenca nao devem ser reabertos aqui.

## Regra de leitura para reabrir a escalação em rascunho

Quando a `partida (match)` estiver em:

- `status = DRAFT`
- `operation_phase = READY_TO_START`

o `GET /api/v1/matches/:match_id` deve retornar dados suficientes para a UI reconstruir:

- relacionados ja escolhidos;
- titulares;
- reservas;
- goleiro definido;
- numeros de camisa confirmados;
- posicoes iniciais ja salvas;
- tecnico confirmado da partida, quando existir;
- jogadores elegiveis ainda disponiveis fora da escalação.

Blocos minimos esperados na resposta:

- `match`
- `lineup_draft`
- `related_players`
- `available_players`
- `coach_context`

## Regra do tecnico da partida

- a escolha final do tecnico da partida pertence a `match_staff`;
- a sugestao inicial do tecnico pertence a `team_staff_defaults`;
- o `GET /api/v1/matches/:match_id` deve devolver em `coach_context`:
  - tecnico pre-configurado do time para a modalidade;
  - tecnico efetivamente confirmado para aquela partida, quando existir;
- a escalação pode existir mesmo sem tecnico confirmado naquele momento.

## Regra de `Quantidade de titulares (starters_count)` na partida

- `FUTSAL`
  - exige `5` titulares.
- `FIELD`
  - exige `11` titulares.
- `SOCIETY`
  - nasce com `6` titulares por padrao.
  - pode ser ajustado operacionalmente para `7` na escalação.

Regras:

- `POST /api/v1/matches/:match_id/lineups/save` deve validar:
  - quantidade de relacionados `>= matches.starters_count`;
  - quantidade de titulares `= matches.starters_count`;
  - todo titular deve estar dentro do conjunto de relacionados;
- não existe limite máximo de relacionados;
- todo relacionado não titular deve ser persistido como reserva;
- `shirt_number` é obrigatório para todo relacionado;
- o banco pode ficar vazio quando o time tiver apenas o mínimo para jogar;
- posição inicial não é obrigatória para salvar, exceto para o goleiro titular;
- o número da camisa deve ser confirmado na UI antes de o jogador entrar oficialmente como relacionado;
- deve existir exatamente um goleiro titular configurado ao salvar a escalação;
- quando o ajuste de `SOCIETY` mudar `starters_count`, o novo valor deve ser persistido:
  - em `matches.starters_count`;
  - e em `scheduled_matches.starters_count`, quando existir vínculo com agenda.

## Regra de edição após o início da partida

- a escalação inicial de `titulares` trava quando a partida começa;
- a edição do `elenco relacionado` continua permitida durante a partida para suportar:
  - jogadores atrasados;
  - inclusão de avulsos;
  - correções de camisa;
- após a partida terminar, o elenco relacionado e dados operacionais equivalentes continuam editáveis em revisão por vídeo.

## Separação oficial entre os comandos

- `POST /api/v1/matches/:match_id/lineups/save`
  - serve apenas para salvar a escalação inicial antes do início do jogo;
  - define:
    - titulares iniciais;
    - reservas iniciais;
    - goleiro inicial;
    - números confirmados naquele momento.
- `PATCH /api/v1/matches/:match_id/related-players`
  - serve para manutenção posterior do elenco relacionado;
  - permite:
    - adicionar atrasado;
    - adicionar avulso;
    - remover relacionado quando fizer sentido operacional;
    - corrigir `shirt_number`;
    - ajustar dados do relacionado durante o jogo e na revisão.

## Operações oficiais de `related-players`

- `ADD`
  - adiciona atleta existente como relacionado não titular.
- `ADD_GUEST`
  - cria ou reaproveita `person + player` e adiciona como relacionado não titular.
- `UPDATE_SHIRT_NUMBER`
  - corrige a camisa do relacionado naquele quadro.
- `REMOVE`
  - remove fisicamente quando não houver dependência factual;
  - quando já houver dependência factual, vira remoção lógica.

Bloqueiam exclusão física de `relacionado da partida (match_player)`:

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

Não bloqueia sozinho:

- `posições usadas pelo atleta na partida (match_players_positions)`

## Operações oficiais de `jogadores adversários da partida (opponent-players)`

- `ADD`
  - adiciona jogador adversário operacional à partida.
- `UPDATE`
  - corrige camisa, nome contextual, foto contextual ou status de titular.
- `REMOVE`
  - remove fisicamente quando não houver dependência factual;
  - quando já houver dependência factual, vira remoção lógica.

Bloqueiam exclusão física de `jogador adversário da partida (match_opponent_player)`:

- `eventos da partida (match_events)`:
  - `primary_match_opponent_player_id`
  - `secondary_match_opponent_player_id`
- `substituições da partida (match_substitutions)`:
  - `opponent_player_in_match_opponent_player_id`
  - `opponent_player_out_match_opponent_player_id`
