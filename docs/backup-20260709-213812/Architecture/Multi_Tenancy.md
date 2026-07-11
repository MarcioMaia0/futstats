---
title: Multi Tenancy Strategy
status: Draft
version: 0.9.0
owner: Product Architecture
last_update: 2026-07-06
---

# Multi Tenancy Strategy

## Objetivo

Definir como múltiplos times, usuários e contextos coexistem no FUTSTATS.

## Decisão

O FUTSTATS deve usar separação lógica por time e por contexto de permissão. Um usuário pode participar de vários times com papéis diferentes.

## Regras

1. Toda entidade sensível deve possuir contexto de acesso.
2. Partidas pertencem a um time proprietário.
3. Adversários locais são privados por time até eventual verificação.
4. Permissões são avaliadas por time.
5. Dados públicos dependem de configuração de privacidade.

## Riscos

- Vazamento de dados entre times.
- Usuário editar time onde não tem permissão.
- Conteúdo privado aparecendo no feed público.

## Mitigação

- Authorization service centralizado.
- Testes de isolamento.
- Claims por papel e time.

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
