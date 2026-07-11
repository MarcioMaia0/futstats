---
title: Table Spec local_opponent_players
status: Draft
version: 2.0.0
owner: Product Architecture
last_update: 2026-07-10
related_documents:
  - Table_Spec_local_opponents.md
  - Table_Spec_match_opponent_players.md
  - Table_Spec_match_events.md
  - Table_Spec_match_substitutions.md
  - ../../Domain/Matches.md
  - ../../API/Matches_API.md
---

# Table Spec local_opponent_players

## Objetivo

Documentar `jogadores adversários locais (local_opponent_players)` em nível técnico.

## Finalidade

`local_opponent_players` representa a memória privada e reutilizável que um time mantém sobre atletas de adversários conhecidos.

Ela existe para sustentar:

- reaproveitamento de jogadores adversários em confrontos futuros;
- cadastro rápido por camisa, nome ou foto;
- anotações privadas da diretoria ou comissão;
- enriquecimento da leitura de confrontos recorrentes;
- geração de snapshots operacionais em `match_opponent_players`.

## O que `local_opponent_players` é

- memória privada de um time sobre atletas de um adversário;
- camada reutilizável anterior à partida;
- base de sugestão para operação futura de jogo.

## O que `local_opponent_players` não é

- não é `person`;
- não é `player` global do produto;
- não é atleta oficial de um time cadastrado no app;
- não é linha operacional da partida;
- não é estatística consolidada do adversário.

## Responsabilidade na cadeia do domínio

No fluxo correto:

1. um time conhece um adversário recorrente;
2. esse time pode guardar memória privada em `local_opponents`;
3. dentro dessa memória, pode registrar jogadores em `local_opponent_players`;
4. quando houver uma nova partida, o sistema pode sugerir esses jogadores;
5. a operação real do jogo usa `match_opponent_players`, não esta tabela diretamente.

Logo:

- memória privada anterior pertence a `local_opponent_players`;
- memória operacional do confronto pertence a `match_opponent_players`;
- identidade global do produto não nasce aqui.

## Quando nasce

`local_opponent_players` pode nascer quando:

1. um diretor prepara previamente um adversário recorrente;
2. após uma partida, o time decide guardar memória sobre quem jogou do outro lado;
3. o time quer registrar observações privadas sobre um atleta adversário;
4. o cadastro rápido do adversário é promovido para memória reutilizável.

## Quem grava

`local_opponent_players` é gravada pela aplicação.

Casos de uso relevantes:

- `CreateLocalOpponentPlayer`
- `UpdateLocalOpponentPlayer`
- `PromoteMatchOpponentPlayerToLocalMemory`
- `SuggestLocalOpponentPlayersForMatch`

## Estrutura física sugerida

- schema: `public`
- nome da tabela: `local_opponent_players`

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

### `local_opponent_id`

- tipo físico: `uuid`
- nulidade: `not null`
- FK: `local_opponents.id`
- `on update`: `cascade`
- `on delete`: `restrict`
- finalidade:
  - indicar a qual adversário privado essa memória pertence.

### `shirt_number`

- tipo físico: `integer`
- nulidade: `not null`
- finalidade:
  - identificador mínimo mais prático do jogador adversário.

### `display_name`

- tipo físico: `text`
- nulidade: `nullable`
- finalidade:
  - nome, apelido ou referência textual conhecida para aquele atleta.

### `photo_media_asset_id`

- tipo físico: `uuid`
- nulidade: `nullable`
- FK: `media_assets.id`
- `on update`: `cascade`
- `on delete`: `set null`
- finalidade:
  - foto opcional usada para facilitar reconhecimento futuro.

### `notes`

- tipo físico: `text`
- nulidade: `nullable`
- finalidade:
  - observações privadas como estilo de jogo, pontos fortes ou alertas.

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

- `pk_local_opponent_players`
  - colunas: `id`

## Foreign keys

- `fk_local_opponent_players_team`
  - coluna: `team_id`
  - referência: `teams.id`
  - `on update cascade`
  - `on delete restrict`

- `fk_local_opponent_players_local_opponent`
  - coluna: `local_opponent_id`
  - referência: `local_opponents.id`
  - `on update cascade`
  - `on delete restrict`

- `fk_local_opponent_players_photo_media_asset`
  - coluna: `photo_media_asset_id`
  - referência: `media_assets.id`
  - `on update cascade`
  - `on delete set null`

## Check constraints sugeridas

- `ck_local_opponent_players_shirt_number_positive`
  - `shirt_number > 0`

- `ck_local_opponent_players_display_name_not_blank_when_present`
  - se `display_name is not null`, então `btrim(display_name) <> ''`

- `ck_local_opponent_players_notes_not_blank_when_present`
  - se `notes is not null`, então `btrim(notes) <> ''`

## Unicidade

Deve existir no máximo um registro por:

- `team_id + local_opponent_id + shirt_number`

Nome sugerido:

- `uq_local_opponent_players_team_local_opponent_shirt_number`

## Índices sugeridos

- `idx_local_opponent_players_team_id`
  - colunas: `team_id`
  - finalidade:
    - listar a memória privada de jogadores adversários do time.

- `idx_local_opponent_players_local_opponent_id`
  - colunas: `local_opponent_id`
  - finalidade:
    - carregar rapidamente o elenco conhecido de um adversário local.

- `idx_local_opponent_players_display_name`
  - colunas: `display_name`
  - finalidade:
    - facilitar busca textual quando o operador lembra o nome ou apelido.

## Regras de negócio centrais

1. O registro pertence ao time que criou a memória.
2. O registro pertence a um `local_opponent` específico.
3. O mínimo obrigatório é a camisa.
4. `display_name`, foto e observações são opcionais.
5. O registro não cria `person` nem `player` global.
6. O registro pode ser reutilizado em novas partidas contra o mesmo adversário.
7. O registro serve para sugestão e memória privada, não para operação canônica do jogo.

## Regras de consistência contextual

### Coerência de posse

O backend deve validar que:

- `local_opponent_players.team_id = local_opponents.team_id`

Em outras palavras:

- um time não pode gravar jogador privado dentro do adversário local de outro time.

### Coerência com a operação da partida

Quando um `local_opponent_player` for reaproveitado em jogo:

- ele não deve ser usado diretamente em `match_events`;
- ele deve gerar ou alimentar um snapshot em `match_opponent_players`.

Isso preserva a separação entre:

- memória privada histórica;
- fato operacional daquela partida específica.

## Relações com outras tabelas

## Relação com `local_opponents`

- tipo: `N -> 1`
- chave: `local_opponent_players.local_opponent_id -> local_opponents.id`
- regra:
  - cada jogador adversário local pertence a um adversário privado específico.

## Relação com `teams`

- tipo: `N -> 1`
- chave: `local_opponent_players.team_id -> teams.id`
- regra:
  - a memória é sempre privada do time que a cadastrou.

## Relação com `match_opponent_players`

- tipo: `1 -> N` sem FK reversa obrigatória aqui
- regra:
  - um `local_opponent_player` pode ser reaproveitado em vários snapshots operacionais de partidas diferentes por meio de `match_opponent_players.local_opponent_player_id`.

## Regras operacionais por fluxo

### Cadastro rápido de memória privada

Fluxo:

- diretor informa camisa;
- opcionalmente informa nome, foto e observação;
- o atleta adversário já vira memória privada reutilizável.

### Reaproveitamento antes da partida

Fluxo:

- o time vai enfrentar novamente um adversário conhecido;
- o sistema sugere os jogadores já cadastrados;
- o operador escolhe quais entram como base para a operação do confronto.

### Promoção a partir da partida

Fluxo:

- um jogador adversário foi usado em `match_opponent_players`;
- depois do jogo, o time decide guardá-lo para o futuro;
- o sistema cria ou atualiza um `local_opponent_player`.

## O que não deve ficar em `local_opponent_players`

Não devem ficar aqui:

- identidade global do atleta;
- estatísticas oficiais do adversário;
- evento da partida;
- substituição da partida;
- autoria factual de gol em jogo específico.

Esses dados pertencem, respectivamente, a:

- não existe no domínio canônico atual para esse lado do produto
- camadas derivadas futuras
- `match_events`
- `match_substitutions`
- `match_goals` e `match_events`

## Dependências diretas desta tabela

Esta tabela conversa diretamente com:

- `local_opponents`
- `match_opponent_players`
- `match_events`
- `match_substitutions`
- `Matches_API`

## Riscos de alteração futura

Mudanças em:

- obrigatoriedade além da camisa;
- política de promoção entre partida e memória local;
- formato das observações privadas;
- eventual reivindicação futura de histórico pelo adversário oficial

impactam em cascata:

- cadastro rápido do adversário;
- reutilização em novos confrontos;
- memória privada da comissão;
- consistência entre preparo pré-jogo e operação da partida.

## Resumo estrutural

`local_opponent_players` é a memória privada do time sobre atletas de adversários recorrentes. Ela existe para acelerar confrontos futuros e enriquecer a resenha e a leitura do adversário, mas sem confundir esse conhecimento privado com identidade global ou com o fato operacional da partida.
