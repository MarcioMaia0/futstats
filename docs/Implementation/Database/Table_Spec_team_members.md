---
title: Table Spec team_members
status: Draft
version: 2.0.0
owner: Product Architecture
last_update: 2026-07-10
related_documents:
  - Table_Spec_persons.md
  - Table_Spec_users.md
  - Table_Spec_team_players.md
  - Table_Spec_user_team_roles.md
  - Table_Spec_match_attendance_responses.md
  - ../../Domain/Teams.md
  - ../../Domain/Players.md
  - ../../API/Teams_API.md
  - ../../API/Scheduled_Matches_API.md
---

# Table Spec team_members

## Objetivo

Documentar `integrantes do time (team_members)` em nível técnico.

## Finalidade

`team_members` representa o pertencimento-base entre um `time (teams)` e uma `pessoa (persons)`.

Esta é a camada canônica de vínculo interno com o time.

Ela existe para sustentar:

- pertencimento ao time;
- leitura de integrantes;
- presença em compromissos;
- papéis internos e de gestão em camadas complementares;
- vínculo esportivo oficial em camada complementar;
- histórico de entrada e saída do time;
- consolidação contextual em claims e merges.

## O que `team_members` é

- vínculo-base de pertencimento ao time;
- pivô contextual entre `teams` e `persons`;
- entidade canônica de “quem faz parte do time”.

## O que `team_members` não é

- não é conta;
- não é papel de gestão;
- não é vínculo esportivo oficial;
- não é resposta de presença;
- não é participação em partida.

## Responsabilidade na cadeia do domínio

A leitura correta de quem a pessoa é dentro do time deve vir da combinação de camadas:

- `team_members`
- `team_players`
- `user_team_roles`

Logo:

- `team_members` diz que a pessoa faz parte do time;
- `team_players` diz se ela faz parte do elenco esportivo;
- `user_team_roles` diz se ela tem papel interno/gestão.

## Quando nasce

`team_members` pode nascer em vários contextos válidos:

1. criação do time pelo fundador;
2. aprovação de solicitação de entrada em time;
3. criação operacional de integrante pelo time;
4. criação operacional de atleta sem conta para compor elenco;
5. criação de integrante interno como comissão, técnico ou outro staff relacionado ao time.

## Quem grava

`team_members` é gravada pela aplicação.

Casos de uso relevantes:

- `CreateTeam`
- `ApproveJoinRequest`
- `CreateOperationalPlayer`
- `AddInternalMember`
- `MergeOperationalPlayerIntoCanonicalPlayer`

## Estrutura física sugerida

- schema: `public`
- nome da tabela: `team_members`

## Colunas

### `id`

- tipo físico: `uuid`
- nulidade: `not null`
- default sugerido: `gen_random_uuid()`
- PK: sim
- finalidade:
  - identificador canônico do pertencimento daquela pessoa naquele time.

### `team_id`

- tipo físico: `uuid`
- nulidade: `not null`
- FK: `teams.id`
- `on update`: `cascade`
- `on delete`: `restrict`
- finalidade:
  - apontar a qual time o vínculo pertence.

### `person_id`

- tipo físico: `uuid`
- nulidade: `not null`
- FK: `persons.id`
- `on update`: `cascade`
- `on delete`: `restrict`
- finalidade:
  - apontar qual pessoa pertence ao time nesse vínculo contextual.

### `membership_status`

- tipo físico: `team_membership_status`
- nulidade: `not null`
- default sugerido: `ACTIVE`
- finalidade:
  - resumir o estado atual do pertencimento.

### `joined_at`

- tipo físico: `timestamptz`
- nulidade: `nullable`
- default: sem default
- finalidade:
  - registrar quando a pessoa passou a fazer parte do time.

### `left_at`

- tipo físico: `timestamptz`
- nulidade: `nullable`
- default: sem default
- finalidade:
  - registrar quando a pessoa deixou de fazer parte do time, quando aplicável.

### `created_by_user_id`

- tipo físico: `uuid`
- nulidade: `nullable`
- FK: `users.id`
- `on update`: `cascade`
- `on delete`: `set null`
- finalidade:
  - registrar qual usuário criou esse vínculo, quando a criação vier de uma ação autenticada.

### `notes`

- tipo físico: `text`
- nulidade: `nullable`
- default: sem default
- finalidade:
  - observação administrativa opcional sobre o integrante.

### `created_at`

- tipo físico: `timestamptz`
- nulidade: `not null`
- default sugerido: `now()`
- finalidade:
  - trilha de criação do vínculo.

### `updated_at`

- tipo físico: `timestamptz`
- nulidade: `not null`
- default sugerido: `now()`
- manutenção sugerida:
  - trigger de atualização automática no update
- finalidade:
  - trilha da última alteração do vínculo.

## Enums físicos

### `team_membership_status`

- `ACTIVE`
- `INACTIVE`
- `REMOVED`

## Regras dos enums

- `ACTIVE`
  - a pessoa faz parte do time no estado atual.

- `INACTIVE`
  - a pessoa permanece no histórico de pertencimento, mas não está ativa no momento.

- `REMOVED`
  - a pessoa foi removida administrativamente do time.

## Constraints sugeridas

## Primary key

- `pk_team_members`
  - colunas: `id`

## Foreign keys

- `fk_team_members_team`
  - coluna: `team_id`
  - referência: `teams.id`
  - `on update cascade`
  - `on delete restrict`

- `fk_team_members_person`
  - coluna: `person_id`
  - referência: `persons.id`
  - `on update cascade`
  - `on delete restrict`

- `fk_team_members_created_by_user`
  - coluna: `created_by_user_id`
  - referência: `users.id`
  - `on update cascade`
  - `on delete set null`

## Check constraints sugeridas

- `ck_team_members_notes_not_blank_when_present`
  - se `notes is not null`, então `btrim(notes) <> ''`

- `ck_team_members_left_at_after_joined_at`
  - se `joined_at is not null` e `left_at is not null`, então `left_at >= joined_at`

## Unicidade

É permitido histórico para a mesma pessoa no mesmo time.

Por isso:

- não deve existir `unique (team_id, person_id)` simples.

A regra correta é:

- deve existir no máximo um vínculo ativo por `team_id + person_id`.

Implementação sugerida:

- índice único parcial para linhas em que `membership_status = 'ACTIVE'`

Nome sugerido:

- `uq_team_members_active_team_person`

## Índices sugeridos

- `idx_team_members_team_id`
  - colunas: `team_id`
  - finalidade:
    - listar integrantes do time;
    - resolver contexto interno do time.

- `idx_team_members_person_id`
  - colunas: `person_id`
  - finalidade:
    - localizar em quais times a pessoa já pertenceu ou pertence.

- `idx_team_members_membership_status`
  - colunas: `membership_status`
  - finalidade:
    - filtros de ativos/inativos/removidos.

- `idx_team_members_created_by_user_id`
  - colunas: `created_by_user_id`
  - finalidade:
    - auditoria leve e rastreabilidade administrativa.

## Regras de negócio centrais

1. `team_members` é a camada canônica de pertencimento ao time.
2. Nem todo `team_member` é jogador.
3. Nem todo `team_member` é gestão.
4. Todo integrante que participe de fluxos internos do time deve existir aqui.
5. Torcedor que apenas segue um time não é `team_member`.
6. A classificação funcional do integrante não deve ser resumida por um campo único nesta tabela.

## Exemplos válidos de integrante

- jogador;
- comissão;
- diretor;
- presidente;
- técnico;
- outro integrante interno suportado no futuro.

## Relações com outras tabelas

## Relação com `persons`

- tipo: `N -> 1`
- chave: `team_members.person_id -> persons.id`
- regra:
  - a mesma pessoa pode ser integrante de múltiplos times;
  - a mesma pessoa pode ter histórico no mesmo time em mais de uma linha, desde que não duplique vínculo ativo.

## Relação com `users`

- não há FK direta de “dono” do vínculo para autenticação da pessoa;
- a pessoa pode ser integrante do time sem ter conta;
- `created_by_user_id` é apenas auditoria de criação.

## Relação com `team_players`

- tipo: `1 -> 0..N` historicamente, com no máximo um vínculo esportivo ativo por integrante conforme regra da tabela filha
- chave dependente: `team_players.team_member_id`
- regra:
  - se a pessoa for jogador, primeiro deve existir `team_member`;
  - depois pode existir `team_player`.

## Relação com `user_team_roles`

- tipo: `1 -> 0..N`
- regra:
  - se a pessoa tiver papel interno/gestão e possuir `user`, isso é persistido em `user_team_roles`;
  - `user_team_roles` não substitui `team_members`.

## Relação com `match_attendance_responses`

- tipo: `1 -> N`
- chave dependente: `match_attendance_responses.team_member_id`
- regra:
  - a presença em compromissos agendados pertence ao integrante do time, não ao `player`.

## Relação com `team_join_requests`

- não é FK direta obrigatória nesta tabela;
- mas a aprovação de `team_join_requests` normalmente cria ou reaproveita `team_members`.

## Regras operacionais por fluxo

### Entrada no time como jogador

Fluxo:

- criar ou reaproveitar `team_member`;
- se existir `player`, criar ou reaproveitar `team_player`.

### Entrada no time como comissão

Fluxo:

- criar ou reaproveitar `team_member`;
- se existir `user`, criar `user_team_roles.role = COMMITTEE`.

### Entrada no time como diretor/presidente

Fluxo:

- criar ou reaproveitar `team_member`;
- se existir `user`, criar papel em `user_team_roles`.

### Presença em jogos

Fluxo:

- respostas de presença devem sempre operar sobre `team_member_id`.

## Regras de merge e claim

`team_members` é peça crítica quando existe atleta operacional criado antes da entrada da pessoa real no app.

Se houver consolidação entre origem operacional e pessoa real:

- localizar o `source_team_member_id`;
- localizar ou criar o `target_team_member_id`;
- reapontar histórico contextual que depende do integrante;
- impedir que a origem continue como duplicidade ativa;
- depois da consolidação, a origem não precisa permanecer como registro operacional útil ativo.

## O que não deve ficar em `team_members`

Não devem ficar aqui:

- papel de gestão como enum de coluna única;
- vínculo esportivo oficial;
- status de presença em jogo;
- posição esportiva;
- estatística esportiva.

Esses dados pertencem, respectivamente, a:

- `user_team_roles`
- `team_players`
- `match_attendance_responses`
- tabelas de partida
- tabelas estatísticas

## Dependências diretas desta tabela

Esta tabela conversa diretamente com:

- `persons`
- `teams`
- `users`
- `team_players`
- `user_team_roles`
- `match_attendance_responses`
- `team_join_requests`
- fluxos de claim e merge contextual

## Riscos de alteração futura

Mudanças em:

- unicidade de integrante ativo por `team_id + person_id`;
- semântica de `membership_status`;
- relação canônica entre `team_members` e presença em jogos;
- responsabilidade desta tabela como pivô de pertencimento

impactam em cascata:

- aprovação de entrada no time;
- comissão, diretoria e presidência;
- elenco oficial;
- presença em compromissos;
- consolidação contextual de histórico;
- telas públicas e internas de integrantes do time.

## Resumo estrutural

`team_members` é o elo oficial entre a pessoa e o time. Antes de discutir jogador, comissão, diretoria, presença ou histórico, é aqui que o pertencimento ao time nasce.
