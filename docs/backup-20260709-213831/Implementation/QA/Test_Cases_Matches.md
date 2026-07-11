---
title: Test Cases Matches
status: Draft
version: 1.0.0
owner: Product Architecture
last_update: 2026-07-09
---

# Test Cases Matches

## Objetivo

Listar testes de partida.

## Testes

- Criar partida minima.
- Criar partida avancada.
- Atualizar placar.
- Adicionar gol.
- Remover gol.
- Finalizar partida.
- Cancelar partida.
- Vincular quadros.
- Editar apos finalizacao com permissao.
- Recalcular estatisticas.
- Consolidar tempo canonico de evento com pequeno drift.
- Barrar ou revisar evento depois do encerramento do periodo.
- Resolver ordem canonica de eventos muito proximos.
- Marcar baixa confianca temporal apos janela cega longa.
- Permitir correcao manual por revisao de video.
- Impedir ajuste automatico que atravesse `PERIOD_END`.
- Aceitar dois eventos no mesmo segundo com `event_order` coerente.
- Marcar para revisao sequencia improvavel logo apos `GOAL`.

## Criterios de qualidade

- O fluxo deve funcionar para usuario casual sem exigir cadastro excessivo.
- Recursos avancados devem ser progressivos e opcionais.
- O comportamento deve preservar consistencia entre frontend, backend, API e banco.
- Todas as entidades tecnicas, payloads, enums e nomes internos devem usar ingles.
- Textos exibidos ao usuario devem passar por camada de linguagem/configuracao.

## Regras para IA

Ao usar este documento como contexto para implementacao, a IA deve:
1. preservar o principio de uso casual simples;
2. nao criar campos obrigatorios que bloqueiem o MVP;
3. respeitar separacao entre dado canonico e texto de interface;
4. manter compatibilidade com evolucao futura;
5. sugerir migrations, testes e endpoints quando alterar dominio.
