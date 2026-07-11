---
title: Table Spec user_preferences
status: Draft
version: 2.0.0
owner: Product Architecture
last_update: 2026-07-10
related_documents:
  - Table_Spec_users.md
  - Table_Spec_persons.md
  - ../../ADR/ADR_012_Identity_On_Supabase_Auth.md
  - ../../ADR/ADR_005_UI_Language_Modes.md
  - ../../API/Identity_API.md
  - ../../Security/Privacy_Model.md
---

# Table Spec user_preferences

## Objetivo

Documentar `preferências do usuário (user_preferences)` em nível técnico.

## Finalidade

Guardar preferências de app, privacidade e apresentação de nome da pessoa dentro da plataforma.

Esta tabela existe para sustentar:

- modo de linguagem da UI;
- tema preferido;
- privacidade do perfil;
- forma de exibição do nome por audiência;
- dismiss de prompts operacionais da experiência.

## O que `user_preferences` é

- configuração da experiência da pessoa no app;
- extensão 1:1 de `users`;
- camada de preferências e privacidade.

## O que `user_preferences` não é

- não é identidade canônica;
- não é presença base no app;
- não é perfil esportivo;
- não é papel contextual de time.

## Estrutura física sugerida

- schema: `public`
- nome da tabela: `user_preferences`

## Colunas

### `user_id`

- tipo físico: `uuid`
- nulidade: `not null`
- PK: sim
- FK: `users.id`
- `on update`: `cascade`
- `on delete`: `cascade`
- finalidade:
  - manter relação 1:1 com `users`.

### `preferred_language_mode`

- tipo físico: `language_mode`
- nulidade: `not null`
- default físico sugerido: `TECHNICAL`
- inicialização de aplicação sugerida:
  - no momento da criação, a aplicação pode sobrescrever o default físico com base no locale/dispositivo
- finalidade:
  - definir o tom de linguagem preferido da interface.

### `preferred_theme_id`

- tipo físico: `uuid`
- nulidade: `nullable`
- FK: `themes.id`
- `on update`: `cascade`
- `on delete`: `set null`
- finalidade:
  - tema preferido da pessoa.

### `profile_visibility`

- tipo físico: `profile_visibility`
- nulidade: `not null`
- default sugerido: `PUBLIC`
- finalidade:
  - definir quem pode acessar o perfil da pessoa.

### `name_display_public`

- tipo físico: `name_display`
- nulidade: `not null`
- default sugerido: `NAME`
- finalidade:
  - como o nome deve aparecer para público geral autorizado.

### `name_display_followers`

- tipo físico: `name_display`
- nulidade: `not null`
- default sugerido: `NAME`
- finalidade:
  - como o nome deve aparecer para seguidores autorizados.

### `name_display_team`

- tipo físico: `name_display`
- nulidade: `not null`
- default sugerido: `NICKNAME`
- finalidade:
  - como o nome deve aparecer para quem compartilha time com a pessoa.

### `region_prompt_dismissed_at`

- tipo físico: `timestamptz`
- nulidade: `nullable`
- default: sem default
- finalidade:
  - registrar que a pessoa dispensou o prompt de região naquela fase da experiência.

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

### `language_mode`

- `TECHNICAL`
- `VARZEA`
- `RESENHA`

### `profile_visibility`

- `PUBLIC`
- `FOLLOWERS`
- `TEAM_MEMBERS`

### `name_display`

- `NAME`
- `NICKNAME`
- `BOTH`

## Constraints sugeridas

- `pk_user_preferences`
  - colunas: `user_id`

- `fk_user_preferences_user`
  - coluna: `user_id`
  - referência: `users.id`
  - `on update cascade`
  - `on delete cascade`

- `fk_user_preferences_theme`
  - coluna: `preferred_theme_id`
  - referência: `themes.id`
  - `on update cascade`
  - `on delete set null`

## Índices sugeridos

- `idx_user_preferences_profile_visibility`
  - colunas: `profile_visibility`

- `idx_user_preferences_preferred_language_mode`
  - colunas: `preferred_language_mode`

## Regras de negócio

1. O registro deve nascer junto com `users` em cadastro novo.
2. `profile_visibility` default deve ser `PUBLIC`.
3. `profile_visibility` controla acesso ao perfil, preferencialmente com apoio de RLS ou camada equivalente de acesso.
4. `name_display_*` controla somente a forma de exibição do nome, não o acesso ao perfil.
5. A precedência da audiência ao resolver nome deve ser:
   - `TEAM_MEMBERS`
   - `FOLLOWERS`
   - `PUBLIC`
6. Se um `name_display_*` indicar `NICKNAME` ou `BOTH`, a resolução deve olhar para `persons.nickname`, não para `users`.
7. Se a resolução não conseguir usar `persons.nickname` por ausência de dado válido ou inconsistência transitória, o sistema cai para `NAME`.

## Relações

- `user_preferences.user_id -> users.id`
- resolução de nome depende de:
  - `users`
  - `persons`
  - relações sociais/contextuais que definem audiência

## Resolução de nome

### Regra estrutural

`user_preferences` não armazena o nome em si.

Ela armazena a política de exibição.

O nome efetivo deve ser resolvido usando:

- `users.display_name`
- `persons.nickname`

### Regras práticas

- `NAME`
  - usa `users.display_name`
  - se `users.display_name` ainda não existir em estado transitório, pode cair para `persons.nickname`
- `NICKNAME`
  - usa `persons.nickname`
  - se `persons.nickname` não puder ser resolvido, cai para `users.display_name`
- `BOTH`
  - combina `users.display_name` e `persons.nickname` conforme regra de apresentação da UI/banco
  - se um dos dois lados não puder ser resolvido, cai para o melhor rótulo simples disponível

### Observação importante

Com a arquitetura atual:

- `nickname` não pertence a `users`;
- `nickname` pertence a `persons`.

Logo, qualquer leitura antiga baseada em `users.nickname` deve ser considerada incorreta.

## Atualização por API

`PATCH /api/v1/me/preferences` pode atualizar parcialmente:

- `preferred_language_mode`
- `preferred_theme_id`
- `profile_visibility`
- `name_display_public`
- `name_display_followers`
- `name_display_team`
- `region_prompt_dismissed_at`

## O que não deve ficar em `user_preferences`

Não devem ficar aqui:

- `display_name`
  - pertence a `users`
- `nickname`
  - pertence a `persons`
- `username`
  - pertence a `users`
- região base da pessoa
  - pertence a `users`
- dados esportivos
  - pertencem a `players` e suas tabelas

## Dependências diretas desta tabela

Esta tabela conversa diretamente com:

- `users`
- `persons`
- `Identity_API`
- `Privacy_Settings`
- `Language_Settings`
- camada de privacidade do perfil

## Resumo estrutural

`user_preferences` define como a pessoa quer viver e se apresentar no app. Ela não guarda a identidade em si, mas regula como essa identidade será exibida e protegida.
