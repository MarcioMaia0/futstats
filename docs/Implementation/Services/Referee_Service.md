---
title: Referee Service
status: Draft
version: 2.0.0
owner: Product Architecture
last_update: 2026-07-10
related_documents:
  - ../../API/Referees_API.md
  - ../API/Endpoint_Detail_Referees.md
  - ../Database/Table_Spec_referees.md
  - ../Database/Table_Spec_match_referees.md
  - ../Database/Table_Spec_referee_reviews.md
---

# Referee Service

## Objetivo

Especificar o serviço de aplicação responsável pelo domínio de arbitragem.

## Responsabilidades

- cadastrar árbitro formal;
- promover pessoa para árbitro formal quando fizer sentido;
- vincular arbitragem à partida;
- aceitar arbitragem ad-hoc por pessoa;
- aceitar arbitragem externa não identificada;
- receber avaliações;
- recalcular flags de competência;
- expor histórico consolidado por árbitro formal.

## Regras estruturais

- `referees`
  - é cadastro mestre;
- `match_referees`
  - é atuação concreta da arbitragem na partida;
- `referee_reviews`
  - é avaliação daquela atuação.

## Comandos principais

- `CreateReferee`
- `UpdateReferee`
- `SetMatchReferee`
- `ReplaceMatchReferee`
- `CreateRefereeReview`
- `UpdateRefereeReview`
- `GetRefereeHistory`

## Leituras principais

- `GetRefereeById`
- `GetMatchRefereeByMatchId`
- `GetRefereeReviewSummary`
- `GetRefereeHistory`

## Invariantes centrais

1. Árbitro é opcional na partida.
2. Uma partida tem no máximo uma arbitragem principal no estado atual.
3. `match_referees` aceita exatamente um modo:
   - `referee_id`;
   - `referee_person_id`;
   - `external = true`.
4. Avaliação pertence à atuação da arbitragem na partida.
5. Reputação é derivada, não editável manualmente.
6. Como `matches` já representa um quadro específico, avaliações de primeiro e segundo quadro já ficam separadas por `match_id`.

## Responsabilidade por comando

### `CreateReferee`

- valida `person_id`;
- opcionalmente valida `linked_user_id`;
- garante coerência entre `referees.person_id` e `users.person_id`;
- cria o cadastro mestre.

### `SetMatchReferee`

- valida se a partida existe;
- valida os três modos exclusivos de identificação;
- impede segunda arbitragem principal ativa para a mesma partida;
- persiste em `match_referees`.

### `ReplaceMatchReferee`

- atualiza a arbitragem daquela partida;
- reaplica validações dos modos exclusivos;
- protege coerência com avaliações existentes.

### `CreateRefereeReview`

- valida `match_id`, `match_referee_id` e `rater_user_id`;
- deriva `counts_for_competence` a partir de `rater_role`;
- garante unicidade por `match_referee_id + rater_user_id`;
- preenche `referee_id` somente quando a arbitragem da partida estiver ligada a árbitro formal.

### `UpdateRefereeReview`

- permite correção de `score` e `description`;
- se `rater_role` puder mudar por regra de negócio, recalcula `counts_for_competence`;
- mantém coerência com `match_referee_id`.

### `GetRefereeHistory`

- consolida partidas apitadas;
- agrega avaliações sociais;
- agrega avaliações que contam para competência;
- retorna histórico recente e indicadores resumidos.

## Regras de competência

- `DIRECTOR`, `PRESIDENT` e `COACH`
  - `counts_for_competence = true`
- `PLAYER` e `FAN`
  - `counts_for_competence = false`

Essa regra:

- não deve depender do cliente;
- deve ser aplicada no backend.

## Regras de consistência

### Coerência entre `referees` e `users`

Se houver `linked_user_id`:

- o serviço deve validar que ele representa a mesma `person`.

### Coerência entre `match_referees` e `referee_reviews`

O serviço deve validar que:

- a review pertence ao mesmo `match_id`;
- se a arbitragem da partida tiver `referee_id`, a review deve refletir esse mesmo `referee_id`;
- se a arbitragem da partida não tiver `referee_id`, a review não pode inventar um.

### Coerência com uso casual

O serviço não deve exigir:

- cadastro mestre de árbitro;
- telefone;
- conta do árbitro;
- avaliação obrigatória.

## Saídas analíticas esperadas

O serviço deve permitir derivar:

- total de jogos com determinado árbitro formal;
- média geral de avaliações;
- média de competência;
- distribuição por tipo de avaliador;
- histórico recente;
- partidas com arbitragem externa;
- partidas com árbitro ad-hoc.

## Critérios de qualidade

- O fluxo deve funcionar para usuário casual sem exigir cadastro excessivo.
- Recursos avançados devem ser progressivos e opcionais.
- O comportamento deve preservar consistência entre frontend, backend, API e banco.
- Todas as entidades técnicas, payloads, enums e nomes internos devem usar inglês.
- Textos exibidos ao usuário devem passar por camada de linguagem/configuração.

## Regras para IA

Ao usar este documento como contexto para implementação, a IA deve:

1. preservar o princípio de uso casual simples;
2. não criar campos obrigatórios que bloqueiem o primeiro valor operacional;
3. respeitar a separação entre `referees`, `match_referees` e `referee_reviews`;
4. manter compatibilidade com evolução futura;
5. sugerir testes de validação transacional para os três modos de arbitragem e para o cálculo de `counts_for_competence`.
