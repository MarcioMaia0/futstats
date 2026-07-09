---
title: Table Spec user_team_roles
status: Draft
version: 1.1.0
owner: Product Architecture
last_update: 2026-07-08
related_documents:
  - ../../API/Identity_API.md
  - Table_Spec_players.md
  - Table_Spec_team_players.md
  - Table_Spec_team_blocks.md
---

# Table Spec user_team_roles

## Objetivo

Especificar `user_team_roles`: papéis contextuais de uma pessoa dentro de um time.

## Campos sugeridos

- `id` (uuid, PK)
- `user_id` (uuid, FK -> `users.id`)
- `team_id` (uuid, FK -> `teams.id`)
- `role` (enum `team_role`)
- `created_at`

## Enums

- `team_role`: `DIRECTOR | PRESIDENT | COMMITTEE`

No MVP:

- `DIRECTOR` e `PRESIDENT` têm o mesmo peso operacional de gestão;
- `COMMITTEE` representa integrante interno do time sem papel de gestão e sem identidade esportiva de jogador.

## Regras

- Papel contextual não é a mesma coisa que identidade esportiva.
- "Ser jogador" não é `role`: é ter um `player` no elenco ou na partida.
- `DIRECTOR` e `PRESIDENT` concedem gestão do time.
- `COMMITTEE` não concede gestão; ele existe para marcar pertencimento interno ao time com acesso de integrante.
- Integrante do time para audiência `TEAM_MEMBERS` significa:
  - ter linha em `user_team_roles`; ou
  - ser `player` ligado a `user` no elenco do time.
- Torcedor que apenas segue o time não é integrante.

## Regras de hierarquia na aprovação

- `PRESIDENT` exclui `DIRECTOR`, `COMMITTEE` e `Jogador` como papel persistido redundante.
- `DIRECTOR` exclui `COMMITTEE` como papel persistido redundante.
- `COMMITTEE` só deve ser persistido quando a pessoa:
  - não for `PRESIDENT`;
  - não for `DIRECTOR`;
  - não entrar como `Jogador`.
- `Jogador` pode coexistir com `DIRECTOR`.
- `Jogador` pode coexistir com `PRESIDENT`.
- `Jogador` não deve coexistir com `COMMITTEE`.
- `COMMITTEE` não deve coexistir com `DIRECTOR` ou `PRESIDENT`.
- `PRESIDENT` e `DIRECTOR` não devem coexistir no mesmo time para a mesma pessoa no MVP.

## Regra de persistência prática

- Se a aprovação escolher `PRESIDENT`, persistir apenas `PRESIDENT`.
- Se a aprovação escolher `DIRECTOR`, persistir apenas `DIRECTOR`.
- Se a aprovação escolher `COMMITTEE`, persistir apenas `COMMITTEE`.
- Se a aprovação escolher `Jogador`, não persistir `role`; persistir vínculo esportivo.
- Se a aprovação escolher `Jogador + DIRECTOR`, persistir:
  - `user_team_roles.role = DIRECTOR`
  - vínculo esportivo de jogador
- Se a aprovação escolher `Jogador + PRESIDENT`, persistir:
  - `user_team_roles.role = PRESIDENT`
  - vínculo esportivo de jogador
