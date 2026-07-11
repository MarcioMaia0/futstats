---
title: Table Spec player_modalities
status: Draft
version: 2.0.0
owner: Product Architecture
last_update: 2026-07-10
related_documents:
  - Table_Spec_players.md
  - ../../API/Players_API.md
  - ../../Domain/Players.md
---

# Table Spec player_modalities

## Objetivo

Documentar `modalidades declaradas do atleta (player_modalities)` em nível técnico.

## Finalidade

Registrar em quais modalidades o atleta declara atuar.

Esta tabela existe para sustentar:

- perfil público do atleta;
- fluxo de completar dados do atleta;
- destaques de modalidade na escalação;
- cálculo de completude esportiva básica.

## O que `player_modalities` é

- declaração esportiva do atleta;
- dado de preferência/perfil;
- base de UX e leitura declarada.

## O que `player_modalities` não é

- não é histórico real de partidas;
- não é filtro de limitação operacional;
- não é posição;
- não é vínculo com time.

## Estrutura física sugerida

- schema: `public`
- nome da tabela: `player_modalities`

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
  - ligar a modalidade declarada ao atleta.

### `modality`

- tipo físico: `sport_modality`
- nulidade: `not null`
- finalidade:
  - modalidade declarada pelo atleta.

### `created_at`

- tipo físico: `timestamptz`
- nulidade: `not null`
- default sugerido: `now()`

## Enums físicos

### `sport_modality`

- `FUTSAL`
- `SOCIETY`
- `FIELD`

## Constraints sugeridas

- `pk_player_modalities`
  - colunas: `id`

- `fk_player_modalities_player`
  - coluna: `player_id`
  - referência: `players.id`
  - `on update cascade`
  - `on delete cascade`

- `uq_player_modalities_player_modality`
  - colunas: `player_id, modality`

## Índices sugeridos

- `idx_player_modalities_player_id`
  - colunas: `player_id`

- `idx_player_modalities_modality`
  - colunas: `modality`

## Regras de negócio

1. Um atleta pode ter várias modalidades declaradas.
2. A modalidade aqui é declarada/preferencial.
3. Esta tabela não substitui histórico factual por modalidade.
4. A completude mínima do atleta depende da existência de ao menos uma modalidade declarada.
5. O fato de o atleta não declarar uma modalidade não impede, por si só, registro factual futuro de partida nessa modalidade.
6. Inserções, remoções ou sincronizações nesta tabela devem disparar recálculo de `players.profile_completeness_status` no backend.

## Relações

- `player_modalities.player_id -> players.id`
- conversa com `player_positions`, mas não a substitui
- conversa com `player_profile_summary` e leituras derivadas

## Resumo estrutural

`player_modalities` diz em quais modalidades o atleta afirma atuar. O histórico real continua vindo das partidas.
