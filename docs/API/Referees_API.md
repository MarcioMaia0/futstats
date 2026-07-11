---
title: Referees API
status: Draft
version: 2.0.0
owner: Product Architecture
last_update: 2026-07-10
related_documents:
  - ../Domain/Referees.md
  - ../Implementation/API/Endpoint_Detail_Referees.md
  - ../Implementation/Database/Table_Spec_referees.md
  - ../Implementation/Database/Table_Spec_match_referees.md
  - ../Implementation/Database/Table_Spec_referee_reviews.md
---

# Referees API

## Objetivo

Definir a família de endpoints de arbitragem do FUTSTATS.

## Fronteira do agregado

Este recorte cobre:

- árbitro formal (`referees`);
- arbitragem efetiva da partida (`match_referees`);
- avaliação da atuação da arbitragem (`referee_reviews`).

Este recorte não cobre:

- criação geral da partida;
- placar;
- eventos;
- escalação.

## Rotas iniciais

```text
POST /api/v1/referees
GET /api/v1/referees/:referee_id
POST /api/v1/matches/:match_id/referees
PATCH /api/v1/matches/:match_id/referees/:match_referee_id
POST /api/v1/match-referees/:match_referee_id/reviews
PATCH /api/v1/match-referees/:match_referee_id/reviews/:review_id
GET /api/v1/referees/:referee_id/history
```

## Regras centrais

1. O uso casual nunca deve ser bloqueado por recurso avançado.
2. Árbitro formal é opcional.
3. A partida pode registrar:
   - árbitro formal;
   - árbitro ad-hoc por pessoa;
   - arbitragem externa não identificada.
4. Avaliação sempre pertence à atuação da arbitragem na partida.
5. Reputação é derivada, não editável manualmente.
6. Dados técnicos devem ser persistidos com nomenclatura em inglês.
7. Toda regra deve preservar a integridade histórica da partida.

## Regras de estrutura

- `referees`
  - cadastro mestre reutilizável;
- `match_referees`
  - quem apitou aquele jogo de fato;
- `referee_reviews`
  - opinião registrada sobre aquela atuação.

## Regras de competência e resenha

- `DIRECTOR`, `PRESIDENT` e `COACH`
  - contam para competência;
- `PLAYER` e `FAN`
  - entram como resenha social;
- somente árbitro formal com `referee_id`
  - pode consolidar competência oficial de longo prazo.

## Regras de quadro

Como `matches` já representa um quadro específico:

- primeiro quadro e segundo quadro já ficam separados naturalmente por `match_id`;
- não é necessário campo extra de quadro nos endpoints de arbitragem.

## Impactos

- Produto: define comportamento esperado para cadastro, uso casual e avaliação.
- UX: orienta fluxo simples primeiro e profundidade depois.
- Backend: orienta invariantes e validações transacionais.
- Database: orienta `referees`, `match_referees` e `referee_reviews`.
- API: orienta contratos estáveis e evolutivos.
- IA: fornece contexto preciso para implementação assistida.

## Critérios de aceite

- O recurso entrega valor sem exigir preenchimento excessivo.
- Casos simples e avançados estão contemplados.
- Há separação clara entre cadastro mestre, atuação da partida e avaliação.
- Há rastreabilidade quando a mudança impactar histórico.
