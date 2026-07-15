---
title: Table Spec team_modalities
status: Draft
version: 1.0.0
owner: Product Architecture
last_update: 2026-07-14
related_documents:
  - ../../API/Teams_API.md
  - ../../Frontend/Screens/Create_Team_Wizard.md
  - Table_Spec_teams.md
---

# Table Spec team_modalities

## Objetivo

Documentar `modalidades preferenciais do time (team_modalities)` em nível técnico.

## Finalidade

`team_modalities` guarda quais modalidades o time costuma praticar ou quer declarar como contexto operacional.

Esse dado ajuda o app a acelerar criação de jogos, filtros, perfil do time, agenda e configurações futuras, mas não limita o time a jogar somente essas modalidades.

## O que `team_modalities` é

- Uma coleção de modalidades associadas ao time.
- Um dado contextual e operacional.
- A fonte canônica para a lista de modalidades preferenciais exibida no perfil e nas configurações do time.
- Um insumo para preencher telas futuras com valores mais prováveis.

## O que `team_modalities` não é

- Não é histórico esportivo real.
- Não é regra que bloqueia agendamento ou criação de partida em outra modalidade.
- Não substitui a modalidade real de uma partida.
- Não deve ser persistida como coluna singular em `teams`.

## Nome da tabela

- nome da tabela: `team_modalities`
- domínio: Teams

## Campos

- `id` (uuid, PK, default `gen_random_uuid()`)
- `team_id` (uuid, obrigatório, FK -> `teams.id`)
- `modality` (enum `sport_modality`, obrigatório)
- `created_by_user_id` (uuid, FK -> `users.id`, nullable)
- `created_at` (timestamptz, obrigatório)
- `updated_at` (timestamptz, obrigatório)

## Enums

### `sport_modality`

Enum compartilhado com partidas e perfil esportivo.

- `FUTSAL`
- `SOCIETY`
- `FIELD`

## Constraints

- `pk_team_modalities`
  - chave primária em `id`
- `fk_team_modalities_team`
  - `team_id -> teams.id`
- `fk_team_modalities_created_by_user`
  - `created_by_user_id -> users.id`
- `uq_team_modalities_team_modality`
  - único por `team_id + modality`

## Índices

- `idx_team_modalities_team_id`
  - para carregar modalidades de um time.
- `idx_team_modalities_modality`
  - para filtros e descoberta por modalidade.

## Regras de negócio

- Um time pode ter zero, uma ou mais modalidades preferenciais.
- No Create Team Wizard, a pessoa pode marcar uma ou mais modalidades.
- Nenhuma modalidade deve ser obrigatória para criar o time.
- A ausência de linhas em `team_modalities` significa que o time ainda não declarou preferências.
- Selecionar apenas `FUTSAL`, por exemplo, não impede o time de agendar ou jogar `SOCIETY` ou `FIELD`.
- Quando a lista for atualizada pela API, o backend deve sincronizar a coleção final enviada pela tela.
- Duplicidade de modalidade para o mesmo time deve ser bloqueada por constraint.

## Relações

- `teams.id -> team_modalities.team_id`
- `users.id -> team_modalities.created_by_user_id`

## Fluxos que usam

- Create Team Wizard
- Team Settings
- Perfil do time
- Agendamento de jogo
- Busca e descoberta futura por modalidade

## Resumo

`team_modalities` registra o que o time declara como modalidades preferenciais. A modalidade real de cada jogo continua sendo definida no agendamento ou na partida.
