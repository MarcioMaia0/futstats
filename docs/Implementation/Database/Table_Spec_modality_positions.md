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

## Catálogo inicial recomendado

As posições devem ser cadastradas em ordem de trás para frente.

### `FUTSAL`

1. `GOALKEEPER` -> Goleiro
2. `FIXED_DEFENDER` -> Fixo
3. `RIGHT_WINGER` -> Ala direito
4. `LEFT_WINGER` -> Ala esquerdo
5. `PIVOT` -> Pivô

### `FIELD`

1. `GOALKEEPER` -> Goleiro
2. `RIGHT_CENTER_BACK` -> Zagueiro direito
3. `LEFT_CENTER_BACK` -> Zagueiro esquerdo
4. `RIGHT_BACK` -> Lateral direito
5. `LEFT_BACK` -> Lateral esquerdo
6. `DEFENSIVE_MIDFIELDER` -> Volante
7. `CENTRAL_MIDFIELDER` -> Meia central
8. `ATTACKING_MIDFIELDER` -> Meia ofensivo
9. `RIGHT_WINGER` -> Ponta direita
10. `LEFT_WINGER` -> Ponta esquerda
11. `SECOND_STRIKER` -> Segundo atacante
12. `CENTER_FORWARD` -> Centroavante

### `SOCIETY`

1. `GOALKEEPER` -> Goleiro
2. `CENTER_BACK` -> Zagueiro
3. `RIGHT_BACK` -> Lateral direito
4. `LEFT_BACK` -> Lateral esquerdo
5. `DEFENSIVE_MIDFIELDER` -> Volante
6. `CENTRAL_MIDFIELDER` -> Meio-campista
7. `RIGHT_WINGER` -> Ala direita
8. `LEFT_WINGER` -> Ala esquerda
9. `STRIKER` -> Atacante
10. `CENTER_FORWARD` -> Centroavante

## Unicidade

- Deve existir no máximo uma linha por `modality + code`.
