---
title: Table Spec accounts
status: Draft
version: 2.0.0
owner: Product Architecture
last_update: 2026-07-10
related_documents:
  - ../../ADR/ADR_012_Identity_On_Supabase_Auth.md
  - ../../ADR/ADR_004_Account_User_Player_Separation.md
  - ../../API/Auth_API.md
  - ../../Domain/Identity.md
  - Table_Spec_persons.md
  - Table_Spec_users.md
---

# Table Spec accounts

## Objetivo

Documentar a camada `conta de autenticação (accounts)` do FUTSTATS em nível técnico.

## Decisão de modelagem

Não existe tabela `accounts` própria no schema `public`.

A camada conceitual `accounts` é implementada por estruturas nativas do Supabase Auth:

- `auth.users`
- `auth.identities`

Logo:

- `accounts` é conceito de domínio;
- `auth.users` é a materialização principal da conta;
- `auth.identities` complementa os provedores e identidades externas vinculadas.

## Escopo

Esta camada existe para resolver:

- autenticação;
- login por e-mail e senha;
- login social;
- login por telefone;
- confirmação de e-mail;
- confirmação de telefone;
- recuperação de acesso;
- vínculo entre provedores.

Esta camada não existe para guardar:

- nome público no app;
- apelido canônico da pessoa;
- preferências do produto;
- papel em time;
- identidade esportiva;
- histórico esportivo.

## Responsabilidade no fluxo da primeira entrada

No primeiro acesso válido ao produto:

1. nasce ou é vinculada a conta em `auth.users`;
2. o domínio cria ou vincula a `pessoa canônica (persons)`;
3. o domínio cria a `presença na plataforma (public.users)`;
4. a `identidade esportiva (players)` só nasce se algum fluxo esportivo exigir.

## Observação estrutural importante

`auth.users` não é uma tabela comum criada livremente pela aplicação.

Ela é:

- criada e mantida pelo Supabase;
- dependente do comportamento do Supabase Auth;
- parcialmente configurável, mas não modelada do zero como uma tabela `public`.

Portanto, este documento deve ser lido como:

- contrato técnico de uso;
- contrato de integração com o restante do banco;
- contrato de dependência da aplicação.

Não deve ser lido como:

- instrução para recriar manualmente o schema interno do Supabase Auth.

## Estruturas físicas relevantes

## Tabela principal: `auth.users`

### Natureza

- schema: `auth`
- ownership: Supabase
- criação física: Supabase Auth
- escrita direta pela aplicação: não recomendada fora das APIs/controladores de auth

## Colunas principais de interesse do produto

As colunas abaixo são as que o domínio do FUTSTATS considera canônicas para integração.

### `id`

- tipo físico esperado: `uuid`
- nulidade: `not null`
- origem: Supabase
- finalidade:
  - identificador técnico da conta;
  - chave de ligação 1:1 com `public.users.id`.

### `email`

- tipo físico esperado: `text`
- nulidade: `nullable`
- finalidade:
  - credencial de login por e-mail;
  - base para confirmação de e-mail;
  - base para account linking quando vier de provider com e-mail verificado.

### `phone`

- tipo físico esperado: `text`
- nulidade: `nullable`
- finalidade:
  - credencial de login por telefone;
  - base para autenticação OTP.

### `encrypted_password`

- tipo físico esperado: `text`
- nulidade: `nullable`
- finalidade:
  - hash da senha para contas com provider `EMAIL`.

### `email_confirmed_at`

- tipo físico esperado: `timestamptz`
- nulidade: `nullable`
- finalidade:
  - registrar prova de posse do e-mail;
  - apoiar regra de lembrete de confirmação;
  - apoiar regra de account linking seguro.

### `phone_confirmed_at`

- tipo físico esperado: `timestamptz`
- nulidade: `nullable`
- finalidade:
  - registrar prova de posse do telefone;
  - marcar conclusão válida do fluxo OTP.

### `last_sign_in_at`

- tipo físico esperado: `timestamptz`
- nulidade: `nullable`
- finalidade:
  - trilha operacional do último login.

### `created_at`

- tipo físico esperado: `timestamptz`
- nulidade: `not null`
- default esperado: controlado pelo Supabase
- finalidade:
  - instante de criação da conta.

### `updated_at`

- tipo físico esperado: `timestamptz`
- nulidade: variável conforme implementação do provider
- finalidade:
  - trilha técnica de atualização da conta.

## Estrutura complementar: `auth.identities`

### Natureza

- schema: `auth`
- ownership: Supabase
- criação física: Supabase Auth

### Finalidade para o FUTSTATS

Permitir:

- distinguir provedores vinculados à conta;
- saber se a conta está associada a `GOOGLE`, `APPLE`, `EMAIL` ou `PHONE`;
- suportar account linking seguro;
- evitar duplicação de contas.

### Campos conceitualmente relevantes

Os nomes exatos podem seguir a implementação do Supabase, mas o domínio depende destas informações:

- `user_id`
  - aponta para `auth.users.id`.
- `provider`
  - identifica o provedor vinculado.
- `identity_data`
  - metadados recebidos do provedor, quando existirem.
- timestamps técnicos
  - criação e atualização da identidade vinculada.

## Enum canônico do domínio

### `provedor de autenticação (auth_provider)`

- `EMAIL`
- `GOOGLE`
- `APPLE`
- `PHONE`

## Regras do enum

- WhatsApp não é `auth_provider`.
- WhatsApp é canal do fluxo `PHONE`.
- O enum pertence ao domínio/API, mesmo que o Supabase internamente modele providers de outra forma.

## Constraints e índices relevantes

## Em `auth.users`

Como a tabela é gerida pelo Supabase, os detalhes físicos exatos devem respeitar a implementação oficial do provider.

Para o domínio do FUTSTATS, assumimos como obrigatórias as seguintes garantias lógicas:

- PK em `auth.users.id`
- índice de busca por `email`
- índice de busca por `phone`
- unicidade efetiva por credencial autenticável, conforme política do Supabase

## Em `public.users`

A aplicação deve impor a dependência:

- PK/FK `public.users.id -> auth.users.id`

Comportamento esperado:

- `on update cascade`
- `on delete restrict` ou política equivalente que impeça perda acidental do histórico via cascata física

Justificativa:

- a exclusão/desativação de conta não deve apagar automaticamente a presença de domínio sem decisão explícita;
- o produto precisa preservar histórico esportivo e identidade da pessoa.

## Regras de nulidade por tipo de login

### Conta criada por e-mail e senha

- `email`: obrigatório
- `encrypted_password`: obrigatório
- `email_confirmed_at`: pode nascer nulo
- `phone`: opcional

### Conta criada por login social

- `email`: preferencialmente preenchido quando provider fornecer
- `encrypted_password`: normalmente nulo
- `email_confirmed_at`: pode nascer preenchido conforme provider
- `phone`: normalmente nulo

### Conta criada por telefone

- `phone`: obrigatório
- `phone_confirmed_at`: obrigatório ao final da verificação válida
- `email`: opcional
- `encrypted_password`: nulo, salvo fluxo futuro que adicione senha depois

## Regras de escrita

- A aplicação não deve tratar `auth.users` como tabela de negócio comum.
- Criação, confirmação, vinculação e recuperação devem acontecer via camada de auth.
- A aplicação pode ler `auth.users` para compor o estado consolidado de identidade.
- A aplicação não deve guardar em `auth.users` dados que pertencem a `persons` ou `public.users`.

## O que não pode ficar em `auth.users`

Os campos abaixo pertencem a outras camadas:

- `terms_accepted_at`
  - fica em `public.users`
- `username`
  - fica em `public.users`
- `display_name`
  - fica em `public.users`
- `avatar_url`
  - fica em `public.users`
- `contact_phone`
  - fica em `public.users`
- `region_state`
  - fica em `public.users`
- `region_city`
  - fica em `public.users`
- `region_zone`
  - fica em `public.users`
- `full_name`
  - fica em `persons`
- `nickname`
  - fica em `persons`
- identidade esportiva
  - fica em `players` e tabelas derivadas

## Relações com as tabelas seguintes

## Relação com `persons`

Tipo:

- relação lógica obrigatória no fluxo final de conta válida

Regra:

- não deve existir conta pronta para uso normal no domínio sem `person` vinculada.

Observação:

- a ligação física entre `auth.users` e `persons` acontece indiretamente por `public.users.person_id`.

## Relação com `public.users`

Tipo:

- 1:1 obrigatório

Regra física esperada:

- `public.users.id = auth.users.id`

Impacto:

- qualquer fluxo que crie conta e não crie `public.users` deixa a identidade quebrada para o produto.

## Relação com `players`

Tipo:

- nenhuma relação física direta obrigatória

Regra:

- conta não implica atleta;
- atleta não implica conta;
- a ponte correta é:
  - `auth.users`
  - `public.users`
  - `persons`
  - `players`

## Regras do primeiro acesso

## 1. Cadastro com e-mail e senha

Ao concluir com sucesso:

- criar conta em `auth.users`;
- criar `persons`;
- criar `public.users`;
- não criar `players` automaticamente.

## 2. Primeiro login social

Ao concluir com sucesso:

- criar ou localizar conta em `auth.users`;
- criar `persons` se necessário;
- criar `public.users` se necessário;
- avaliar necessidade de `Complete Profile`.

## 3. Primeiro login por telefone

Ao concluir com sucesso:

- criar ou localizar conta em `auth.users`;
- criar ou localizar `persons`;
- criar ou localizar `public.users`;
- avaliar necessidade de `Complete Profile`;
- não criar `players` automaticamente.

## Regras de account linking

### Caso permitido automaticamente

Se `GOOGLE` ou `APPLE` retornar e-mail verificado igual ao de conta já existente:

- vincular automaticamente à conta existente.

### Caso que exige prova adicional

Se surgir novo fluxo por e-mail/senha com e-mail ainda não verificado que coincida com conta existente:

- não vincular automaticamente;
- exigir confirmação de e-mail antes de consolidar.

## Regras de exclusão, desativação e preservação histórica

- exclusão da conta não deve significar destruição automática da pessoa;
- exclusão da conta não deve significar destruição automática do atleta;
- exclusão da conta não deve apagar histórico esportivo.

Logo:

- a estratégia de remoção da conta precisa ser compatível com preservação de:
  - `persons`
  - `players`
  - fatos esportivos
  - vínculos históricos relevantes

## Dependências que consultam esta camada

As próximas tabelas e fluxos dependem diretamente deste contrato:

- `public.users`
- `persons`
- `Auth_API`
- `GET /api/v1/me`
- `Complete Profile`
- `PATCH /api/v1/me`
- fluxos de account linking
- auditoria de autenticação

## Riscos de alteração futura

Alterar a forma como `auth.users` se integra ao domínio impacta em cascata:

- bootstrap de sessão;
- onboarding;
- vínculo com `public.users`;
- vínculo com `persons`;
- login social;
- login por telefone;
- recuperação de conta;
- estratégias de merge e claim que dependem da identidade da pessoa.

Por isso:

- qualquer mudança nesta camada deve ser tratada como mudança arquitetural, não apenas ajuste local.
