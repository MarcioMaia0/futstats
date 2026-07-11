---
title: Table Spec team_players
status: Draft
version: 3.0.0
owner: Product Architecture
last_update: 2026-07-10
related_documents:
  - Table_Spec_players.md
  - Table_Spec_team_members.md
  - Table_Spec_match_players.md
  - Table_Spec_team_player_frame_defaults.md
  - Table_Spec_user_team_roles.md
  - ../../Domain/Teams.md
  - ../../Domain/Players.md
  - ../../API/Players_API.md
  - ../../API/Teams_API.md
---

# Table Spec team_players

## Objetivo

Documentar `vínculo esportivo oficial com o time (team_players)` em nível técnico.

## Finalidade

`team_players` representa que um `integrante do time (team_member)` com identidade esportiva válida faz ou fez parte do elenco oficial de um time.

Esta é a camada esportiva oficial do pertencimento ao time.

Ela existe para sustentar:

- elenco oficial do time;
- leitura de atletas ativos do time;
- timeline do atleta no contexto de times;
- validação de atleta fixo versus avulso;
- defaults logísticos por quadro;
- estatísticas por time.

## O que `team_players` é

- vínculo esportivo oficial entre atleta e time;
- camada de elenco;
- ponte entre `team_members` e `players` dentro do contexto esportivo do time.

## O que `team_players` não é

- não é pertencimento-base ao time;
- não é papel de gestão;
- não é participação específica em partida;
- não é resposta de presença;
- não é cadastro de avulso.

## Responsabilidade na cadeia do domínio

A leitura correta de uma pessoa dentro do time continua sendo composta:

- `team_members`
- `team_players`
- `user_team_roles`

Nesse arranjo:

- `team_members` diz que a pessoa faz parte do time;
- `team_players` diz que ela faz parte do elenco esportivo oficial;
- `user_team_roles` diz se ela também exerce função interna/gestão.

## Quando nasce

`team_players` pode nascer em contextos válidos como:

1. aprovação de solicitação de entrada com modo que inclua jogador;
2. criação operacional de atleta de elenco pelo time;
3. consolidação de atleta operacional em claim/merge;
4. reativação de vínculo esportivo histórico.

## Quem grava

`team_players` é gravada pela aplicação.

Casos de uso relevantes:

- `ApproveJoinRequest`
- `CreateOperationalPlayer`
- `ReactivateTeamPlayer`
- `MergeOperationalPlayerIntoCanonicalPlayer`
- futuros fluxos de gestão de elenco

## Estrutura física sugerida

- schema: `public`
- nome da tabela: `team_players`

## Colunas

### `id`

- tipo físico: `uuid`
- nulidade: `not null`
- default sugerido: `gen_random_uuid()`
- PK: sim
- finalidade:
  - identificador canônico do vínculo esportivo oficial no time.

### `team_member_id`

- tipo físico: `uuid`
- nulidade: `not null`
- FK: `team_members.id`
- `on update`: `cascade`
- `on delete`: `restrict`
- finalidade:
  - apontar qual integrante do time possui esse vínculo esportivo oficial.

### `player_id`

- tipo físico: `uuid`
- nulidade: `not null`
- FK: `players.id`
- `on update`: `cascade`
- `on delete`: `restrict`
- finalidade:
  - apontar qual identidade esportiva compõe o elenco oficial naquele vínculo.

### `status`

- tipo físico: `team_player_status`
- nulidade: `not null`
- default sugerido: `ACTIVE`
- finalidade:
  - resumir o estado atual do vínculo esportivo oficial.

### `joined_at`

- tipo físico: `timestamptz`
- nulidade: `nullable`
- default: sem default
- finalidade:
  - registrar quando o atleta passou a fazer parte do elenco daquele time.

### `left_at`

- tipo físico: `timestamptz`
- nulidade: `nullable`
- default: sem default
- finalidade:
  - registrar quando o atleta deixou o elenco, quando aplicável.

### `created_at`

- tipo físico: `timestamptz`
- nulidade: `not null`
- default sugerido: `now()`
- finalidade:
  - trilha de criação do vínculo esportivo.

### `updated_at`

- tipo físico: `timestamptz`
- nulidade: `not null`
- default sugerido: `now()`
- manutenção sugerida:
  - trigger de atualização automática no update
- finalidade:
  - trilha da última alteração do vínculo esportivo.

## Enums físicos

### `team_player_status`

- `ACTIVE`
- `INACTIVE`
- `LEFT`
- `REMOVED`

## Regras dos enums

- `ACTIVE`
  - faz parte do elenco atual do time.

- `INACTIVE`
  - continua no histórico do elenco, mas não está ativo no momento.

- `LEFT`
  - saiu do elenco.

- `REMOVED`
  - foi removido administrativamente.

## Constraints sugeridas

## Primary key

- `pk_team_players`
  - colunas: `id`

## Foreign keys

- `fk_team_players_team_member`
  - coluna: `team_member_id`
  - referência: `team_members.id`
  - `on update cascade`
  - `on delete restrict`

- `fk_team_players_player`
  - coluna: `player_id`
  - referência: `players.id`
  - `on update cascade`
  - `on delete restrict`

## Check constraints sugeridas

- `ck_team_players_left_at_after_joined_at`
  - se `joined_at is not null` e `left_at is not null`, então `left_at >= joined_at`

## Unicidade

É permitido histórico esportivo da mesma pessoa no mesmo time.

Por isso:

- não deve existir `unique(team_member_id)` simples;
- não deve existir `unique(player_id, team_id)` simples nesta tabela, porque `team_id` não está nela e o histórico pode reabrir vínculos.

Regras corretas:

1. deve existir no máximo um vínculo esportivo ativo por `team_member_id`;
2. o backend deve impedir, no mesmo time, duplicidade operacional ativa para a mesma combinação lógica de pessoa-atleta.

Implementação sugerida:

- índice único parcial para linhas em que `status = 'ACTIVE'` sobre `team_member_id`

Nome sugerido:

- `uq_team_players_active_team_member`

## Índices sugeridos

- `idx_team_players_team_member_id`
  - colunas: `team_member_id`
  - finalidade:
    - navegar do integrante para o vínculo esportivo.

- `idx_team_players_player_id`
  - colunas: `player_id`
  - finalidade:
    - listar times ativos do atleta;
    - relatórios por atleta.

- `idx_team_players_status`
  - colunas: `status`
  - finalidade:
    - filtros de elenco ativo/inativo/removido.

- `idx_team_players_joined_at`
  - colunas: `joined_at`
  - finalidade:
    - timeline e histórico de entrada no elenco.

## Regras de integridade

### Coerência entre `team_member` e `player`

`player_id` deve ser coerente com a `person` do `team_member`.

Regra semântica obrigatória:

- `players.person_id` deve ser a mesma pessoa representada por `team_members.person_id`.

Ou seja:

- não pode existir `team_player` apontando para atleta de outra pessoa.

Essa validação pode exigir regra de aplicação ou mecanismo adicional de integridade, porque o banco sozinho não resolve essa coerência por FK simples.

### Dependência de `team_members`

Antes de existir `team_player`, deve existir `team_member`.

Logo:

- `team_players` nunca nasce sozinho.

### Avulso não entra aqui automaticamente

Atleta avulso:

- pode existir em `players`;
- pode aparecer em `match_players`;
- não deve virar `team_player` automaticamente.

## Relações com outras tabelas

## Relação com `team_members`

- tipo: `N -> 1`
- chave: `team_players.team_member_id -> team_members.id`
- regra:
  - o pertencimento base nasce antes do pertencimento esportivo.

## Relação com `players`

- tipo: `N -> 1`
- chave: `team_players.player_id -> players.id`
- regra:
  - o vínculo esportivo oficial depende de uma identidade esportiva válida.

## Relação com `match_players`

- não é FK direta obrigatória na tabela de vínculo;
- mas `match_players.is_team_player = true` deve ser validado contra existência de vínculo oficial coerente em `team_players`.

## Relação com `team_player_frame_defaults`

- essa tabela filha pode referenciar `player_id` no contexto do time para pré-configurações de quadro;
- ela não substitui `team_players`;
- ela pressupõe existência de vínculo esportivo oficial ou contexto compatível de elenco.

## Relação com `user_team_roles`

- não há dependência direta;
- uma pessoa pode ser jogador sem gestão;
- uma pessoa pode ser jogador e também `DIRECTOR` ou `PRESIDENT`.

## Regras operacionais por fluxo

### Entrada como jogador

Fluxo:

- criar ou reaproveitar `team_member`;
- criar ou reaproveitar `team_player`;
- se houver papel de gestão combinado, tratar isso separadamente em `user_team_roles`.

### Comissão sem jogador

Fluxo:

- cria `team_member`;
- não cria `team_player`.

### Avulso na partida

Fluxo:

- pode criar `person + player`;
- pode criar linha em `match_players` com `is_team_player = false`;
- não cria `team_player` automaticamente.

### Claim e merge

Se houver merge de atleta operacional para atleta canônico:

- pode ser necessário consolidar `team_players` em favor do `target_team_member_id`;
- deve evitar sobrevivência de vínculo ativo redundante;
- deve reapontar fatos brutos e depois reconstruir projeções derivadas.

## Regras de leitura

`active_teams` no perfil do atleta deve considerar apenas linhas ativas em `team_players`.

O histórico esportivo por time pode considerar:

- linhas ativas;
- linhas históricas;
- fatos de partida vinculados ao atleta.

## O que não deve ficar em `team_players`

Não devem ficar aqui:

- papel de gestão;
- resposta de presença;
- titularidade de uma partida específica;
- camisa do jogo;
- posição jogada na partida;
- estatísticas da partida.

Esses dados pertencem, respectivamente, a:

- `user_team_roles`
- `match_attendance_responses`
- `match_players`
- `match_players`
- `match_players_positions`
- tabelas de fatos e projeções

## Dependências diretas desta tabela

Esta tabela conversa diretamente com:

- `team_members`
- `players`
- `match_players`
- `team_player_frame_defaults`
- `Players_API`
- `Teams_API`
- perfil do atleta
- relatórios esportivos por time

## Riscos de alteração futura

Mudanças em:

- unicidade de vínculo ativo por `team_member_id`;
- separação entre oficial e avulso;
- coerência entre `team_member` e `player`;
- semântica de `status`

impactam em cascata:

- montagem de elenco;
- perfil do atleta;
- estatísticas por time;
- escalação;
- validação de `match_players.is_team_player`;
- fluxos de merge operacional para canônico.

## Resumo estrutural

`team_players` é a camada que transforma um integrante do time em atleta oficial do elenco. Ela não substitui o pertencimento base nem a participação em jogo, mas é a ponte esportiva oficial entre os dois.
