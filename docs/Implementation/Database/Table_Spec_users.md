---
title: Table Spec users
status: Draft
version: 2.1.0
owner: Product Architecture
last_update: 2026-07-20
related_documents:
  - ../../ADR/ADR_012_Identity_On_Supabase_Auth.md
  - ../../API/Auth_API.md
  - ../../API/Identity_API.md
  - ../../Domain/Identity.md
  - Table_Spec_accounts.md
  - Table_Spec_persons.md
  - Table_Spec_user_preferences.md
---

# Table Spec users

## Objetivo

Documentar `presença da pessoa na plataforma (public.users)` em nível técnico.

## Finalidade

`users` representa a presença autenticada da pessoa dentro do app.

Esta tabela existe para guardar o que é próprio da experiência da pessoa no FUTSTATS, como:

- handle público;
- nome de contexto no app;
- telefone de contato não autenticador;
- região manual;
- aceite de termos;
- progresso de onboarding inicial.

## O que `users` é

- a presença da pessoa dentro da plataforma;
- a camada que nasce a partir da conta autenticada;
- a referência principal para bootstrap de sessão do produto.

## O que `users` não é

- não é a conta de autenticação;
- não é a pessoa canônica;
- não é o atleta;
- não é papel de time;
- não é preferências avançadas do app;
- não é histórico esportivo.

## Responsabilidade no fluxo da primeira entrada

No fluxo padrão com conta válida:

1. nasce ou é vinculada a `conta de autenticação (auth.users)`;
2. nasce ou é vinculada a `pessoa canônica (persons)`;
3. nasce `presença na plataforma (public.users)`;
4. se necessário, a UI exige `Complete Profile`;
5. depois pode surgir `identidade esportiva (players)`.

## Quando nasce

`users` nasce em fluxos autenticados:

1. cadastro com e-mail e senha;
2. primeiro login social;
3. primeiro login por telefone.

Ela não deve nascer em:

- cadastro rápido de atleta avulso;
- criação operacional de técnico sem conta;
- criação de pessoa operacional sem autenticação.

## Quem grava

`users` é gravada pela aplicação, nunca diretamente pelo Supabase Auth.

Os casos de uso mais relevantes são:

- `SignUpWithEmail`
- `CompleteSocialAuth`
- `VerifyPhoneOtp`
- `CompleteProfile`
- `PatchMe`
- atualização da escolha de intenção inicial

## Estrutura física sugerida

- schema: `public`
- nome da tabela: `users`

## Colunas

### `id`

- tipo físico: `uuid`
- nulidade: `not null`
- PK: sim
- FK: `auth.users.id`
- `on update`: `cascade`
- `on delete`: `restrict` ou política equivalente compatível com preservação histórica
- finalidade:
  - identificador do usuário dentro do produto;
  - mesma chave da conta autenticada;
  - ponto de ligação 1:1 com `auth.users`.

### `person_id`

- tipo físico: `uuid`
- nulidade: `not null`
- FK: `persons.id`
- unicidade: `unique`
- `on update`: `cascade`
- `on delete`: `restrict`
- finalidade:
  - apontar qual pessoa canônica está presente na plataforma por essa conta.

### `username`

- tipo físico: `text`
- nulidade: `nullable` apenas durante onboarding transitório
- default: sem default
- unicidade: `unique`
- finalidade:
  - handle público do usuário;
  - chave pública de identificação social dentro do app;
  - dado obrigatório para o estado final do onboarding mínimo.

### `display_name`

- tipo físico: `text`
- nulidade: `nullable` apenas durante onboarding transitório
- default: sem default
- finalidade:
  - nome público de contexto da pessoa no app;
  - saudação, cabeçalhos e leituras sociais.

### `avatar_url`

- tipo físico: `text`
- nulidade: `nullable`
- default: sem default
- finalidade:
  - avatar da presença da pessoa na plataforma;
  - pode refletir foto do provider social ou mídia de app.

Observação:

- o sistema também possui `persons.avatar_media_id` como avatar canônico da pessoa;
- este campo em `users` existe como dado de presença/plataforma;
- no app atual, avatares vindos de provider social podem ser copiados para o bucket `user-avatars` e gravados neste campo como URL pública;
- a UI deve usar fallback visual quando a URL não carregar;
- qualquer estratégia de consolidação entre os dois deve ser documentada depois, se o produto quiser unificar a origem visual.

### `contact_phone`

- tipo físico: `text`
- nulidade: `nullable`
- default: sem default
- finalidade:
  - telefone de contato da pessoa;
  - não é telefone de autenticação.

Observação:

- no app atual, `contact_phone` pode ser usado como identificador de busca no login por identificador;
- a autenticação final continua sendo por e-mail/senha no Supabase Auth;
- para cadastro brasileiro, o front deve exigir DDD quando o telefone for informado e normalizar para `+55...`.

### `region_state`

- tipo físico: `text`
- nulidade: `nullable`
- default: sem default
- finalidade:
  - estado informado manualmente pela pessoa.

### `region_city`

- tipo físico: `text`
- nulidade: `nullable`
- default: sem default
- finalidade:
  - cidade informada manualmente pela pessoa.

### `region_zone`

- tipo físico: `text`
- nulidade: `nullable`
- default: sem default
- finalidade:
  - zona/região da cidade, quando fizer sentido.

### `terms_accepted_at`

- tipo físico: `timestamptz`
- nulidade: `not null`
- default: sem default
- finalidade:
  - registrar aceite de termos para uso da plataforma.

### `start_path_completed_at`

- tipo físico: `timestamptz`
- nulidade: `nullable`
- default: sem default
- finalidade:
  - marcar que a pessoa já passou pela tela de intenção inicial.

### `last_start_path_choice`

- tipo físico: `start_path_choice`
- nulidade: `nullable`
- default: sem default
- finalidade:
  - registrar a última escolha explícita na tela de intenção inicial.

### `created_at`

- tipo físico: `timestamptz`
- nulidade: `not null`
- default sugerido: `now()`
- finalidade:
  - trilha de criação da presença da pessoa na plataforma.

### `updated_at`

- tipo físico: `timestamptz`
- nulidade: `not null`
- default sugerido: `now()`
- manutenção sugerida:
  - trigger de atualização automática no update
- finalidade:
  - trilha da última atualização do registro.

### `deleted_at`

- tipo físico: `timestamptz`
- nulidade: `nullable`
- default: sem default
- finalidade:
  - soft delete da presença na plataforma, sem destruir a pessoa nem o histórico esportivo.

## Enums físicos

### `start_path_choice`

- `CREATE_TEAM`
- `JOIN_TEAM`
- `EXPLORE`

## Regras do enum

- o enum não define tipo fixo de usuário;
- ele registra apenas a escolha de intenção feita naquele momento;
- a pessoa pode mudar de comportamento real ao longo do tempo.

## Constraints sugeridas

## Primary key

- `pk_users`
  - colunas: `id`

## Foreign keys

- `fk_users_auth_user`
  - coluna: `id`
  - referência: `auth.users.id`
  - `on update cascade`
  - `on delete restrict`

- `fk_users_person`
  - coluna: `person_id`
  - referência: `persons.id`
  - `on update cascade`
  - `on delete restrict`

## Unique constraints

- `uq_users_person_id`
  - colunas: `person_id`

- `uq_users_username`
  - colunas: `username`

Observação:

- `uq_users_username` deve aceitar múltiplos `null` enquanto houver onboarding transitório;
- no estado final do onboarding, `username` deixa de poder permanecer nulo por regra de negócio.

## Check constraints sugeridas

- `ck_users_username_not_blank_when_present`
  - se `username is not null`, então `btrim(username) <> ''`

- `ck_users_display_name_not_blank_when_present`
  - se `display_name is not null`, então `btrim(display_name) <> ''`

- `ck_users_contact_phone_not_blank_when_present`
  - se `contact_phone is not null`, então `btrim(contact_phone) <> ''`

- `ck_users_region_state_not_blank_when_present`
  - se `region_state is not null`, então `btrim(region_state) <> ''`

- `ck_users_region_city_not_blank_when_present`
  - se `region_city is not null`, então `btrim(region_city) <> ''`

- `ck_users_region_zone_not_blank_when_present`
  - se `region_zone is not null`, então `btrim(region_zone) <> ''`

## Índices sugeridos

- `idx_users_username`
  - colunas: `username`
  - finalidade:
    - resolução de perfil público;
    - checagem de disponibilidade;
    - rotas públicas futuras.

- `idx_users_person_id`
  - colunas: `person_id`
  - finalidade:
    - navegação entre identidade canônica e presença no app.

- `idx_users_start_path_choice`
  - colunas: `last_start_path_choice`
  - finalidade:
    - analytics e segmentação leve.

- `idx_users_deleted_at`
  - colunas: `deleted_at`
  - finalidade:
    - filtros operacionais e consistência de soft delete.

## Regras de preenchimento

### Regra mínima no estado final

No estado final do onboarding mínimo, `users` deve ter:

- `person_id`
- `username`
- `display_name`
- `terms_accepted_at`

### Estado transitório permitido

Em login social novo ou telefone novo:

- `username` pode nascer `null`;
- `display_name` pode nascer `null` ou incompleto;
- a UI deve tratar isso como onboarding pendente.

### Regra de `terms_accepted_at`

`terms_accepted_at` é obrigatório.

Logo:

- não existe conta válida para uso normal no produto sem aceite de termos persistido em `users`.

## Regras de negócio centrais

1. `users` representa presença de plataforma, não identidade canônica.
2. Toda linha em `users` deve apontar para uma `person`.
3. Toda linha em `users` deve compartilhar o mesmo `id` da conta em `auth.users`.
4. `username` nunca vem do provedor externo.
5. `display_name` é nome de contexto da plataforma, não substitui `persons.full_name` nem `persons.nickname`.
6. `contact_phone` é telefone de contato, não telefone de autenticação.
7. Região é manual e opcional.
8. `start_path_completed_at` e `last_start_path_choice` registram intenção inicial, não classe fixa de usuário.

## Relações com outras tabelas

## Relação com `auth.users`

- tipo: `1 -> 1`
- chave: `users.id = auth.users.id`
- regra:
  - não deve existir `users` sem conta autenticada correspondente.

## Relação com `persons`

- tipo: `N -> 1`, com unicidade prática em `users.person_id`
- chave: `users.person_id -> persons.id`
- regra:
  - uma presença no app aponta para exatamente uma pessoa;
  - a mesma pessoa não deve ter múltiplas presenças autenticadas ativas no modelo atual.

## Relação com `players`

- não há FK direta em `users`;
- a ponte correta é:
  - `users.person_id`
  - `persons.id`
  - `players.person_id`

## Relação com `user_preferences`

- tipo: `1 -> 1`
- chave dependente: `user_preferences.user_id`
- regra:
  - preferências devem nascer junto com `users` no cadastro novo.

## Relação com `user_team_roles`

- tipo: `1 -> N`
- regra:
  - papéis de gestão ficam em tabela contextual própria;
  - não devem ser embutidos em `users`.

## Relação com fluxos de onboarding

Esta tabela é a base de:

- `GET /api/v1/me`
- `POST /api/v1/auth/complete-profile`
- `PATCH /api/v1/me`
- `PATCH /api/v1/me/preferences` de forma indireta
- `Start Path Selection`

## Regras de atualização por endpoint

### `POST /api/v1/auth/complete-profile`

Pode atualizar:

- `username`
- `display_name`

### `PATCH /api/v1/me`

Pode atualizar:

- `display_name`
- `avatar_url`
- `contact_phone`
- `region_state`
- `region_city`
- `region_zone`

Não deve atualizar:

- `username` neste contrato atual
- `person_id`
- `terms_accepted_at`

### Fluxo de intenção inicial

Pode atualizar:

- `start_path_completed_at`
- `last_start_path_choice`

## Regras de soft delete

- `deleted_at` marca desativação lógica da presença da pessoa no app;
- soft delete não deve apagar:
  - `persons`
  - `players`
  - fatos esportivos

## O que não deve ficar em `users`

Não devem ficar aqui:

- `full_name`
  - pertence a `persons`
- `nickname`
  - pertence a `persons`
- perna dominante, altura, peso, modalidades, posições
  - pertencem a `players` e tabelas filhas
- preferências de idioma, tema e visibilidade
  - pertencem a `user_preferences`
- papéis de time
  - pertencem a `user_team_roles`

## Dependências diretas desta tabela

Esta tabela conversa diretamente com:

- `auth.users`
- `persons`
- `user_preferences`
- `user_team_roles`
- APIs de auth
- APIs de identity
- bootstrap da sessão
- onboarding mínimo

## Riscos de alteração futura

Mudanças em:

- relação `users.id = auth.users.id`
- unicidade de `person_id`
- obrigatoriedade de `username`
- regra de `display_name`
- semântica de `terms_accepted_at`
- enum `start_path_choice`

impactam em cascata:

- login e cadastro;
- `GET /api/v1/me`;
- `Complete Profile`;
- intenção inicial;
- edição de perfil;
- qualquer tela que dependa da presença autenticada da pessoa.

## Resumo estrutural

Se `auth.users` é a conta e `persons` é a pessoa, `public.users` é a materialização dessa pessoa usando o FUTSTATS como participante da plataforma.
