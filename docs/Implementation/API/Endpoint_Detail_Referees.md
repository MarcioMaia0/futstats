---
title: Endpoint Detail Referees
status: Draft
version: 2.0.0
owner: Product Architecture
last_update: 2026-07-10
related_documents:
  - ../../API/Referees_API.md
  - ../Database/Table_Spec_referees.md
  - ../Database/Table_Spec_match_referees.md
  - ../Database/Table_Spec_referee_reviews.md
---

# Endpoint Detail Referees

## Objetivo

Detalhar os endpoints do domínio de arbitragem em nível operacional.

## Fronteira do recorte

Este conjunto de endpoints cobre:

- cadastro mestre de árbitros formais;
- vínculo da arbitragem a uma partida;
- avaliações da atuação da arbitragem;
- histórico consolidado de um árbitro formal.

Não cobre:

- criação geral da partida;
- escalação;
- eventos de jogo;
- reputação como campo editável manualmente.

## Endpoints

```http
POST /api/v1/referees
GET /api/v1/referees/{referee_id}
POST /api/v1/matches/{match_id}/referees
PATCH /api/v1/matches/{match_id}/referees/{match_referee_id}
POST /api/v1/match-referees/{match_referee_id}/reviews
PATCH /api/v1/match-referees/{match_referee_id}/reviews/{review_id}
GET /api/v1/referees/{referee_id}/history
```

## `POST /api/v1/referees`

### Objetivo

Criar um árbitro formal reutilizável.

### Request body

```json
{
  "person_id": "uuid",
  "phone": "+5511999999999",
  "referee_type": "OFFICIAL",
  "linked_user_id": "uuid",
  "notes": "Arbitra campeonatos da região"
}
```

### Regras

- `person_id` é obrigatório.
- `linked_user_id` é opcional.
- se `linked_user_id` existir, ele deve representar a mesma `person`.
- este endpoint não cria `match_referees`; ele só cria o cadastro mestre.

## `GET /api/v1/referees/{referee_id}`

### Objetivo

Ler o perfil formal do árbitro.

### Resposta esperada

```json
{
  "id": "uuid",
  "person_id": "uuid",
  "phone": "+5511999999999",
  "referee_type": "OFFICIAL",
  "linked_user_id": "uuid",
  "created_at": "2026-07-10T12:00:00Z",
  "updated_at": "2026-07-10T12:00:00Z"
}
```

## `POST /api/v1/matches/{match_id}/referees`

### Objetivo

Registrar a arbitragem efetiva da partida.

### Modos válidos

#### Árbitro formal

```json
{
  "referee_id": "uuid",
  "notes": "Escalado pela liga"
}
```

#### Árbitro ad-hoc por pessoa

```json
{
  "referee_person_id": "uuid",
  "notes": "Juiz conhecido do bairro"
}
```

#### Arbitragem externa não identificada

```json
{
  "external": true,
  "notes": "Arbitragem trazida pelo adversário"
}
```

### Regras

- os três modos são mutuamente exclusivos;
- deve existir no máximo uma arbitragem principal por `match_id`;
- este endpoint atua sobre `match_referees`, não sobre `referees`.

## `PATCH /api/v1/matches/{match_id}/referees/{match_referee_id}`

### Objetivo

Corrigir ou substituir a arbitragem registrada naquela partida.

### Regras

- deve respeitar os mesmos três modos de identificação;
- não deve quebrar histórico de avaliações já existentes sem política explícita;
- se houver avaliações, a alteração precisa preservar coerência entre `match_referee_id` e `referee_reviews`.

## `POST /api/v1/match-referees/{match_referee_id}/reviews`

### Objetivo

Registrar uma avaliação sobre a atuação da arbitragem naquela partida.

### Request body

```json
{
  "match_id": "uuid",
  "rater_role": "DIRECTOR",
  "score": 7.5,
  "description": "Conduziu bem o jogo, mas demorou para controlar as faltas."
}
```

### Regras

- `rater_user_id` vem da autenticação.
- `counts_for_competence` é derivado do `rater_role`, não enviado pelo cliente.
- uma avaliação por `match_referee_id + rater_user_id`.
- se `match_referees.referee_id` existir, a review pode alimentar competência consolidada.
- se a arbitragem for ad-hoc ou externa, a review existe como resenha contextual, sem competência formal consolidada.

## `PATCH /api/v1/match-referees/{match_referee_id}/reviews/{review_id}`

### Objetivo

Permitir ajuste da avaliação pelo mesmo avaliador ou por fluxo administrativo autorizado.

### Campos ajustáveis

- `score`
- `description`
- `rater_role` somente se a política de negócio permitir correção contextual

### Regras

- `counts_for_competence` deve ser recalculado pelo backend quando `rater_role` mudar.

## `GET /api/v1/referees/{referee_id}/history`

### Objetivo

Ler histórico consolidado de um árbitro formal.

### Deve poder retornar

- quantidade de partidas com esse árbitro;
- notas recebidas;
- média social;
- média que conta para competência;
- distribuição por tipo de avaliador;
- partidas recentes.

## Regras transversais

- árbitro é opcional no fluxo da partida;
- avaliação pertence à atuação da arbitragem na partida;
- como `matches` já representa um quadro específico, primeiro e segundo quadro já ficam naturalmente separados por `match_id`;
- reputação é derivada, não editável manualmente;
- recursos avançados não podem bloquear o uso casual.

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
5. sugerir migrations, testes e validações transacionais quando alterar o domínio.
