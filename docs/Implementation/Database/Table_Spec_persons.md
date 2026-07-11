---
title: Table Spec persons
status: Draft
version: 2.0.0
owner: Product Architecture
last_update: 2026-07-10
related_documents:
  - Table_Spec_accounts.md
  - Table_Spec_users.md
  - Table_Spec_players.md
  - ../../Domain/Identity.md
  - ../../Domain/Players.md
  - ../../API/Auth_API.md
  - ../../API/Players_API.md
---

# Table Spec persons

## Objetivo

Documentar `pessoa canônica (persons)` em nível técnico.

## Finalidade

`persons` representa a identidade-base de qualquer pessoa do ecossistema FUTSTATS.

É a primeira tabela de domínio real da cadeia de identidade.

Ela existe para sustentar:

- `presença da pessoa na plataforma (public.users)`;
- `identidade esportiva (players)`;
- integrante de time que ainda não tem conta;
- atleta avulso;
- técnico sem conta;
- árbitro ad-hoc identificado como pessoa;
- merges e claims futuros sem perder a base da identidade.

## O que `persons` é

- identidade canônica da pessoa;
- camada neutra entre autenticação e papel esportivo;
- base para vínculos futuros no produto.

## O que `persons` não é

- não é autenticação;
- não é conta;
- não é presença da pessoa dentro do app;
- não é, por si só, atleta;
- não é vínculo com time;
- não é participação em partida.

## Responsabilidade no fluxo da primeira entrada

No fluxo de primeira entrada com conta:

1. nasce ou é vinculada a `conta de autenticação (auth.users)`;
2. nasce a `pessoa canônica (persons)`;
3. depois nasce `presença na plataforma (public.users)`.

No fluxo sem conta:

- `persons` pode nascer sozinha;
- depois pode ganhar `players`;
- e só futuramente pode ganhar `public.users`, se essa pessoa entrar no app.

## Quando nasce

`persons` pode nascer em vários contextos válidos:

1. cadastro com e-mail e senha;
2. primeiro login social;
3. primeiro login por telefone;
4. cadastro rápido de atleta avulso;
5. criação operacional de atleta por um time;
6. cadastro de técnico sem conta;
7. cadastro operacional de outra pessoa relevante para o ecossistema.

## Quem grava

`persons` é gravada pela aplicação.

Os casos de uso que podem criar ou atualizar `persons` são, por exemplo:

- `SignUpWithEmail`
- `CompleteSocialAuth`
- `VerifyPhoneOtp`
- `CreateOperationalPlayer`
- `RegisterGuestPlayer`
- `UpdatePlayerProfile`
- fluxos futuros de edição da pessoa canônica

## Estrutura física sugerida

- schema: `public`
- nome da tabela: `persons`

## Colunas

### `id`

- tipo físico: `uuid`
- nulidade: `not null`
- default sugerido: `gen_random_uuid()`
- PK: sim
- finalidade:
  - identificador canônico da pessoa;
  - base para `users.person_id`;
  - base para `players.person_id`;
  - base para `team_members.person_id`;
  - base para `match_staff.person_id`.

### `full_name`

- tipo físico: `text`
- nulidade: `nullable`
- default: sem default
- finalidade:
  - nome civil ou nome completo da pessoa;
  - dado opcional no cadastro rápido;
  - apoio a busca, identificação e exibição mais formal.

### `nickname`

- tipo físico: `text`
- nulidade: `not null`
- default: sem default
- finalidade:
  - nome curto de uso principal;
  - campo canônico mínimo para exibição;
  - base visual principal do app na maior parte dos casos;
  - obrigatório até mesmo para pessoas sem conta.

### `avatar_media_id`

- tipo físico: `uuid`
- nulidade: `nullable`
- FK: `media_assets.id`
- `on update`: `cascade`
- `on delete`: `set null`
- finalidade:
  - avatar canônico da pessoa;
  - compartilhado por leituras de atleta, técnico e outras visões da pessoa.

### `search_name`

- tipo físico: `text`
- nulidade: `not null`
- default: sem default
- finalidade:
  - texto normalizado para busca;
  - apoio a autocomplete;
  - apoio a deduplicação assistida;
  - apoio a cadastro rápido de pessoas já existentes.

### `created_at`

- tipo físico: `timestamptz`
- nulidade: `not null`
- default sugerido: `now()`
- finalidade:
  - trilha de criação da pessoa.

### `updated_at`

- tipo físico: `timestamptz`
- nulidade: `not null`
- default sugerido: `now()`
- manutenção sugerida:
  - trigger de atualização automática no update
- finalidade:
  - trilha da última alteração da pessoa.

## Regras de preenchimento

### Regra mínima obrigatória

A persistência final exige:

- `nickname`
- `search_name`

`full_name` pode ficar nulo.

### Se vier apenas apelido

Se a entrada informar apenas `nickname`:

- `nickname` recebe o valor informado;
- `full_name` pode ficar `null`;
- `search_name` deve ser derivado de `nickname`.

### Se vier apenas nome

Se a entrada informar apenas `full_name`:

- `full_name` recebe o valor informado;
- `nickname` deve receber o mesmo valor;
- `search_name` deve ser derivado do valor resolvido.

### Se vierem nome e apelido

Se a entrada informar `full_name` e `nickname`:

- cada campo recebe seu respectivo valor;
- `search_name` deve ser derivado de ambos, priorizando a estratégia de busca definida pela aplicação.

## Regra de normalização

`search_name` não é texto livre de UI.

Ele deve ser derivado pela aplicação com normalização consistente, por exemplo:

- trim;
- lowercase;
- remoção de acentos;
- remoção ou padronização de caracteres de separação;
- composição que ajude busca por apelido e nome.

Exemplo conceitual:

- `full_name = "Márcio Silva"`
- `nickname = "Marcinho"`
- `search_name` pode armazenar uma forma como:
  - `marcio silva marcinho`

O formato exato pode evoluir, mas a regra central não muda:

- `search_name` existe para busca e deduplicação assistida, não para exibição.

## Constraints sugeridas

## Primary key

- `pk_persons`
  - colunas: `id`

## Foreign key

- `fk_persons_avatar_media`
  - coluna: `avatar_media_id`
  - referência: `media_assets.id`
  - `on update cascade`
  - `on delete set null`

## Check constraints

- `ck_persons_nickname_not_blank`
  - garantir que `btrim(nickname) <> ''`

- `ck_persons_search_name_not_blank`
  - garantir que `btrim(search_name) <> ''`

Opcionalmente:

- `ck_persons_full_name_not_blank_when_present`
  - se `full_name is not null`, então `btrim(full_name) <> ''`

## Unicidade

Não deve existir `unique` em:

- `full_name`
- `nickname`
- `search_name`

Justificativa:

- pessoas diferentes podem ter o mesmo nome;
- pessoas diferentes podem ter o mesmo apelido;
- `search_name` serve para busca, não para garantir identidade única.

## Índices sugeridos

- `idx_persons_search_name`
  - colunas: `search_name`
  - finalidade:
    - autocomplete;
    - busca global;
    - cadastro rápido de atleta;
    - sugestão de reaproveitamento de pessoa existente.

- `idx_persons_nickname`
  - colunas: `nickname`
  - finalidade:
    - leitura rápida de cabeçalhos e buscas simples.

- `idx_persons_full_name`
  - colunas: `full_name`
  - finalidade:
    - busca por nome completo.

Se o banco evoluir para busca textual mais rica, esse bloco pode ser substituído ou complementado por:

- índice funcional;
- índice trigram;
- índice full text.

## Relações com outras tabelas

## Relação com `public.users`

- tipo: `1 -> 0..1`
- coluna dependente: `users.person_id`
- regra:
  - uma pessoa pode existir sem usuário;
  - um usuário final válido deve apontar para uma pessoa.

## Relação com `players`

- tipo: `1 -> 0..1`
- coluna dependente: `players.person_id`
- regra:
  - uma pessoa pode existir sem atleta;
  - um atleta sempre deve apontar para uma pessoa.

## Relação com `team_members`

- tipo: `1 -> N`
- coluna dependente: `team_members.person_id`
- regra:
  - a mesma pessoa pode ter histórico em múltiplos times;
  - a mesma pessoa pode ser integrante de mais de um time ao mesmo tempo.

## Relação com `match_staff`

- tipo: `1 -> N`
- coluna dependente: `match_staff.person_id`
- regra:
  - permite técnico sem conta e sem player.

## Relação com `match_referees`

- tipo: `1 -> N` quando usado em modo pessoa ad-hoc
- coluna dependente: `match_referees.referee_person_id`

## Regras de negócio centrais

1. `persons` é a base canônica da identidade.
2. `persons` pode existir sem conta.
3. `persons` pode existir sem `player`.
4. `persons` pode existir sem vínculo de time.
5. `persons` pode representar atleta, técnico, dirigente ou pessoa operacional.
6. O app não deve depender de autenticação para criar uma `person`.
7. `nickname` é o mínimo obrigatório para persistência final.
8. `full_name` é importante, mas não obrigatório no cadastro rápido.

## Casos de uso diretos desta tabela

### 1. Criação de conta

Fluxo:

- cria `persons`;
- depois cria `public.users`.

### 2. Cadastro rápido de atleta avulso

Fluxo:

- cria `persons`;
- depois cria `players`;
- não cria `public.users`.

### 3. Criação operacional de atleta de elenco sem conta

Fluxo:

- cria `persons`;
- cria `players`;
- depois pode ganhar `team_members` e `team_players`.

### 4. Técnico sem conta

Fluxo:

- cria `persons`;
- pode ser usado em `team_staff_defaults` e `match_staff`;
- não precisa de `public.users`;
- não precisa de `players`.

## Relação com claim e merge

`persons` é ponto crítico para consolidar identidade real.

Quando um usuário real entra no app e reivindica histórico operacional:

- a consolidação deve respeitar a `person` canônica do usuário;
- `players` operacionais podem ser reatribuídos para o `player` canônico vinculado a essa pessoa;
- vínculos contextuais do time devem ser consolidados em favor da pessoa real.

Regra importante:

- não criar nova `person` sem necessidade quando já existir correspondência confiável.

## Regras de atualização

Atualizações em `persons` devem ser tratadas com cuidado porque impactam:

- cabeçalho do perfil do atleta;
- busca global;
- autocomplete de cadastro rápido;
- tela de técnico e staff;
- resumos derivados de perfil;
- merges de identidade.

## O que não deve ser alterado sem avaliar cascata

Mudanças em:

- estratégia de `search_name`;
- obrigatoriedade de `nickname`;
- regra de unicidade;
- relação `1 -> 0..1` com `players`;
- relação `1 -> 0..1` com `public.users`

impactam diretamente:

- onboarding;
- cadastro rápido;
- claim de atleta;
- busca global;
- prevenção de duplicidade;
- perfil do atleta;
- match operation.

## Dependências diretas desta tabela

Esta tabela é base para:

- `public.users`
- `players`
- `team_members`
- `match_staff`
- `team_staff_defaults`
- `match_referees`
- `player_profile_summary`
- APIs de auth e player

## Resumo estrutural

`persons` é a âncora da identidade no produto.

Se `auth.users` é a conta e `public.users` é a presença no app, `persons` é a pessoa de verdade que sustenta todas as outras leituras.
