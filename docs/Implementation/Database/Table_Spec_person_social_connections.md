---
title: Table Spec person_social_connections
status: Draft
version: 1.1.0
owner: Product Architecture
last_update: 2026-07-10
related_documents:
  - Table_Spec_persons.md
  - Table_Spec_team_social_connections.md
  - ../../API/Players_API.md
  - ../../Domain/Identity.md
  - ../../Frontend/Screens/Player_Profile.md
---

# Table Spec person_social_connections

## Objetivo

Especificar `conexoes sociais da pessoa (person_social_connections)` em nivel tecnico, seguindo o mesmo padrao estrutural de `team_social_connections` sempre que isso fizer sentido.

## Finalidade

`person_social_connections` representa as conexoes da pessoa canonica com plataformas sociais externas.

Ela existe para sustentar:

- links sociais no perfil publico da pessoa;
- exibicao de redes sociais no perfil do atleta;
- reutilizacao da mesma identidade social em contextos futuros de dirigente, comissao, tecnico e arbitragem;
- separacao correta entre identidade pessoal e identidade esportiva;
- compatibilidade estrutural com o modelo de redes sociais do time.

## O que `person_social_connections` e

- camada de redes sociais pertencente a `persons`;
- fonte canonica dos links sociais publicos da pessoa;
- leitura reaproveitavel por diferentes perfis derivados;
- espelho conceitual de `team_social_connections`, com dono diferente e regras especificas da pessoa.

## O que `person_social_connections` nao e

- nao e galeria de videos;
- nao e historico esportivo;
- nao e dado pertencente exclusivamente ao `player`;
- nao e, no estado atual do produto, camada de publicacao automatica em nome da pessoa.

## Responsabilidade no modelo

A regra central e:

- a rede social pertence a `person`;
- o perfil do atleta apenas consome essa leitura quando existir `player`;
- uma pessoa pode usar redes sociais no produto mesmo sem ter `player`.

## Quando nasce

`person_social_connections` pode nascer quando:

1. a pessoa edita seu proprio perfil;
2. o atleta completa ou edita seu perfil esportivo e informa redes sociais da pessoa;
3. um fluxo futuro de perfil publico pessoal permitir configuracao social dedicada.

## Quem grava

`person_social_connections` e gravada pela aplicacao.

Casos de uso relevantes:

- `UpdatePersonSocialConnections`
- `UpdatePlayerProfile`
- fluxos futuros de `UpdatePublicPersonProfile`

## Estrutura fisica sugerida

- schema: `public`
- nome da tabela: `person_social_connections`

## Colunas

### `id`

- tipo fisico: `uuid`
- nulidade: `not null`
- default sugerido: `gen_random_uuid()`
- PK: sim

### `person_id`

- tipo fisico: `uuid`
- nulidade: `not null`
- FK: `persons.id`
- `on update`: `cascade`
- `on delete`: `cascade`
- finalidade:
  - identificar a pessoa dona da conexao social.

### `platform`

- tipo fisico: `social_platform`
- nulidade: `not null`
- finalidade:
  - indicar a plataforma da rede social.

### `handle`

- tipo fisico: `text`
- nulidade: `nullable`
- finalidade:
  - armazenar o identificador publico curto, quando informado.

### `channel_url`

- tipo fisico: `text`
- nulidade: `nullable`
- finalidade:
  - armazenar a URL canonica publica do perfil ou canal.

### `connection_status`

- tipo fisico: `social_connection_status`
- nulidade: `not null`
- default sugerido: `PENDING`
- finalidade:
  - indicar o estado tecnico da conexao daquela rede social.

### `is_visible`

- tipo fisico: `boolean`
- nulidade: `not null`
- default sugerido: `true`
- finalidade:
  - controlar se a rede deve aparecer nas leituras publicas permitidas.

### `display_order`

- tipo fisico: `integer`
- nulidade: `not null`
- default sugerido: `0`
- finalidade:
  - permitir ordenacao consistente entre multiplas redes da mesma pessoa.

### `last_validated_at`

- tipo fisico: `timestamptz`
- nulidade: `nullable`
- finalidade:
  - registrar quando o formato daquela conexao foi validado pela ultima vez.

### `external_account_id`

- tipo fisico: `text`
- nulidade: `nullable`
- finalidade:
  - armazenar identificador externo da conta, quando existir conexao real com a plataforma.

### `access_token_ref`

- tipo fisico: `text`
- nulidade: `nullable`
- finalidade:
  - referencia segura para credencial armazenada fora da tabela principal.

### `refresh_token_ref`

- tipo fisico: `text`
- nulidade: `nullable`
- finalidade:
  - referencia segura para refresh token armazenado fora da tabela principal.

### `token_expires_at`

- tipo fisico: `timestamptz`
- nulidade: `nullable`
- finalidade:
  - registrar expiracao de credencial, quando o produto vier a usar conexao real com a plataforma.

### `created_by_user_id`

- tipo fisico: `uuid`
- nulidade: `nullable`
- FK: `users.id`
- `on update`: `cascade`
- `on delete`: `set null`
- finalidade:
  - registrar qual usuario autenticado cadastrou ou alterou inicialmente aquela conexao.

### `created_at`

- tipo fisico: `timestamptz`
- nulidade: `not null`
- default sugerido: `now()`

### `updated_at`

- tipo fisico: `timestamptz`
- nulidade: `not null`
- default sugerido: `now()`
- manutencao sugerida:
  - trigger de atualizacao automatica no update

## Enums fisicos

### `social_platform`

- `YOUTUBE`
- `INSTAGRAM`
- `TIKTOK`

### `social_connection_status`

- `PENDING`
- `CONNECTED`
- `EXPIRED`
- `REVOKED`
- `ERROR`

## Regras de preenchimento

### Regra minima

Cada linha precisa ter:

- `person_id`
- `platform`
- ao menos um entre `handle` ou `channel_url`

### Regra de normalizacao

- se vier apenas `handle`, o backend pode derivar `channel_url` quando a regra da plataforma for deterministicamente segura;
- se vier apenas `channel_url`, o backend pode extrair `handle` quando isso for confiavel;
- se vierem ambos, o backend deve preferir a URL como referencia canonica e validar coerencia entre os dois.

## Regras de visibilidade

- `is_visible = true` significa que a rede pode aparecer em leituras publicas permitidas;
- `is_visible = false` significa que a rede existe para a pessoa, mas nao deve ser exibida no perfil publico;
- regras de privacidade mais amplas do perfil ainda podem ocultar tudo, mesmo quando `is_visible = true`.

## Regras de conexao tecnica

- deve existir no maximo uma conexao por (`person_id`, `platform`) no estado atual do produto;
- `handle` e `channel_url` podem existir mesmo antes de qualquer conexao OAuth completa;
- `connection_status` existe para manter padrao estrutural com `team_social_connections`;
- no estado atual do produto, o principal uso desta tabela e identidade publica e visibilidade, nao publicacao automatica;
- se o produto evoluir para conexao real da conta da pessoa:
  - tokens nao devem ser persistidos em texto puro nesta tabela;
  - `access_token_ref` e `refresh_token_ref` devem apontar para armazenamento seguro;
  - `connection_status` deve refletir o estado tecnico real da conta conectada.

## Constraints sugeridas

## Primary key

- `pk_person_social_connections`
  - colunas: `id`

## Foreign key

- `fk_person_social_connections_person`
  - coluna: `person_id`
  - referencia: `persons.id`
  - `on update cascade`
  - `on delete cascade`

- `fk_person_social_connections_created_by_user`
  - coluna: `created_by_user_id`
  - referencia: `users.id`
  - `on update cascade`
  - `on delete set null`

## Unique

- `uq_person_social_connections_person_platform`
  - colunas: `person_id`, `platform`
  - regra:
    - no estado atual do produto, existe no maximo uma conexao por plataforma para cada pessoa.

## Check constraints

- `ck_person_social_connections_handle_or_channel_url_required`
  - garantir que ao menos um entre `handle` e `channel_url` esteja preenchido.

- `ck_person_social_connections_handle_not_blank_when_present`
  - se `handle is not null`, entao `btrim(handle) <> ''`

- `ck_person_social_connections_channel_url_not_blank_when_present`
  - se `channel_url is not null`, entao `btrim(channel_url) <> ''`

- `ck_person_social_connections_display_order_non_negative`
  - garantir `display_order >= 0`

## Indices sugeridos

- `idx_person_social_connections_person_id`
  - colunas: `person_id`
  - finalidade:
    - leitura das redes sociais da pessoa.

- `idx_person_social_connections_platform`
  - colunas: `platform`
  - finalidade:
    - apoio a filtros e validacoes por plataforma.

- `idx_person_social_connections_visible_order`
  - colunas: `person_id`, `is_visible`, `display_order`
  - finalidade:
    - leitura ordenada para o perfil publico.

## Relacoes com outras tabelas

## Relacao com `persons`

- tipo: `N -> 1`
- chave: `person_social_connections.person_id -> persons.id`
- regra:
  - uma pessoa pode ter zero ou varias redes sociais suportadas pelo produto;
  - cada plataforma aparece no maximo uma vez por pessoa no estado atual.

## Regras de negocio centrais

1. Rede social e da pessoa, nao do atleta.
2. O perfil do atleta pode ler essas redes por meio de `players.person_id`.
3. Pessoa sem `player` continua podendo ter redes sociais no produto.
4. `is_visible = true` e a regra atual minima para exibir a rede no perfil publico.
5. A galeria social do atleta continua sendo outro agregado e nao deve ser misturada com estes links.
6. `connection_status` nao torna a rede publica por si so; o que governa a exibicao atual e `is_visible`.

## O que nao deve ficar nesta tabela

Nao devem ficar aqui:

- tokens OAuth;
- preferencia de publicacao automatica por evento;
- videos, thumbnails ou embeds persistidos;
- estatisticas de visualizacao da plataforma;
- historico de posts.

Esses dados pertencem a outras camadas, quando existirem.

## Dependencias diretas desta tabela

Esta tabela conversa diretamente com:

- `persons`
- `players`, por leitura indireta via `person_id`
- perfil publico da pessoa, quando existir
- perfil do atleta
- padrao estrutural de `team_social_connections`

## Resumo estrutural

`person_social_connections` e a fonte canonica das redes sociais da pessoa no FUTSTATS. Ela segue o mesmo desenho-base de `team_social_connections`, mas com foco atual em identidade publica e visibilidade da pessoa, nao em publicacao automatica.
