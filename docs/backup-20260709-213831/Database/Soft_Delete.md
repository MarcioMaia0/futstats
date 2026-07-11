---
title: Soft Delete Strategy
status: Draft
version: 0.9.0
owner: Product Architecture
last_update: 2026-07-06
---

# Soft Delete Strategy

## Objetivo

Definir exclusão lógica.

## Regras

1. Entidades históricas não devem ser apagadas fisicamente sem critério.
2. Partidas finalizadas devem preservar integridade.
3. Usuários podem ser anonimizados quando necessário.
4. Conteúdo social pode ser removido da exibição sem apagar trilha de auditoria.


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
