---
title: Table Spec match_attendance_responses
status: Draft
version: 1.2.0
owner: Product Architecture
last_update: 2026-07-09
related_documents:
  - Table_Spec_match_players.md
  - Table_Spec_matches.md
  - ../../Domain/Matches.md
---

# Table Spec match_attendance_responses

## Objetivo

Especificar `match_attendance_responses`: respostas de presença/ausência para partidas agendadas.

## Finalidade

Permitir confirmação de presença pelo app e relatórios futuros como:

- quantas vezes o atleta confirmou;
- quantas vezes recusou;
- quantas vezes confirmou e não apareceu;
- taxa de confiabilidade por período.

Esta tabela não substitui `match_players`.

## Campos sugeridos

- `id` (uuid, PK)
- `match_id` (uuid, FK -> `matches.id`)
- `team_id` (uuid, FK -> `teams.id`)
- `player_id` (uuid, FK -> `players.id`)
- `response_status` (enum `match_attendance_response_status`)
- `responded_by_user_id` (uuid, FK -> `users.id`, nullable)
- `responded_at` (timestamptz, nullable)
- `notes` (text, nullable)
- `created_at`
- `updated_at`

## Enums

- `match_attendance_response_status`
  - `PENDING`
  - `CONFIRMED`
  - `DECLINED`
  - `CONFIRMED_NO_SHOW`

## Regras

- A tabela pertence ao fluxo de jogo agendado e confirmação de presença.
- A resposta de presença continua sendo uma resposta única da pessoa para aquele compromisso esportivo.
- A separação visual por quadro não significa múltiplas respostas de presença por quadro.
- `PENDING`
  - ainda não respondeu.
- `CONFIRMED`
  - informou que vai.
- `DECLINED`
  - informou que não vai.
- `CONFIRMED_NO_SHOW`
  - confirmou presença, mas não compareceu de fato.
- `responded_by_user_id` registra quem respondeu quando a resposta vier por conta autenticada.
- O técnico ou gestão pode disparar o fluxo de cobrança/lembrança, mas o histórico deve permanecer factual.
- No futuro, a cobrança/lembrança pode incluir canais externos, como WhatsApp individual com deep link para o app.
- Mesmo nesse cenário, a resposta oficial de presença continua pertencendo ao app e a esta tabela.
- Esta tabela existe para compromisso com a partida, não para posição, camisa ou titularidade.
- Se o compromisso tiver dois quadros:
  - a UI pode agrupar a mesma resposta de presença dentro do quadro padrão daquele integrante;
  - essa leitura usa `team_player_frame_defaults` como referência logística;
  - a gestão continua podendo mover o integrante de quadro na escalação real depois.

## Unicidade

- Deve existir no máximo uma linha por `match_id + team_id + player_id`.
