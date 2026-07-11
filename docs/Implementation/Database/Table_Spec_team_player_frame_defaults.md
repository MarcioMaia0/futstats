---
title: Table Spec team_player_frame_defaults
status: Draft
version: 2.1.0
owner: Product Architecture
last_update: 2026-07-10
related_documents:
  - Table_Spec_team_players.md
  - Table_Spec_scheduled_matches.md
  - Table_Spec_match_attendance_responses.md
  - Table_Spec_matches.md
  - ../../Domain/Matches.md
  - ../../Frontend/Screens/Lineup_And_Live_Operation.md
---

# Table Spec team_player_frame_defaults

## Objetivo

Documentar `pré-configuração padrão de quadro do atleta no time (team_player_frame_defaults)` em nível técnico.

## Finalidade

`team_player_frame_defaults` representa a referência logística que o time mantém para dizer em qual quadro um atleta costuma participar em cada modalidade.

Ela existe para sustentar:

- leitura logística do elenco antes do jogo;
- agrupamento visual de presença por quadro;
- ajuda operacional na preparação de primeiro e segundo quadro;
- sugestão inicial para escalação, sem travar a decisão real do jogo.

## O que `team_player_frame_defaults` é

- configuração logística padrão;
- preferência operacional do time por atleta e modalidade;
- apoio à organização dos quadros.

## O que `team_player_frame_defaults` não é

- não é escalação da partida;
- não é presença;
- não é participação real por quadro;
- não é vínculo esportivo oficial;
- não é restrição rígida de uso do atleta.

## Responsabilidade na cadeia do domínio

No fluxo correto:

1. o atleta faz parte do elenco oficial em `team_players`;
2. o time pode definir em qual quadro ele costuma atuar por modalidade;
3. essa referência ajuda na leitura de presença e pré-organização;
4. a escalação real do jogo continua sendo decidida depois, no contexto da `match`.

Logo:

- pertencimento esportivo oficial pertence a `team_players`;
- compromisso futuro pertence a `scheduled_matches`;
- resposta de presença pertence a `match_attendance_responses`;
- configuração padrão de quadro pertence a `team_player_frame_defaults`;
- participação real por quadro pertence a `matches` e tabelas derivadas.

## Quando nasce

`team_player_frame_defaults` nasce quando a gestão decide configurar ou ajustar o quadro padrão de um atleta do elenco.

## Quem grava

`team_player_frame_defaults` é gravada pela aplicação.

Casos de uso relevantes:

- `SetTeamPlayerFrameDefault`
- `UpdateTeamPlayerFrameDefault`
- `ClearTeamPlayerFrameDefault`

## Estrutura física sugerida

- schema: `public`
- nome da tabela: `team_player_frame_defaults`

## Colunas

### `id`

- tipo físico: `uuid`
- nulidade: `not null`
- default sugerido: `gen_random_uuid()`
- PK: sim

### `team_id`

- tipo físico: `uuid`
- nulidade: `not null`
- FK: `teams.id`
- `on update`: `cascade`
- `on delete`: `restrict`
- finalidade:
  - redundância controlada para leitura rápida e validação contextual.

### `player_id`

- tipo físico: `uuid`
- nulidade: `not null`
- FK: `players.id`
- `on update`: `cascade`
- `on delete`: `restrict`
- finalidade:
  - apontar qual atleta recebe a configuração padrão de quadro.

### `modality`

- tipo físico: `sport_modality`
- nulidade: `not null`
- finalidade:
  - garantir que a referência seja separada por modalidade.

### `default_frame_type`

- tipo físico: `default_frame_type`
- nulidade: `not null`
- default sugerido: `UNASSIGNED`
- finalidade:
  - indicar o quadro padrão logístico do atleta naquela modalidade.

### `created_by_user_id`

- tipo físico: `uuid`
- nulidade: `nullable`
- FK: `users.id`
- `on update`: `cascade`
- `on delete`: `set null`
- finalidade:
  - registrar quem criou a configuração, quando houver ação autenticada rastreável.

### `created_at`

- tipo físico: `timestamptz`
- nulidade: `not null`
- default sugerido: `now()`

### `updated_at`

- tipo físico: `timestamptz`
- nulidade: `not null`
- default sugerido: `now()`
- manutenção sugerida:
  - trigger de atualização automática no update

## Enums físicos

### `default_frame_type`

- `SECOND_FRAME`
- `FIRST_FRAME`
- `UNASSIGNED`

## Regras dos enums

- `SECOND_FRAME`
  - o atleta costuma participar do segundo quadro naquela modalidade.

- `FIRST_FRAME`
  - o atleta costuma participar do primeiro quadro naquela modalidade.

- `UNASSIGNED`
  - o time não definiu preferência logística padrão.

## Constraints sugeridas

## Primary key

- `pk_team_player_frame_defaults`
  - colunas: `id`

## Foreign keys

- `fk_team_player_frame_defaults_team`
  - coluna: `team_id`
  - referência: `teams.id`
  - `on update cascade`
  - `on delete restrict`

- `fk_team_player_frame_defaults_player`
  - coluna: `player_id`
  - referência: `players.id`
  - `on update cascade`
  - `on delete restrict`

- `fk_team_player_frame_defaults_created_by_user`
  - coluna: `created_by_user_id`
  - referência: `users.id`
  - `on update cascade`
  - `on delete set null`

## Unicidade

Deve existir no máximo uma linha por:

- `team_id + player_id + modality`

Nome sugerido:

- `uq_team_player_frame_defaults_team_player_modality`

## Índices sugeridos

- `idx_team_player_frame_defaults_team_id`
  - colunas: `team_id`
  - finalidade:
    - leitura logística do elenco do time.

- `idx_team_player_frame_defaults_player_id`
  - colunas: `player_id`
  - finalidade:
    - histórico e leitura por atleta.

- `idx_team_player_frame_defaults_team_id_modality`
  - colunas: (`team_id`, `modality`)
  - finalidade:
    - montar agrupamentos por modalidade.

- `idx_team_player_frame_defaults_default_frame_type`
  - colunas: `default_frame_type`
  - finalidade:
    - separar rapidamente quem costuma ser primeiro ou segundo quadro.

## Regras de negócio centrais

1. Esta tabela não substitui `team_players`.
2. Esta tabela não escala ninguém automaticamente para uma partida.
3. Esta tabela guarda apenas uma referência padrão de logística do time.
4. A gestão pode escalar o atleta em quadro diferente no contexto de um jogo específico.
5. A configuração deve ser por modalidade.
6. `SECOND_FRAME` continua sendo conceito canônico, mesmo quando aparecer antes na UI.
7. Quando o jogo tiver `match_frame_count = 1`, essa configuração pode ser ignorada para leitura de presença e preparação.

## Regras de consistência contextual

O backend deve validar que:

- existe vínculo esportivo oficial ativo do atleta com o time em `team_players`;
- a modalidade configurada faz sentido no contexto do produto;
- a combinação `team_id + player_id` é coerente com o elenco do time.

Em outras palavras:

- não deve existir default de quadro para atleta que não pertence oficialmente ao elenco daquele time.

Essa coerência é semântica e pode exigir validação de aplicação, porque a FK direta para `team_players` não está materializada nesta estrutura.

## Relações com outras tabelas

## Relação com `team_players`

- relação lógica obrigatória;
- essa tabela pressupõe que o atleta faça parte do elenco oficial do time.

## Relação com `scheduled_matches`

- quando `scheduled_matches.match_frame_count = 2`, a UI pode usar esta tabela para agrupar leitura de presença;
- quando `match_frame_count = 1`, a configuração pode ser ignorada.

## Relação com `match_attendance_responses`

- a UI pode usar `team_player_frame_defaults` para mostrar os integrantes agrupados por quadro esperado;
- isso não cria múltiplas respostas de presença;
- isso não altera a unicidade de `match_attendance_responses`.

## Relação com `matches`

- a escalação real do quadro continua pertencendo a `matches` e tabelas derivadas;
- `team_player_frame_defaults` é apenas sugestão logística anterior ao jogo.

## Regras operacionais por fluxo

### Leitura de presença

Se o compromisso tiver dois quadros:

- a UI pode separar os integrantes em:
  - segundo quadro
  - primeiro quadro
  - sem quadro definido

Essa leitura é apenas logística.

### Escalação real

No momento da escalação:

- o sistema pode sugerir a organização inicial com base nesse default;
- a gestão continua livre para mudar qualquer atleta de quadro;
- a decisão final do jogo não regrava automaticamente este default, a menos que exista uma regra futura explícita para aprender com o uso.

Regra complementar:

- a sugestão visual final da escalação não depende apenas do quadro padrão;
- ela deve considerar também a resposta de presença para priorizar a lista do quadro em montagem.

## Regra oficial de prioridade visual na escalação

Quando um quadro estiver sendo configurado, a UI deve sugerir atletas nesta ordem:

1. atletas do quadro atual com `GOING`
2. atletas do quadro atual com `MAYBE`
3. atletas do quadro atual com `GOING_NOT_PLAYING`
4. atletas do outro quadro na mesma ordem
5. jogadores avulsos

Regras:

- `team_player_frame_defaults` ajuda a identificar quadro atual versus outro quadro;
- a tabela não define titularidade;
- a tabela não define reserva;
- a tabela não define goleiro;
- a tabela não define técnico da partida.

### Mudança administrativa

A diretoria pode:

- definir um quadro padrão;
- mudar de primeiro para segundo quadro;
- remover a preferência e deixar `UNASSIGNED`.

## O que não deve ficar em `team_player_frame_defaults`

Não devem ficar aqui:

- presença no jogo;
- confirmação de ida ou falta;
- quadro real jogado no dia;
- titularidade;
- reservas;
- estatística por quadro.

Esses dados pertencem, respectivamente, a:

- `match_attendance_responses`
- `match_attendance_responses`
- `matches` e `match_players`
- `match_players`
- `match_players`
- tabelas factuais da partida

## Dependências diretas desta tabela

Esta tabela conversa diretamente com:

- `team_players`
- `teams`
- `players`
- `users`
- `scheduled_matches`
- `match_attendance_responses`
- `matches`
- pré-escalação logística

## Riscos de alteração futura

Mudanças em:

- cardinalidade por modalidade;
- semântica de quadro padrão;
- relação entre default logístico e escalação real;
- uso dessa tabela na leitura de presença

impactam em cascata:

- agenda com dois quadros;
- leitura logística do elenco;
- confirmação de presença;
- preparação da escalação;
- experiência da diretoria na várzea.

## Resumo estrutural

`team_player_frame_defaults` é a memória logística do time sobre onde cada atleta costuma atuar quando existe divisão por quadros. Ele ajuda a organizar, mas não manda no jogo.
