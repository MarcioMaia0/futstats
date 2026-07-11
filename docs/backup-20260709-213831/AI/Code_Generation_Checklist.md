---
title: Code Generation Checklist
status: Approved
version: 1.0.0
owner: Product Architecture
last_update: 2026-07-06
related_documents:
  - AI/AI_Development_Framework.md
  - AI/Decision_Protocols.md
  - Architecture/Architecture_Principles.md
---

# Code Generation Checklist

## Objetivo

Definir checklist obrigatorio antes de aceitar codigo gerado por IA.

## Checklist de arquitetura

- [ ] O codigo pertence ao dominio correto.
- [ ] A estrutura segue `Recommended_Project_Structure.md`.
- [ ] Domain nao importa infra, framework, Supabase ou UI.
- [ ] Application orquestra use cases sem depender de detalhes externos.
- [ ] Infra implementa contratos definidos internamente.
- [ ] Presentation apenas traduz entrada e saida.
- [ ] Shared nao virou deposito generico de regra de negocio.

## Checklist de dominio

- [ ] Regras de negocio estao no dominio ou application.
- [ ] Entidades preservam invariantes.
- [ ] Value Objects foram usados quando ha regra reutilizavel de valor.
- [ ] Nomes refletem linguagem do FUTSTATS.
- [ ] Eventos representam fatos ocorridos.

## Checklist de backend

- [ ] Use case possui entrada e saida claras.
- [ ] Repositories sao interfaces no dominio/application quando necessario.
- [ ] Implementacoes Supabase ficam em infra.
- [ ] Controllers nao contem regra de negocio.
- [ ] Erros sao tratados de forma previsivel.
- [ ] Jobs sao idempotentes quando aplicavel.

## Checklist de banco

- [ ] Migrations sao nomeadas e reversiveis quando possivel.
- [ ] Constraints protegem integridade.
- [ ] Indices foram avaliados.
- [ ] RLS foi avaliado.
- [ ] O banco nao recebeu regra de negocio que pertence ao dominio.
- [ ] Impacto historico foi considerado.

## Checklist de frontend

- [ ] Componentes nao contem regra de negocio central.
- [ ] Estado local nao contradiz estado canonico.
- [ ] Modo offline foi considerado quando aplicavel.
- [ ] Modos de linguagem nao alteram dado canonico.
- [ ] UX simples foi preservada.

## Checklist de seguranca

- [ ] Autenticacao foi considerada.
- [ ] Autorizacao foi considerada.
- [ ] Dados sensiveis nao sao expostos.
- [ ] RLS nao e a unica protecao de regra de negocio.
- [ ] Logs nao vazam informacao sensivel.

## Checklist de testes

- [ ] Use cases possuem testes unitarios.
- [ ] Repositories possuem testes de integracao quando relevante.
- [ ] Eventos e handlers possuem teste de idempotencia quando relevante.
- [ ] Casos de erro foram testados.
- [ ] Fluxos offline foram considerados quando aplicavel.

## Checklist de documentacao

- [ ] Documentos relevantes foram atualizados.
- [ ] `Documentation_Index.md` foi atualizado quando necessario.
- [ ] Novos eventos, tabelas, endpoints ou regras foram documentados.
- [ ] Decisoes nao duplicam documentos oficiais.
