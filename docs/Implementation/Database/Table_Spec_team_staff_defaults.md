---
title: Table Spec team_staff_defaults
status: Draft
version: 2.1.0
owner: Product Architecture
last_update: 2026-07-10
related_documents:
  - Table_Spec_teams.md
  - Table_Spec_matches.md
  - Table_Spec_match_staff.md
  - Table_Spec_persons.md
  - ../../Domain/Matches.md
  - ../../Domain/Teams.md
  - ../../API/Teams_API.md
---

# Table Spec team_staff_defaults

## Objetivo

Documentar `staff padrão do time (team_staff_defaults)` em nível técnico.

## Finalidade

`team_staff_defaults` representa pessoas pré-configuradas pelo time para funções de staff usadas como sugestão na criação da partida.

No recorte atual do produto, o foco principal é:

- técnico padrão por modalidade.

## O que `team_staff_defaults` é

- configuração padrão do time;
- atalho operacional para criação da partida;
- memória administrativa reutilizável.

## O que `team_staff_defaults` não é

- não é staff efetivo da partida;
- não é papel de diretoria;
- não é vínculo esportivo;
- não é operador da partida;
- não é histórico esportivo real.

## Responsabilidade na cadeia do domínio

No fluxo correto:

1. o time configura pessoas padrão para determinadas funções;
2. a criação da partida pode herdar essa configuração;
3. o responsável pela escalação confirma ou altera;
4. o histórico oficial do jogo continua em `match_staff`.

Logo:

- padrão do time pertence a `team_staff_defaults`;
- fato da partida pertence a `match_staff`.

## Quando nasce

`team_staff_defaults` pode nascer quando:

1. o time configura seu técnico padrão;
2. o time muda o técnico padrão por modalidade;
3. o time organiza previamente pessoas recorrentes para facilitar partidas futuras.

## Quem grava

`team_staff_defaults` é gravada pela aplicação.

Casos de uso relevantes:

- `SetTeamDefaultCoach`
- `ReplaceTeamDefaultCoach`
- `RemoveTeamDefaultCoach`

## Estrutura física sugerida

- schema: `public`
- nome da tabela: `team_staff_defaults`

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
  - apontar qual time é dono dessa configuração padrão.

### `person_id`

- tipo físico: `uuid`
- nulidade: `not null`
- FK: `persons.id`
- `on update`: `cascade`
- `on delete`: `restrict`
- finalidade:
  - apontar qual pessoa foi configurada como padrão.

### `staff_role`

- tipo físico: `staff_role`
- nulidade: `not null`
- finalidade:
  - indicar a função de staff configurada.

### `modality`

- tipo físico: `sport_modality`
- nulidade: `not null`
- finalidade:
  - delimitar em qual modalidade esse padrão se aplica.

### `is_default`

- tipo físico: `boolean`
- nulidade: `not null`
- default sugerido: `true`
- finalidade:
  - marcar se aquela linha está ativa como padrão principal daquela modalidade e função.

### `created_by_user_id`

- tipo físico: `uuid`
- nulidade: `nullable`
- FK: `users.id`
- `on update`: `cascade`
- `on delete`: `set null`
- finalidade:
  - registrar quem definiu a configuração.

### `notes`

- tipo físico: `text`
- nulidade: `nullable`
- finalidade:
  - observações administrativas opcionais.

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

- representa o técnico padrão do time para aquela modalidade.

## Constraints sugeridas

## Primary key

- `pk_team_staff_defaults`
  - colunas: `id`

## Foreign keys

- `fk_team_staff_defaults_team`
  - coluna: `team_id`
  - referência: `teams.id`
  - `on update cascade`
  - `on delete restrict`

- `fk_team_staff_defaults_person`
  - coluna: `person_id`
  - referência: `persons.id`
  - `on update cascade`
  - `on delete restrict`

- `fk_team_staff_defaults_created_by_user`
  - coluna: `created_by_user_id`
  - referência: `users.id`
  - `on update cascade`
  - `on delete set null`

## Check constraints sugeridas

- `ck_team_staff_defaults_notes_not_blank_when_present`
  - se `notes is not null`, então `btrim(notes) <> ''`

## Unicidade

No estado atual do produto, deve existir no máximo um padrão principal por:

- `team_id + modality + staff_role`

considerando linhas com:

- `is_default = true`

Nome sugerido:

- `uq_team_staff_defaults_active_default`

Implementação sugerida:

- índice único parcial sobre (`team_id`, `modality`, `staff_role`) com condição `is_default = true`

## Índices sugeridos

- `idx_team_staff_defaults_team_id`
  - colunas: `team_id`
  - finalidade:
    - listar defaults do time.

- `idx_team_staff_defaults_person_id`
  - colunas: `person_id`
  - finalidade:
    - localizar em quais times/modalidades a pessoa é padrão.

- `idx_team_staff_defaults_team_modality`
  - colunas: (`team_id`, `modality`)
  - finalidade:
    - hidratar rápido a criação da partida.

- `idx_team_staff_defaults_staff_role`
  - colunas: `staff_role`
  - finalidade:
    - filtros por função.

## Regras de negócio centrais

1. Tudo aponta para `person_id`, não para `user_id` nem `player_id`.
2. O time pode ter técnico padrão sem depender de a pessoa ter conta no app.
3. O padrão é por modalidade.
4. O padrão existe para acelerar a criação da partida.
5. O padrão não substitui a escolha final do jogo.
6. O padrão pode aparecer na escalação apenas como sugestão ainda não confirmada.

## Regras de consistência contextual

### Coerência com o time

O backend deve validar que:

- `team_staff_defaults.team_id` é o time que está configurando aquele padrão.

### Coerência com a pessoa

A pessoa configurada pode ser:

- integrante do time;
- jogador do time;
- dirigente;
- comissão;
- pessoa sem conta;
- pessoa sem vínculo esportivo.

Logo:

- `team_staff_defaults` não deve exigir `team_member_id`.

### Coerência com a modalidade

Como o padrão é por modalidade:

- futsal pode ter um técnico padrão;
- society pode ter outro;
- campo pode ter outro;
- a mesma pessoa pode aparecer em mais de uma modalidade.

## Relações com outras tabelas

## Relação com `teams`

- tipo: `N -> 1`
- chave: `team_staff_defaults.team_id -> teams.id`
- regra:
  - cada configuração pertence a um time específico.

## Relação com `persons`

- tipo: `N -> 1`
- chave: `team_staff_defaults.person_id -> persons.id`
- regra:
  - a configuração sempre aponta para uma pessoa canônica.

## Relação com `match_staff`

- relação indireta por herança
- regra:
  - essa tabela serve como fonte de sugestão para `match_staff`.

## Regras operacionais por fluxo

### Configuração do técnico padrão

Fluxo:

- o time acessa suas configurações;
- escolhe o técnico padrão por modalidade;
- salva em `team_staff_defaults`.

### Criação da partida

Fluxo:

- a modalidade do jogo é conhecida;
- o sistema consulta `team_staff_defaults`;
- se houver um `HEAD_COACH` padrão, ele pode ser sugerido na partida;
- essa sugestão não obriga criação imediata de `match_staff`.

### Troca de padrão

Fluxo:

- o time muda de técnico padrão;
- a nova configuração passa a valer para partidas futuras;
- partidas antigas não devem ser reescritas.

## O que não deve ficar em `team_staff_defaults`

Não devem ficar aqui:

- técnico efetivo da partida;
- estatística real de técnico;
- operador do jogo;
- papel de diretoria.

Esses dados pertencem, respectivamente, a:

- `match_staff`
- camadas analíticas derivadas de `match_staff`
- `match_operator_assignments`
- `user_team_roles`

## Dependências diretas desta tabela

Esta tabela conversa diretamente com:

- `teams`
- `persons`
- `match_staff`
- `Teams_API`
- criação de partida

## Riscos de alteração futura

Mudanças em:

- enum `staff_role`;
- regra de padrão por modalidade;
- exigência de vínculo com o time;
- política de múltiplos defaults

impactam em cascata:

- configurações do time;
- criação da partida;
- herança de técnico padrão;
- consistência entre setup e histórico real.

## Resumo estrutural

`team_staff_defaults` é a memória administrativa de quem costuma exercer determinada função no time. Ele acelera o fluxo, mas não substitui a verdade histórica da partida.
