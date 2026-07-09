---
title: Matches Domain
status: Draft
version: 0.4.0
owner: Product Architecture
last_update: 2026-07-09
related_documents: []
---

# Matches Domain

## Objetivo

Definir partidas como evento central do FUTSTATS.

## Níveis

1. Casual: placar, gols e compartilhamento.
2. Organizado: elenco, quadra, adversário e arbitragem.
3. Avançado: scout, eventos, estatísticas.

## Regras

1. Partida pode ser criada com dados mínimos.
2. Gol pode existir sem autor.
3. Scout nunca é obrigatório.
4. Primeiro e segundo quadro são partidas independentes.
5. Cancelamento permanece no histórico.
6. Editar gols recalcula placar.
7. Atleta relacionado para a partida não é o mesmo conceito de atleta oficial do time.
8. Confirmação de presença pertence a outra camada, diferente da escalação.
9. Substituições detalhadas e eventos táticos finos podem evoluir sem bloquear o fluxo casual.
10. O técnico efetivo da partida deve ser registrado separadamente do elenco.

## Modalidades

1. Toda partida possui uma modalidade canônica: `FUTSAL`, `SOCIETY` ou `FIELD`.
2. A quantidade de titulares (`starters_count`) tem padrão derivado da modalidade (5/7/11) e pode ser ajustada por partida.
3. A modalidade é herdada do time (`default_modality`) e nunca exige escolha no fluxo casual.
4. Estatísticas e rankings podem segmentar por modalidade.
5. Ver `ADR_011_Multi_Modality_Support.md`.

## Camadas de participação na partida

- `match_players`
  - quem foi relacionado para o jogo por aquele time;
- `match_players_positions`
  - em quais posições aquele atleta pode atuar naquela partida;
- `team_staff_defaults`
  - staff padrão do time para facilitar criação da partida;
- `match_staff`
  - técnico efetivo registrado para aquela partida;
- `match_attendance_responses`
  - se confirmou ou recusou presença para jogo agendado;
- `match_substitutions`
  - quem entrou no lugar de quem durante o jogo;
- `match_events`
  - lances e acontecimentos granulares da partida.

## Regra de separação

- Um atleta avulso pode existir globalmente como `player` sem virar `team_player`.
- Participação na partida não deve ser confundida com vínculo oficial com o time.
- Confirmação de presença não deve ser confundida com escalação.
- Técnico padrão do time não substitui técnico efetivo da partida.
