---
title: Table Spec players
status: Draft
version: 2.0.0
owner: Product Architecture
last_update: 2026-07-09
related_documents:
  - Table_Spec_persons.md
  - Table_Spec_team_players.md
  - ../../Domain/Players.md
---

# Table Spec players

## Objetivo

Especificar `players`: identidade esportiva de uma `person`.

## Finalidade

Separar a identidade esportiva da identidade-base da pessoa.

`players` existe para representar que uma `person` também é atleta dentro do ecossistema FUTSTATS.

Esta tabela não representa:

- autenticação;
- presença na plataforma;
- vínculo oficial com um time;
- participação em uma partida específica.

## Campos sugeridos

- `id` (uuid, PK)
- `person_id` (uuid, FK -> `persons.id`, unique)
- `dominant_foot` (enum `dominant_foot`, nullable)
- `birth_date` (date, nullable)
- `height_cm` (integer, nullable)
- `weight_kg` (numeric, nullable)
- `profile_completeness_status` (enum `player_profile_completeness_status`)
- `created_at`
- `updated_at`

## Enums

- `dominant_foot`
  - `RIGHT`
  - `LEFT`
  - `AMBIDEXTROUS`
- `player_profile_completeness_status`
  - `INCOMPLETE`
  - `BASIC_COMPLETE`
  - `ENRICHED`

## Regras

- `person_id` é obrigatório e único.
- Uma `person` pode ter no máximo um `player`.
- Nem toda `person` precisa ter `player`.
- Nome, apelido e avatar não ficam em `players`; vêm de `persons`.
- `players` pode nascer com poucos dados e ser enriquecido depois.
- `players` pode nascer apenas para uso operacional do time, mesmo sem `user` associado à `person`.
- Aprovação em `team_join_requests` com modo que inclua `PLAYER` deve:
  - garantir existência de `person`;
  - garantir existência de `player`;
  - garantir, quando aplicável, vínculo em `team_players`.
- O fato de um `player` existir não obriga, por si só, a criação imediata das projeções ricas do perfil do atleta.
- Projeções avançadas podem ser adiadas até que exista reivindicação por uma pessoa real ou outro gatilho explícito de produto.
- Quando um `player` operacional for consolidado no `player` canônico de um usuário, os fatos históricos devem ser reatribuídos ao destino e as projeções derivadas devem ser reconstruídas.

## Regra de completude

- `INCOMPLETE`
  - ainda não tem perfil esportivo mínimo suficiente.
- `BASIC_COMPLETE`
  - possui ao menos uma modalidade e ao menos uma posição válida associada a essa modalidade.
- `ENRICHED`
  - além do básico, possui parte relevante dos dados esportivos complementares, como perna dominante, data de nascimento, altura ou peso.

## Relações esperadas

- `players.person_id`
  - obrigatório e único;
- `player_modalities.player_id`
  - modalidades declaradas do atleta;
- `player_positions.player_id`
  - posições declaradas do atleta;
- `player_positions.modality_position_id`
  - catálogo canônico da posição por modalidade;
- `team_players.player_id`
  - vínculo esportivo oficial com o time;
- `match_players.player_id`
  - participação do atleta em uma partida.
