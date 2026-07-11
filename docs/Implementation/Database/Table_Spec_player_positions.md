---
title: Table Spec player_positions
status: Draft
version: 2.0.0
owner: Product Architecture
last_update: 2026-07-10
related_documents:
  - Table_Spec_players.md
  - Table_Spec_modality_positions.md
  - ../../API/Players_API.md
  - ../../Domain/Players.md
---

# Table Spec player_positions

## Objetivo

Documentar `posições declaradas do atleta (player_positions)` em nível técnico.

## Finalidade

Registrar as posições que o atleta declara jogar, por modalidade canônica.

Esta tabela existe para sustentar:

- perfil do atleta;
- destaque de posições na escalação;
- UX de cadastro fino;
- cálculo de completude esportiva.

## O que `player_positions` é

- declaração de posição;
- dado de perfil;
- dado associado a catálogo canônico por modalidade.

## O que `player_positions` não é

- não é posição efetivamente jogada;
- não é evento da partida;
- não é formação tática em tempo real.

## Estrutura física sugerida

- schema: `public`
- nome da tabela: `player_positions`

## Colunas

### `id`

- tipo físico: `uuid`
- nulidade: `not null`
- default sugerido: `gen_random_uuid()`
- PK: sim

### `player_id`

- tipo físico: `uuid`
- nulidade: `not null`
- FK: `players.id`
- `on update`: `cascade`
- `on delete`: `cascade`
- finalidade:
  - ligar a posição declarada ao atleta.

### `modality_position_id`

- tipo físico: `uuid`
- nulidade: `not null`
- FK: `modality_positions.id`
- `on update`: `cascade`
- `on delete`: `restrict`
- finalidade:
  - apontar para a posição canônica da modalidade.

### `created_at`

- tipo físico: `timestamptz`
- nulidade: `not null`
- default sugerido: `now()`

## Constraints sugeridas

- `pk_player_positions`
  - colunas: `id`

- `fk_player_positions_player`
  - coluna: `player_id`
  - referência: `players.id`
  - `on update cascade`
  - `on delete cascade`

- `fk_player_positions_modality_position`
  - coluna: `modality_position_id`
  - referência: `modality_positions.id`
  - `on update cascade`
  - `on delete restrict`

- `uq_player_positions_player_modality_position`
  - colunas: `player_id, modality_position_id`

## Índices sugeridos

- `idx_player_positions_player_id`
  - colunas: `player_id`

- `idx_player_positions_modality_position_id`
  - colunas: `modality_position_id`

## Regras de negócio

1. Um atleta pode ter várias posições declaradas.
2. A modalidade é herdada do catálogo `modality_positions`.
3. Esta tabela não representa posição efetivamente usada em jogo.
4. O histórico posicional real deve vir de `match_players_positions` e dos fatos da partida.
5. A completude mínima do atleta depende da existência de ao menos uma posição válida coerente com sua identidade esportiva declarada.
6. Inserções, remoções ou sincronizações nesta tabela devem disparar recálculo de `players.profile_completeness_status` no backend.

## Relações

- `player_positions.player_id -> players.id`
- `player_positions.modality_position_id -> modality_positions.id`
- conversa com `player_modalities`, mas não depende de cópia de `modality` aqui
- conversa com `match_players_positions`, mas não a substitui

## Resumo estrutural

`player_positions` diz onde o atleta afirma jogar. O que ele realmente jogou continua sendo decidido pelos dados factuais das partidas.
