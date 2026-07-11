---
title: Table Spec match_operator_assignments
status: Draft
version: 2.0.0
owner: Product Architecture
last_update: 2026-07-10
related_documents:
  - Table_Spec_matches.md
  - Table_Spec_match_events.md
  - Table_Spec_match_substitutions.md
  - Table_Spec_match_goals.md
  - Table_Spec_users.md
  - ../../Domain/Matches.md
  - ../../API/Matches_API.md
  - ../../Implementation/Match_Operation_Technical_Contract.md
  - ../../Implementation/Services/Match_Service_Spec.md
---

# Table Spec match_operator_assignments

## Objetivo

Documentar `responsabilidades operacionais da partida (match_operator_assignments)` em nível técnico.

## Finalidade

`match_operator_assignments` representa quais usuários autenticados estão autorizados a operar quais partes da superfície da partida.

Ela existe para sustentar:

- operação colaborativa ao vivo;
- separação de responsabilidades por métrica ou área;
- controle do operador do cronômetro mestre;
- bloqueio de ações concorrentes indevidas;
- revisão posterior com escopo ampliado;
- auditoria leve de quem estava responsável por cada recorte.

## O que `match_operator_assignments` é

- autorização contextual por partida;
- distribuição operacional de responsabilidades;
- camada de governança leve da operação ao vivo e da revisão.

## O que `match_operator_assignments` não é

- não é permissão global do sistema;
- não é papel do time;
- não é vínculo com o elenco;
- não é heartbeat do cronômetro;
- não é telemetria de conectividade;
- não é evento da partida.

## Responsabilidade na cadeia do domínio

No fluxo correto:

1. a partida operacional existe em `matches`;
2. um ou mais usuários entram para operar;
3. o time define quem pode mexer em cada escopo;
4. a UI respeita esses escopos;
5. o backend valida esses escopos;
6. heartbeat, sincronização e janela cega continuam em camada operacional transitória, fora do banco principal.

Logo:

- autorização contextual pertence a `match_operator_assignments`;
- fatos do jogo pertencem a `match_events`, `match_goals` e `match_substitutions`;
- sincronização fina do cronômetro pertence ao contrato operacional transitório.

## Quando nasce

`match_operator_assignments` pode nascer quando:

1. um diretor configura a equipe de operação antes do jogo;
2. a operação ao vivo começa e o time distribui responsabilidades;
3. um usuário adicional entra para ajudar durante a partida;
4. a revisão por vídeo precisa conceder escopo ampliado a alguém.

## Quem grava

`match_operator_assignments` é gravada pela aplicação.

Casos de uso relevantes:

- `AssignMatchOperatorScope`
- `ReassignMatchOperatorScope`
- `RevokeMatchOperatorScope`
- `GrantFullReviewScope`

## Estrutura física sugerida

- schema: `public`
- nome da tabela: `match_operator_assignments`

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
  - apontar a qual partida operacional a atribuição pertence.

### `user_id`

- tipo físico: `uuid`
- nulidade: `not null`
- FK: `users.id`
- `on update`: `cascade`
- `on delete`: `restrict`
- finalidade:
  - identificar qual usuário autenticado recebeu aquela responsabilidade.

### `scope`

- tipo físico: `match_operator_scope`
- nulidade: `not null`
- finalidade:
  - indicar qual área operacional aquele usuário pode controlar.

### `is_exclusive`

- tipo físico: `boolean`
- nulidade: `not null`
- default sugerido: `true`
- finalidade:
  - registrar se aquele escopo deve ficar reservado a um único operador ativo por partida.

### `created_by_user_id`

- tipo físico: `uuid`
- nulidade: `nullable`
- FK: `users.id`
- `on update`: `cascade`
- `on delete`: `set null`
- finalidade:
  - registrar quem concedeu aquela responsabilidade.

### `notes`

- tipo físico: `text`
- nulidade: `nullable`
- finalidade:
  - observações rápidas sobre a atribuição, quando fizer sentido.

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

### `revoked_at`

- tipo físico: `timestamptz`
- nulidade: `nullable`
- finalidade:
  - marcar desativação lógica da atribuição.

### `revoked_by_user_id`

- tipo físico: `uuid`
- nulidade: `nullable`
- FK: `users.id`
- `on update`: `cascade`
- `on delete`: `set null`
- finalidade:
  - registrar quem removeu a atribuição, quando houve ação humana.

### `revoked_reason`

- tipo físico: `text`
- nulidade: `nullable`
- finalidade:
  - descrever por que a atribuição foi removida ou substituída.

## Enums físicos

### `match_operator_scope`

- `CLOCK`
- `SCOREBOARD`
- `LINEUP`
- `SUBSTITUTION`
- `SHOT_EVENTS`
- `PASS_EVENTS`
- `FOUL_EVENTS`
- `DEFENSIVE_EVENTS`
- `FULL_REVIEW`

## Regras dos enums

### `CLOCK`

- controla `play`, `pause`, `resume` e `stop` do cronômetro oficial daquele quadro;
- deve operar em conjunto com a noção de aparelho mestre do contrato transitório.

### `SCOREBOARD`

- controla edição de placar e atalhos sensíveis diretamente ligados a ele.

### `LINEUP`

- controla relacionados, titulares e estrutura base da escalação.

### `SUBSTITUTION`

- controla trocas durante a partida.

### `SHOT_EVENTS`

- controla registro de finalizações e fluxos derivados.

### `PASS_EVENTS`

- controla registro de passes e fluxos derivados.

### `FOUL_EVENTS`

- controla registro de faltas e fluxos derivados.

### `DEFENSIVE_EVENTS`

- controla ações defensivas, como desarme, bloqueio, defesa e correlatos.

### `FULL_REVIEW`

- concede leitura e edição ampliadas na revisão por vídeo ou pós-jogo, respeitando a permissão geral do usuário na partida.

## Constraints sugeridas

## Primary key

- `pk_match_operator_assignments`
  - colunas: `id`

## Foreign keys

- `fk_match_operator_assignments_match`
  - coluna: `match_id`
  - referência: `matches.id`
  - `on update cascade`
  - `on delete restrict`

- `fk_match_operator_assignments_user`
  - coluna: `user_id`
  - referência: `users.id`
  - `on update cascade`
  - `on delete restrict`

- `fk_match_operator_assignments_created_by_user`
  - coluna: `created_by_user_id`
  - referência: `users.id`
  - `on update cascade`
  - `on delete set null`

- `fk_match_operator_assignments_revoked_by_user`
  - coluna: `revoked_by_user_id`
  - referência: `users.id`
  - `on update cascade`
  - `on delete set null`

## Check constraints sugeridas

- `ck_match_operator_assignments_notes_not_blank_when_present`
  - se `notes is not null`, então `btrim(notes) <> ''`

- `ck_match_operator_assignments_revoked_reason_not_blank_when_present`
  - se `revoked_reason is not null`, então `btrim(revoked_reason) <> ''`

- `ck_match_operator_assignments_revoked_at_after_created_at`
  - se `revoked_at is not null`, então `revoked_at >= created_at`

- `ck_match_operator_assignments_revoked_by_presence`
  - se `revoked_at is null`, então `revoked_by_user_id is null`

## Unicidade

Deve existir no máximo uma atribuição ativa por:

- `match_id + user_id + scope`

Nome sugerido:

- `uq_match_operator_assignments_active_match_user_scope`

Implementação sugerida:

- índice único parcial com condição `revoked_at is null`

## Exclusividade por escopo

Quando `is_exclusive = true`, deve existir no máximo uma atribuição ativa por:

- `match_id + scope`

Nome sugerido:

- `uq_match_operator_assignments_active_exclusive_scope`

Implementação sugerida:

- índice único parcial sobre (`match_id`, `scope`) com condição:
  - `revoked_at is null`
  - `is_exclusive = true`

## Índices sugeridos

- `idx_match_operator_assignments_match_id`
  - colunas: `match_id`
  - finalidade:
    - listar responsabilidades da partida.

- `idx_match_operator_assignments_user_id`
  - colunas: `user_id`
  - finalidade:
    - descobrir em quais partidas o usuário está operando.

- `idx_match_operator_assignments_scope`
  - colunas: `scope`
  - finalidade:
    - filtrar por tipo de responsabilidade.

- `idx_match_operator_assignments_active_match`
  - colunas: `match_id`
  - condição: `revoked_at is null`
  - finalidade:
    - carregar rapidamente a matriz ativa de operação.

## Regras de negócio centrais

1. A tabela só faz sentido para usuários autenticados.
2. A tabela não substitui permissões globais do produto.
3. O backend deve validar escopo, não apenas a UI.
4. `CLOCK` deve ser exclusivo por padrão.
5. Escopos podem ser exclusivos ou compartilhados, conforme a configuração da atribuição.
6. `FULL_REVIEW` é um escopo diferente da operação ao vivo.
7. Linha revogada não deve ser reativada; nova atribuição gera nova linha.

## Regras de consistência contextual

### Coerência com a partida

O backend deve validar que:

- a `match` existe;
- a `match` ainda aceita esse tipo de operação no estado atual;
- o usuário tem permissão geral para operar aquela partida pelo time.

### Coerência com o quadro

Como `matches` já representa um quadro específico:

- `match_operator_assignments` não precisa de `frame_type`;
- a responsabilidade já nasce contextualizada ao quadro daquela `match`.

Se no futuro existir uma entidade operacional acima do quadro:

- isso deve nascer em outro agregado, não forçando inconsistência aqui.

### Coerência com cronômetro mestre

Ter `scope = CLOCK` não significa guardar heartbeat nesta tabela.

Significa apenas:

- qual usuário está autorizado a comandar o cronômetro;
- qual usuário a UI deve tratar como operador principal daquele controle.

O aparelho mestre e os heartbeats continuam no contrato transitório de sincronização.

## Relações com outras tabelas

## Relação com `matches`

- tipo: `N -> 1`
- chave: `match_operator_assignments.match_id -> matches.id`
- regra:
  - cada atribuição pertence a uma partida operacional específica.

## Relação com `users`

- tipo: `N -> 1`
- chave: `match_operator_assignments.user_id -> users.id`
- regra:
  - apenas usuário autenticado pode receber escopo operacional.

## Relação indireta com `match_events`

- a tabela não grava eventos;
- ela governa quem pode operar certos fluxos que acabam gerando `match_events`.

## Relação indireta com `match_substitutions`

- a tabela não grava substituições;
- ela governa quem pode acionar o fluxo que persiste `match_substitutions`.

## Relação indireta com `match_goals`

- a tabela pode governar quem usa atalhos de placar e gol rápido;
- o dado factual continua nas tabelas de gols e eventos.

## Regras operacionais por fluxo

### Operação ao vivo colaborativa

Fluxo:

- um usuário fica com o cronômetro;
- outro com chutes e gols;
- outro com faltas e defesa;
- todos operam ao mesmo tempo;
- o backend impede que alguém fora do escopo faça ação não autorizada.

### Reatribuição durante o jogo

Fluxo:

- o operador sai, troca de aparelho ou perde contexto;
- um gestor revoga a atribuição ativa;
- nova linha é criada para o novo operador.

### Revisão por vídeo

Fluxo:

- a partida foi encerrada operacionalmente;
- alguém entra para revisar dados;
- pode receber `FULL_REVIEW`, sem depender de estar com escopos finos da operação ao vivo.

## O que não deve ficar em `match_operator_assignments`

Não devem ficar aqui:

- heartbeat do cronômetro;
- estado detalhado de sincronização;
- janela cega;
- evento da partida;
- decisão estatística final.

Esses dados pertencem, respectivamente, a:

- contrato transitório `clock_heartbeat`
- contrato transitório `clock_sync_state`
- contrato transitório `blind_window`
- `match_events`
- camadas derivadas e de revisão

## Dependências diretas desta tabela

Esta tabela conversa diretamente com:

- `matches`
- `users`
- `match_events`
- `match_goals`
- `match_substitutions`
- `Matches_API`
- `MatchOperationService`

## Riscos de alteração futura

Mudanças em:

- enum `match_operator_scope`;
- política de exclusividade;
- semântica de `FULL_REVIEW`;
- fronteira entre autorização persistida e sincronização transitória

impactam em cascata:

- UI operacional ao vivo;
- revisão por vídeo;
- backend de autorização contextual;
- tolerância a operação simultânea;
- experiência colaborativa de registro.

## Resumo estrutural

`match_operator_assignments` é a tabela que organiza quem pode fazer o quê dentro da operação da partida. Ela não guarda os fatos do jogo nem a telemetria do cronômetro; ela guarda a distribuição formal de responsabilidade para que a operação colaborativa seja segura, coerente e auditável.
