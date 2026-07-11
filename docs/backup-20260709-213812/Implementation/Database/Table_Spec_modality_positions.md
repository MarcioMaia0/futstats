---
title: Table Spec modality_positions
status: Draft
version: 1.0.0
owner: Product Architecture
last_update: 2026-07-09
related_documents:
  - Table_Spec_player_positions.md
  - Table_Spec_match_players_positions.md
---

# Table Spec modality_positions

## Objetivo

Especificar `modality_positions`: catálogo canônico de posições por modalidade.

## Finalidade

Controlar as posições válidas para cada modalidade, evitando texto livre e mistura entre esportes.

## Campos sugeridos

- `id` (uuid, PK)
- `modality` (enum `sport_modality`)
- `code` (text)
- `label` (text)
- `sort_order` (integer, nullable)
- `is_active` (boolean, default `true`)
- `created_at`
- `updated_at`

## Regras

- Toda posição pertence a uma modalidade.
- Não existe posição sem contexto de modalidade.
- O catálogo serve para:
  - perfil do atleta;
  - escalação da partida;
  - filtros;
  - relatórios;
  - análises futuras.
- `code` deve ser estável e técnico.
- `label` pode ser usado pela UI ou por camada de linguagem.

## Exemplos conceituais

- `FUTSAL`
  - `GOLEIRO`
  - `FIXO`
  - `ALA_DIREITO`
  - `ALA_ESQUERDO`
  - `PIVO`
  - `GOLEIRO_LINHA`
- `FIELD`
  - `GOLEIRO`
  - `LATERAL_DIREITO`
  - `LATERAL_ESQUERDO`
  - `ZAGUEIRO`
  - `VOLANTE`
  - `MEIA`
  - `ATACANTE`

## Unicidade

- Deve existir no máximo uma linha por `modality + code`.

