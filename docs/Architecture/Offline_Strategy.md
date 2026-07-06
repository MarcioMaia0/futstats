---
title: Offline Strategy
status: Draft
version: 0.9.0
owner: Product Architecture
last_update: 2026-07-06
---

# Offline Strategy

## Objetivo

Planejar uso em quadras com internet instável.

## Premissa

Jogos de várzea podem ocorrer em locais com conexão ruim. O app deve tolerar operações básicas offline no futuro.

## Escopo inicial

- Registrar placar localmente.
- Registrar gols pendentes.
- Sincronizar depois.
- Evitar duplicidade de eventos.

## Regras futuras

1. Cada evento local deve possuir `client_event_id`.
2. Sincronização deve ser idempotente.
3. Conflitos devem ser exibidos ao usuário.
4. Operações destrutivas offline devem ser limitadas.

## Objetivo

Documentar este aspecto do FUTSTATS como referência para produto, engenharia, design, QA e IA.

## Contexto

O FUTSTATS deve entregar valor imediato para o público casual e social, sem impedir que times mais maduros avancem para organização, inteligência esportiva e análise de performance.

## Regras centrais

1. O uso casual nunca deve ser bloqueado por recursos avançados.
2. Dados técnicos devem ser persistidos com nomenclatura em inglês.
3. A experiência exibida ao usuário pode variar por tema, linguagem e contexto.
4. Histórico e legado são consequências do uso recorrente, não barreiras de entrada.
5. Toda regra deve preservar a integridade histórica de partidas, atletas e times.

## Impactos

- Produto: define comportamento esperado e priorização.
- UX: orienta fluxos simples e progressivos.
- Backend: orienta serviços e invariantes.
- Database: orienta entidades, relacionamentos e auditoria.
- API: orienta contratos estáveis e evolutivos.
- IA: fornece contexto para implementação assistida.

## Critérios de aceite

- O recurso entrega valor sem exigir preenchimento excessivo.
- Casos simples e avançados estão contemplados.
- Há separação entre dado canônico e apresentação.
- Há rastreabilidade de decisões quando impactar histórico.
