---
title: Table Spec local_opponents
status: Draft
version: 2.0.0
owner: Product Architecture
last_update: 2026-07-10
related_documents:
  - Table_Spec_local_opponent_players.md
  - Table_Spec_scheduled_matches.md
  - Table_Spec_matches.md
  - Table_Spec_match_opponent_players.md
  - ../../Domain/Matches.md
  - ../../API/Matches_API.md
  - ../../API/Scheduled_Matches_API.md
---

# Table Spec local_opponents

## Objetivo

Documentar `adversários locais (local_opponents)` em nível técnico.

## Finalidade

`local_opponents` representa a agenda privada e a memória reutilizável que um time mantém sobre adversários que podem ou não existir oficialmente no app.

Ela existe para sustentar:

- agendamento rápido de jogos;
- reaproveitamento de adversários recorrentes;
- escudo, contato e observações privadas;
- histórico interno de confrontos;
- base para cadastro de `local_opponent_players`;
- futura reivindicação de histórico por um time oficial, se isso evoluir.

## O que `local_opponents` é

- catálogo privado de adversários de um time;
- agenda de contatos esportivos;
- memória reutilizável entre agendamento e operação da partida.

## O que `local_opponents` não é

- não é `team` oficial do produto;
- não é adversário operacional da partida em si;
- não é identidade pública compartilhada entre todos os times;
- não é apenas um campo de texto solto dentro do jogo agendado.

## Responsabilidade na cadeia do domínio

No fluxo correto:

1. um time quer agendar ou registrar um confronto;
2. se o adversário já não existir como `team` oficial reutilizável naquele contexto, o time pode usar `local_opponents`;
3. a agenda usa esse registro para reaproveitar nome, escudo, contato e memória;
4. a partida operacional pode herdar snapshots a partir desse registro;
5. jogadores privados daquele adversário vivem em `local_opponent_players`.

Logo:

- memória privada do adversário pertence a `local_opponents`;
- memória privada dos atletas daquele adversário pertence a `local_opponent_players`;
- fato operacional do confronto continua pertencendo a `scheduled_matches`, `matches` e `match_opponent_players`.

## Quando nasce

`local_opponents` pode nascer quando:

1. o dirigente agenda um jogo contra um adversário que não quer ou não consegue cadastrar como `team` oficial;
2. o dirigente quer manter uma mini agenda de contatos de adversários;
3. um jogo de última hora exige criação rápida de adversário;
4. um time quer manter histórico privado de confrontos contra um adversário recorrente.

## Quem grava

`local_opponents` é gravada pela aplicação.

Casos de uso relevantes:

- `CreateLocalOpponent`
- `UpdateLocalOpponent`
- `UseLocalOpponentInScheduledMatch`
- `UseLocalOpponentInMatch`
- `ClaimLocalOpponentHistory` como ideia futura

## Estrutura física sugerida

- schema: `public`
- nome da tabela: `local_opponents`

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
  - indicar qual time é dono dessa memória privada.

### `name`

- tipo físico: `text`
- nulidade: `not null`
- finalidade:
  - nome do adversário como o time o conhece.

### `crest_media_asset_id`

- tipo físico: `uuid`
- nulidade: `nullable`
- FK: `media_assets.id`
- `on update`: `cascade`
- `on delete`: `set null`
- finalidade:
  - escudo ou imagem usada para identificação visual do adversário.

### `contact_name`

- tipo físico: `text`
- nulidade: `nullable`
- finalidade:
  - nome do responsável por marcar jogo com esse adversário.

### `contact_phone`

- tipo físico: `text`
- nulidade: `nullable`
- finalidade:
  - telefone ou WhatsApp do contato esportivo.

### `notes`

- tipo físico: `text`
- nulidade: `nullable`
- finalidade:
  - observações privadas do time sobre esse adversário.

### `claimed_team_id`

- tipo físico: `uuid`
- nulidade: `nullable`
- FK: `teams.id`
- `on update`: `cascade`
- `on delete`: `set null`
- finalidade:
  - guardar futura vinculação de reivindicação entre esse histórico privado e um `team` oficial do app, se esse mecanismo evoluir.

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

## Constraints sugeridas

## Primary key

- `pk_local_opponents`
  - colunas: `id`

## Foreign keys

- `fk_local_opponents_team`
  - coluna: `team_id`
  - referência: `teams.id`
  - `on update cascade`
  - `on delete restrict`

- `fk_local_opponents_crest_media_asset`
  - coluna: `crest_media_asset_id`
  - referência: `media_assets.id`
  - `on update cascade`
  - `on delete set null`

- `fk_local_opponents_claimed_team`
  - coluna: `claimed_team_id`
  - referência: `teams.id`
  - `on update cascade`
  - `on delete set null`

## Check constraints sugeridas

- `ck_local_opponents_name_not_blank`
  - `btrim(name) <> ''`

- `ck_local_opponents_contact_name_not_blank_when_present`
  - se `contact_name is not null`, então `btrim(contact_name) <> ''`

- `ck_local_opponents_contact_phone_not_blank_when_present`
  - se `contact_phone is not null`, então `btrim(contact_phone) <> ''`

- `ck_local_opponents_notes_not_blank_when_present`
  - se `notes is not null`, então `btrim(notes) <> ''`

## Unicidade

Para evitar duplicidade grosseira dentro do mesmo time, recomenda-se unicidade por:

- `team_id + lower(name)`

Nome sugerido:

- `uq_local_opponents_team_name`

## Índices sugeridos

- `idx_local_opponents_team_id`
  - colunas: `team_id`
  - finalidade:
    - listar agenda privada de adversários do time.

- `idx_local_opponents_claimed_team_id`
  - colunas: `claimed_team_id`
  - finalidade:
    - futura rastreabilidade de reivindicação.

- `idx_local_opponents_team_id_name`
  - colunas: (`team_id`, `name`)
  - finalidade:
    - autocomplete e busca rápida por adversário privado.

## Regras de negócio centrais

1. O registro pertence ao time que o criou.
2. O registro não cria automaticamente um `team` oficial.
3. O registro pode ser usado tanto no agendamento quanto na partida operacional.
4. O registro pode ter apenas o nome no fluxo mínimo.
5. Escudo, contato e observações enriquecem o uso, mas não são obrigatórios.
6. Jogadores privados desse adversário pertencem a `local_opponent_players`.
7. A futura reivindicação de histórico não muda o fato de que a memória original nasceu como privada.

## Regras de consistência contextual

### Coerência de posse

Todo uso de `local_opponents` deve respeitar:

- o time dono do registro;
- a impossibilidade de um time reutilizar silenciosamente a agenda privada de outro.

### Coerência com agenda e partida

Quando `local_opponents` for usado em `scheduled_matches` ou `matches`:

- o sistema deve gerar snapshots de nome e escudo no compromisso ou na partida;
- alterações futuras em `local_opponents` não devem reescrever o fato histórico passado.

Em outras palavras:

- `local_opponents` é memória reutilizável;
- `scheduled_matches` e `matches` guardam o fato contextual congelado.

## Relações com outras tabelas

## Relação com `teams`

- tipo: `N -> 1`
- chave: `local_opponents.team_id -> teams.id`
- regra:
  - cada agenda privada de adversário pertence a um time específico.

## Relação com `local_opponent_players`

- tipo: `1 -> N`
- chave: `local_opponent_players.local_opponent_id -> local_opponents.id`
- regra:
  - um adversário local pode ter vários jogadores privados cadastrados.

## Relação com `scheduled_matches`

- tipo: `1 -> N` por referência contextual
- regra:
  - compromissos podem apontar para `local_opponent_id` quando o adversário usado é privado.

## Relação com `matches`

- tipo: `1 -> N` por referência contextual
- regra:
  - partidas podem apontar para `local_opponent_id` quando o confronto operacional usa adversário privado.

## Relação com `match_opponent_players`

- tipo: indireta
- regra:
  - a operação da partida pode usar `local_opponents` como base de preparação do lado adversário.

## Regras operacionais por fluxo

### Agendamento rápido

Fluxo:

- dirigente busca um adversário;
- se não encontrar, cria um `local_opponent` com nome e, se quiser, escudo e contato;
- esse registro já pode ser usado no compromisso agendado.

### Evolução da agenda privada

Fluxo:

- com o tempo, o time adiciona escudo, contato, observações e jogadores;
- isso melhora os próximos agendamentos e operações.

### Jogo de última hora

Fluxo:

- o time cria a partida sem agendamento prévio;
- se o adversário não existir como oficial, pode nascer um `local_opponent`;
- a agenda derivada ou a própria partida reaproveita esse registro.

## O que não deve ficar em `local_opponents`

Não devem ficar aqui:

- atletas adversários individualizados;
- evento da partida;
- gol;
- substituição;
- estatística consolidada de confronto como fonte canônica.

Esses dados pertencem, respectivamente, a:

- `local_opponent_players`
- `match_events`
- `match_goals`
- `match_substitutions`
- camadas derivadas futuras

## Dependências diretas desta tabela

Esta tabela conversa diretamente com:

- `teams`
- `local_opponent_players`
- `scheduled_matches`
- `matches`
- `match_opponent_players`
- `ScheduledMatchesAPI`
- `MatchesAPI`

## Riscos de alteração futura

Mudanças em:

- regra de unicidade do nome;
- política de reivindicação;
- estrutura de contato;
- obrigatoriedade de escudo;
- integração com time oficial do app

impactam em cascata:

- agendamento rápido;
- mini agenda de adversários;
- confrontos recorrentes;
- reaproveitamento de jogadores adversários;
- futura leitura de histórico reivindicado.

## Resumo estrutural

`local_opponents` é a agenda privada de adversários do time. Ele conecta agendamento, memória esportiva, contato recorrente e preparação de confrontos, mas sem transformar automaticamente esse adversário em um `team` oficial compartilhado pelo produto inteiro.
