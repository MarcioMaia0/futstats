---
title: Table Spec match_staff
status: Draft
version: 1.0.0
owner: Product Architecture
last_update: 2026-07-09
related_documents:
  - Table_Spec_matches.md
  - Table_Spec_team_staff_defaults.md
  - ../../Domain/Matches.md
---

# Table Spec match_staff

## Objetivo

Especificar `match_staff`: staff efetivo registrado para uma partida.

## Finalidade

Registrar quem atuou como técnico do time naquela partida específica, permitindo histórico, estatísticas e relatórios reais por jogo.

## Campos sugeridos

- `id` (uuid, PK)
- `match_id` (uuid, FK -> `matches.id`)
- `team_id` (uuid, FK -> `teams.id`)
- `person_id` (uuid, FK -> `persons.id`)
- `staff_role` (enum `staff_role`)
- `created_at`
- `updated_at`

## Enums

- `staff_role`
  - `HEAD_COACH`

## Regras

- Tudo aponta para `person_id`.
- O técnico da partida pode ser:
  - um jogador;
  - um dirigente;
  - alguém da comissão;
  - alguém sem conta.
- Ao criar a partida, o sistema pode pré-preencher com o técnico padrão do time.
- Na escalação, o técnico efetivo da partida pode ser alterado.
- O que vale para estatística e histórico é sempre esta tabela, não o default do time.

## Unicidade

- No MVP, deve existir no máximo um `HEAD_COACH` por `match_id + team_id`.

