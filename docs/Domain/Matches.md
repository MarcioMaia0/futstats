---
title: Matches Domain
status: Draft
version: 0.3.0
owner: Product Architecture
last_update: 2026-07-06
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

## Modalidades

1. Toda partida possui uma modalidade canônica: `FUTSAL`, `SOCIETY` ou `FIELD`.
2. A quantidade de titulares (`starters_count`) tem padrão derivado da modalidade (5/7/11) e pode ser ajustada por partida.
3. A modalidade é herdada do time (`default_modality`) e nunca exige escolha no fluxo casual.
4. Estatísticas e rankings podem segmentar por modalidade.
5. Ver `ADR_011_Multi_Modality_Support.md`.
