---
title: Table Spec match_players
status: Draft
version: 2.6.0
owner: Product Architecture
last_update: 2026-07-10
related_documents:
  - Table_Spec_matches.md
  - Table_Spec_team_players.md
  - Table_Spec_players.md
  - Table_Spec_match_players_positions.md
  - Table_Spec_match_substitutions.md
  - ../../Domain/Matches.md
  - ../../Domain/Players.md
  - ../../API/Matches_API.md
---

# Table Spec match_players

## Objetivo

Documentar `atletas relacionados na partida (match_players)` em nível técnico.

## Finalidade

`match_players` representa quais atletas foram relacionados para um time em uma partida operacional específica e em um quadro específico.

Ela existe para sustentar:

- escalação real da partida;
- distinção entre titular e reserva;
- distinção entre atleta fixo do time e atleta avulso;
- camisa usada naquele quadro;
- base factual para posições, eventos, substituições e estatísticas.

## O que `match_players` é

- linha factual de relacionamento do atleta com a partida;
- entidade de escalação real;
- contexto por quadro, time e atleta.

## O que `match_players` não é

- não é vínculo oficial com o time;
- não é confirmação de presença;
- não é substituição;
- não é posição efetivamente jogada;
- não é estatística consolidada.

## Responsabilidade na cadeia do domínio

No fluxo correto:

1. a partida operacional nasce em `matches`;
2. a gestão salva a escalação do quadro;
3. para cada atleta relacionado, nasce uma linha em `match_players`;
4. depois posições, eventos, gols e substituições passam a apontar para essas linhas.

Logo:

- vínculo esportivo oficial com o time pertence a `team_players`;
- presença declarada pertence a `match_attendance_responses`;
- escalação real pertence a `match_players`;
- posições reais pertencem a `match_players_positions`;
- trocas pertencem a `match_substitutions`.

## Quando nasce

`match_players` nasce quando a escalação do quadro é salva.

Ela também pode ser criada quando:

1. um atleta avulso é adicionado no momento da escalação;
2. uma revisão posterior incluir atleta que realmente participou e não havia sido registrado corretamente.

## Quem grava

`match_players` é gravada pela aplicação.

Casos de uso relevantes:

- `SaveLineupForFrame`
- `AddGuestPlayerToLineup`
- `ReconcileLineupAfterMatch`
- `MergeOperationalPlayerIntoCanonicalPlayer`

## Estrutura física sugerida

- schema: `public`
- nome da tabela: `match_players`

## Colunas

### `id`

- tipo físico: `uuid`
- nulidade: `not null`
- default sugerido: `gen_random_uuid()`
- PK: sim

### `match_id`

- tipo físico: `uuid`
- nulidade: `not null`
- FK: `matches.id`
- `on update`: `cascade`
- `on delete`: `restrict`
- finalidade:
  - apontar a qual partida operacional a linha pertence.

### `team_id`

- tipo físico: `uuid`
- nulidade: `not null`
- FK: `teams.id`
- `on update`: `cascade`
- `on delete`: `restrict`
- finalidade:
  - registrar por qual lado da partida aquele atleta foi relacionado.

### `player_id`

- tipo físico: `uuid`
- nulidade: `not null`
- FK: `players.id`
- `on update`: `cascade`
- `on delete`: `restrict`
- finalidade:
  - apontar qual identidade esportiva participou daquele quadro.

### `shirt_number`

- tipo físico: `integer`
- nulidade: `not null`
- finalidade:
  - número de camisa usado naquele quadro específico.

### `is_starter`

- tipo físico: `boolean`
- nulidade: `not null`
- default sugerido: `false`
- finalidade:
  - indicar se o atleta começou o quadro como titular.

### `is_team_player`

- tipo físico: `boolean`
- nulidade: `not null`
- default sugerido: `true`
- finalidade:
  - indicar se o atleta era oficialmente do elenco do time ou se atuou como avulso naquele jogo.

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

## Regras dos campos centrais

### `is_team_player`

- `true`
  - atleta fixo/oficial do time no contexto daquele jogo.

- `false`
  - atleta avulso daquela partida.

### `removed_at`

- tipo físico: `timestamptz`
- nulidade: `nullable`
- finalidade:
  - marcar remoção lógica do relacionado quando já existir dependência factual na partida.

### `removed_by_user_id`

- tipo físico: `uuid`
- nulidade: `nullable`
- FK: `users.id`
- `on update`: `cascade`
- `on delete`: `set null`
- finalidade:
  - registrar quem executou a remoção lógica.

### `removal_reason`

- tipo físico: `text`
- nulidade: `nullable`
- finalidade:
  - registrar o motivo operacional da remoção lógica.

### `is_starter`

- `true`
  - titular.

- `false`
  - reserva.

## Constraints sugeridas

## Primary key

- `pk_match_players`
  - colunas: `id`

## Foreign keys

- `fk_match_players_match`
  - coluna: `match_id`
  - referência: `matches.id`
  - `on update cascade`
  - `on delete restrict`

- `fk_match_players_team`
  - coluna: `team_id`
  - referência: `teams.id`
  - `on update cascade`
  - `on delete restrict`

- `fk_match_players_player`
  - coluna: `player_id`
  - referência: `players.id`
  - `on update cascade`
  - `on delete restrict`

- `fk_match_players_removed_by_user`
  - coluna: `removed_by_user_id`
  - referência: `users.id`
  - `on update cascade`
  - `on delete set null`

## Check constraints sugeridas

- `ck_match_players_shirt_number_positive`
  - `shirt_number > 0`

- `ck_match_players_removal_reason_not_blank_when_present`
  - se `removal_reason is not null`, então `btrim(removal_reason) <> ''`

## Unicidade e integridade

### Unicidade principal

Deve existir no máximo um registro por:

- `match_id + team_id + player_id`

Nome sugerido:

- `uq_match_players_match_team_player_active`
- condição: `removed_at is null`

### Regra de camisa

`shirt_number` não deve duplicar dentro do mesmo:

- `match_id + team_id`

salvo regra futura explícita.

Nome sugerido:

- `uq_match_players_match_team_shirt_number_active`
- condição: `shirt_number is not null and removed_at is null`

## Índices sugeridos

- `idx_match_players_match_id`
  - colunas: `match_id`
  - finalidade:
    - listar relacionados da partida.

- `idx_match_players_team_id`
  - colunas: `team_id`
  - finalidade:
    - relatórios por time no contexto da partida.

- `idx_match_players_player_id`
  - colunas: `player_id`
  - finalidade:
    - histórico de participações do atleta.

- `idx_match_players_match_id_team_id`
  - colunas: (`match_id`, `team_id`)
  - finalidade:
    - carregar escalação por lado.

- `idx_match_players_match_id_is_starter`
  - colunas: (`match_id`, `is_starter`)
  - finalidade:
    - separar titulares e reservas rapidamente.

## Regras de negócio centrais

1. Cada linha representa um atleta relacionado para uma `match` específica por um time específico.
2. Se não existir linha em `match_players`, o atleta não foi relacionado para aquela `match`.
3. Se o mesmo atleta jogar o segundo quadro e também o primeiro quadro, devem existir duas linhas distintas em `match_players`, uma em cada `match`.
4. A modalidade da atuação não fica nesta tabela; ela vem de `matches.modality`.
5. As posições daquela partida ficam em `match_players_positions`.
6. `match_players` é a base factual usada por eventos, gols e substituições.
7. As linhas com `is_starter = true` representam a escalação inicial oficial do quadro.
8. O backend deve validar que a quantidade de titulares é exatamente igual a `matches.starters_count`.
9. O salvamento da escalação só é válido quando:
  - relacionados `>= matches.starters_count`;
  - titulares `= matches.starters_count`.
10. Não existe limite máximo de relacionados por quadro.
11. Todo relacionado com `is_starter = false` é automaticamente reserva.
12. O banco pode ficar vazio quando o time só tiver o mínimo necessário para jogar.
13. Nenhum atleta pode ser relacionado sem número de camisa.
14. O `shirt_number` salvo representa o número confirmado para aquele quadro, mesmo quando existir número sugerido no cadastro do atleta.
15. A definição oficial dos `titulares iniciais` congela quando a partida começa.
16. O conjunto de `relacionados` continua podendo ser ajustado durante a partida e na revisão posterior.
17. Se o relacionado ainda não possuir fatos dependentes na partida, `REMOVE` pode apagar fisicamente a linha.
18. Se já existirem fatos dependentes, `REMOVE` deve virar remoção lógica via `removed_at`.

### O que conta como fato dependente para bloquear exclusão física

Bloqueiam exclusão física de `match_players` e exigem remoção lógica:

- `eventos da partida (match_events)` quando o `match_player_id` aparecer em:
  - `primary_match_player_id`
  - `secondary_match_player_id`
  - `marking_failure_match_player_id`
- `gols da partida (match_goals)` quando o `match_player_id` aparecer em:
  - `match_player_id`
- `substituições da partida (match_substitutions)` quando o `match_player_id` aparecer em:
  - `player_in_match_player_id`
  - `player_out_match_player_id`
- `avaliações da partida (match_ratings)` quando o `match_player_id` aparecer em:
  - `target_match_player_id`

Não bloqueia exclusão física por si só:

- `posições usadas pelo atleta na partida (match_players_positions)`

Regra operacional:

- se existirem apenas linhas em `match_players_positions`, o backend pode apagar fisicamente `match_players` e limpar as posições associadas na mesma operação;
- se existir qualquer referência nas tabelas factuais ou avaliativas acima, o backend não pode apagar fisicamente a linha e deve usar `removed_at`, `removed_by_user_id` e `removal_reason`.

## Regras de consistência contextual

### Coerência com `matches`

O backend deve validar que:

- `match_players.team_id = matches.team_id`

no caso do lado do time dono da operação.

Se no futuro existir registro dos dois lados em uma mesma operação, essa regra pode evoluir, mas no modelo atual o foco continua sendo o time dono da operação.

### Coerência com vínculo oficial

Se `is_team_player = true`:

- o backend deve conseguir validar vínculo oficial coerente em `team_players`.

Se `is_team_player = false`:

- não deve exigir `team_players`;
- o atleta continua podendo existir globalmente em `players`.

## Relações com outras tabelas

## Relação com `matches`

- tipo: `N -> 1`
- chave: `match_players.match_id -> matches.id`
- regra:
  - cada linha existe dentro de uma partida operacional específica.

## Relação com `players`

- tipo: `N -> 1`
- chave: `match_players.player_id -> players.id`
- regra:
  - tanto atleta fixo quanto avulso usam `players`.

## Relação com `team_players`

- não há FK direta nesta tabela;
- mas `is_team_player = true` pressupõe validação contra vínculo esportivo oficial do time.

## Relação com `match_players_positions`

- tipo: `1 -> N`
- regra:
  - as posições efetivamente atribuídas no jogo partem desta linha.

## Relação com `match_substitutions`

- tipo: `1 -> N`
- regra:
  - entradas e saídas durante a partida devem apontar para linhas de `match_players`.

## Relação com `match_events` e `match_goals`

- eventos e gols devem preferir `match_player_id` sempre que o ator do lado do time estiver identificado.

## Regras operacionais por fluxo

### Escalação de atletas fixos

Fluxo:

- carregar atletas elegíveis do elenco;
- escolher relacionados;
- marcar titulares;
- todo não titular vira reserva automaticamente;
- persistir linhas em `match_players`.

### Inclusão de avulso

Fluxo:

- criar ou reaproveitar `person + player`;
- relacionar em `match_players` com `is_team_player = false`;
- não criar `team_player` automaticamente.

Campos mínimos para cadastro rápido operacional:

- `nickname` ou `full_name`
- `shirt_number`

Campos opcionais:

- `avatar`
- posição inicial
- `preferred_foot`

Regras:

- o avulso criado na própria escalação pode ser titular ou reserva;
- o mesmo contrato deve permitir inclusão posterior no meio da partida.

### Mudança de camisa no jogo

Fluxo:

- `shirt_number` pode refletir a camisa daquele jogo;
- isso não altera nenhum dado fixo do atleta fora da partida.

### Ajuste de relacionados após o início

Fluxo:

- a partida começou;
- a saída oficial de titulares não deve ser reescrita;
- mas a lista de relacionados ainda pode receber:
  - jogador atrasado;
  - avulso;
  - correção de camisa;
- depois da partida, a revisão por vídeo também pode ajustar esse conjunto.

### Remoção física versus lógica

Fluxo:

- sem fatos dependentes:
  - a linha pode ser removida fisicamente;
- com fatos dependentes:
  - a linha não deve ser apagada;
  - a aplicação deve preencher:
    - `removed_at`
    - `removed_by_user_id`
    - `removal_reason`, quando aplicável

Regra:

- listas operacionais padrão devem considerar apenas relacionados com `removed_at is null`;
- relatórios históricos e dependências factuais continuam podendo apontar para linhas removidas logicamente.

### Confirmação operacional da camisa

Fluxo:

- se o atleta já tiver número sugerido no cadastro:
  - a UI apresenta esse valor para confirmação;
- se não tiver:
  - a UI exige digitação imediata;
- em ambos os casos, o valor salvo em `match_players.shirt_number` é o número confirmado para aquele quadro.

## O que não deve ficar em `match_players`

Não devem ficar aqui:

- vínculo oficial com o time;
- presença declarada no compromisso;
- posição efetivamente jogada;
- substituições;
- eventos;
- estatísticas agregadas.

Esses dados pertencem, respectivamente, a:

- `team_players`
- `match_attendance_responses`
- `match_players_positions`
- `match_substitutions`
- `match_events`
- tabelas derivadas como `player_match_statistics`

## Dependências diretas desta tabela

Esta tabela conversa diretamente com:

- `matches`
- `teams`
- `players`
- `team_players`
- `match_players_positions`
- `match_substitutions`
- `match_events`
- `match_goals`
- `Statistics_API`

## Riscos de alteração futura

Mudanças em:

- semântica de `is_team_player`;
- unicidade por quadro;
- regra de camisa por quadro;
- dependência factual de `match_player_id`

impactam em cascata:

- escalação;
- substituições;
- registro de eventos;
- gols;
- estatísticas do atleta;
- consolidação de histórico em merges.

## Resumo estrutural

`match_players` é a escalação factual do jogo. É aqui que o atleta deixa de ser apenas “do elenco” ou “presente” e passa a estar oficialmente relacionado para uma `match` real da partida.
