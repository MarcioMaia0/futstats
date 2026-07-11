---
title: Table Spec match_staff
status: Draft
version: 2.1.0
owner: Product Architecture
last_update: 2026-07-10
related_documents:
  - Table_Spec_matches.md
  - Table_Spec_team_staff_defaults.md
  - Table_Spec_persons.md
  - Table_Spec_team_members.md
  - ../../Domain/Matches.md
  - ../../API/Matches_API.md
---

# Table Spec match_staff

## Objetivo

Documentar `staff efetivo da partida (match_staff)` em nível técnico.

## Finalidade

`match_staff` representa quem exerceu funções internas do time naquela partida específica.

No recorte já fechado do produto, o foco principal é:

- técnico efetivo da partida;
- histórico real por jogo;
- relatórios por pessoa como técnico;
- diferença clara entre staff padrão do time e staff realmente usado naquele jogo.

## O que `match_staff` é

- staff efetivo contextual da partida;
- fonte factual de quem atuou naquele jogo;
- camada histórica para relatórios por técnico.

## O que `match_staff` não é

- não é staff padrão do time;
- não é papel de diretoria;
- não é escalação de atleta;
- não é operador da partida;
- não é vínculo esportivo oficial.

## Responsabilidade na cadeia do domínio

No fluxo correto:

1. o time pode ter um técnico padrão em `team_staff_defaults`;
2. ao criar a partida, esse padrão pode ser sugerido;
3. na escalação, o responsável confirma, troca ou remove esse nome;
4. o que vale para histórico e estatística do jogo é `match_staff`.

Logo:

- staff padrão pertence a `team_staff_defaults`;
- staff efetivo da partida pertence a `match_staff`.

## Quando nasce

`match_staff` pode nascer quando:

1. a partida é criada com herança do técnico padrão;
2. a escalação confirma o técnico que vai comandar o jogo;
3. o técnico padrão é substituído por outra pessoa;
4. a informação é ajustada depois por revisão administrativa.

## Quem grava

`match_staff` é gravada pela aplicação.

Casos de uso relevantes:

- `HydrateMatchWithDefaultCoach`
- `SetEffectiveMatchCoach`
- `ReplaceEffectiveMatchCoach`
- `ReviewMatchStaff`

## Estrutura física sugerida

- schema: `public`
- nome da tabela: `match_staff`

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
  - apontar a qual partida operacional o staff pertence.

### `team_id`

- tipo físico: `uuid`
- nulidade: `not null`
- FK: `teams.id`
- `on update`: `cascade`
- `on delete`: `restrict`
- finalidade:
  - identificar para qual lado do time aquela pessoa atuou.

### `person_id`

- tipo físico: `uuid`
- nulidade: `not null`
- FK: `persons.id`
- `on update`: `cascade`
- `on delete`: `restrict`
- finalidade:
  - apontar qual pessoa exerceu a função na partida.

### `staff_role`

- tipo físico: `staff_role`
- nulidade: `not null`
- finalidade:
  - classificar qual função de staff a pessoa exerceu.

### `created_from_default`

- tipo físico: `boolean`
- nulidade: `not null`
- default sugerido: `false`
- finalidade:
  - indicar se a linha nasceu herdada de `team_staff_defaults`.

### `created_by_user_id`

- tipo físico: `uuid`
- nulidade: `nullable`
- FK: `users.id`
- `on update`: `cascade`
- `on delete`: `set null`
- finalidade:
  - registrar qual usuário definiu ou confirmou o staff da partida.

### `notes`

- tipo físico: `text`
- nulidade: `nullable`
- finalidade:
  - observações administrativas rápidas sobre essa definição.

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

### `staff_role`

- `HEAD_COACH`

## Regras dos enums

### `HEAD_COACH`

- representa o técnico efetivo do time naquela partida.

## Constraints sugeridas

## Primary key

- `pk_match_staff`
  - colunas: `id`

## Foreign keys

- `fk_match_staff_match`
  - coluna: `match_id`
  - referência: `matches.id`
  - `on update cascade`
  - `on delete restrict`

- `fk_match_staff_team`
  - coluna: `team_id`
  - referência: `teams.id`
  - `on update cascade`
  - `on delete restrict`

- `fk_match_staff_person`
  - coluna: `person_id`
  - referência: `persons.id`
  - `on update cascade`
  - `on delete restrict`

- `fk_match_staff_created_by_user`
  - coluna: `created_by_user_id`
  - referência: `users.id`
  - `on update cascade`
  - `on delete set null`

## Check constraints sugeridas

- `ck_match_staff_notes_not_blank_when_present`
  - se `notes is not null`, então `btrim(notes) <> ''`

## Unicidade

No estado atual do produto, deve existir no máximo um staff ativo por:

- `match_id + team_id + staff_role`

Nome sugerido:

- `uq_match_staff_match_team_role`

## Índices sugeridos

- `idx_match_staff_match_id`
  - colunas: `match_id`
  - finalidade:
    - listar staff da partida.

- `idx_match_staff_team_id`
  - colunas: `team_id`
  - finalidade:
    - relatórios por time.

- `idx_match_staff_person_id`
  - colunas: `person_id`
  - finalidade:
    - relatórios por técnico.

- `idx_match_staff_staff_role`
  - colunas: `staff_role`
  - finalidade:
    - filtros por função.

## Regras de negócio centrais

1. Tudo aponta para `person_id`, não para `user_id` nem `player_id`.
2. O técnico da partida pode ser:
   - jogador;
   - dirigente;
   - comissão;
   - pessoa sem conta.
3. O staff efetivo da partida pode ser diferente do staff padrão do time.
4. O que vale para histórico e estatística é sempre `match_staff`.
5. No recorte atual, `HEAD_COACH` é a função oficial fechada.
6. A escalação pode ser aberta com técnico apenas sugerido, sem `match_staff` confirmado ainda.
7. Quando existir confirmação efetiva do técnico da partida, a fonte histórica oficial é `match_staff`.

## Regras de consistência contextual

### Coerência com a partida

O backend deve validar que:

- `match_staff.match_id` pertence à partida correta;
- `match_staff.team_id = matches.team_id`

Em outras palavras:

- `match_staff` representa staff do próprio time daquela `match`, não de um lado arbitrário.

### Coerência com a pessoa

`person_id` pode apontar para:

- pessoa com `user`;
- pessoa sem `user`;
- pessoa que também seja `player`;
- pessoa que também tenha `team_member`.

Mas:

- nenhuma dessas condições é obrigatória isoladamente para a existência da linha.

### Coerência com pertencimento ao time

Se a pessoa já for integrante do time:

- isso pode existir em `team_members`.

Se não for integrante formal:

- ainda assim ela pode ser o técnico efetivo da partida.

Logo:

- `match_staff` não deve exigir `team_member_id`.

## Relações com outras tabelas

## Relação com `matches`

- tipo: `N -> 1`
- chave: `match_staff.match_id -> matches.id`
- regra:
  - cada linha pertence a uma partida específica.

## Relação com `teams`

- tipo: `N -> 1`
- chave: `match_staff.team_id -> teams.id`
- regra:
  - identifica para qual time o staff atuou.

## Relação com `persons`

- tipo: `N -> 1`
- chave: `match_staff.person_id -> persons.id`
- regra:
  - a função é sempre atribuída a uma pessoa canônica.

## Relação com `team_staff_defaults`

- relação indireta por reaproveitamento
- regra:
  - `team_staff_defaults` pode pré-preencher `match_staff`, mas não substituí-lo.

## Regras operacionais por fluxo

### Herança do técnico padrão

Fluxo:

- o time possui técnico padrão por modalidade;
- a partida nasce com esse nome sugerido;
- a aplicação pode apenas hidratar a sugestão na UI;
- `match_staff` só precisa nascer quando houver confirmação efetiva para aquela partida.

### Troca na escalação

Fluxo:

- o responsável remove o técnico sugerido;
- escolhe outra pessoa;
- `match_staff` passa a refletir apenas a escolha final daquela partida.

### Escalação sem técnico confirmado

Fluxo:

- existe técnico padrão do time;
- a UI mostra a sugestão;
- o responsável decide não confirmar ainda;
- nesse estado:
  - `team_staff_defaults` continua sendo apenas sugestão;
  - `match_staff` pode continuar sem linha ativa de `HEAD_COACH`.

### Revisão posterior

Fluxo:

- a partida já aconteceu;
- a pessoa registrada como técnico estava errada;
- o registro é corrigido para manter o histórico real.

## O que não deve ficar em `match_staff`

Não devem ficar aqui:

- papel de diretoria;
- vínculo esportivo;
- operador do cronômetro;
- árbitro;
- nota do árbitro.

Esses dados pertencem, respectivamente, a:

- `user_team_roles`
- `team_players`
- `match_operator_assignments`
- `match_referees`
- `referee_reviews`

## Dependências diretas desta tabela

Esta tabela conversa diretamente com:

- `matches`
- `teams`
- `persons`
- `team_staff_defaults`
- `Matches_API`

## Riscos de alteração futura

Mudanças em:

- enum `staff_role`;
- exigência ou não de pertencimento ao time;
- política de herança do padrão;
- relatórios por técnico

impactam em cascata:

- criação da partida;
- escalação;
- histórico técnico;
- estatísticas por técnico;
- leitura pública e interna do jogo.

## Resumo estrutural

`match_staff` guarda quem realmente comandou o time naquela partida. O padrão do time ajuda, mas o fato histórico oficial nasce aqui.
