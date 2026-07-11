---
title: Review Checklist
status: Approved
version: 1.0.0
owner: Product Architecture
last_update: 2026-07-06
related_documents:
  - AI/AI_Development_Framework.md
  - AI/Agent_Roles.md
  - AI/Code_Generation_Checklist.md
---

# Review Checklist

## Objetivo

Definir como revisar entregas feitas por pessoas ou IAs no FUTSTATS.

## Revisao arquitetural

- [ ] A mudanca respeita Modular Clean Architecture.
- [ ] Dependencias apontam para dentro.
- [ ] Dominio nao conhece infraestrutura.
- [ ] Modulos nao estao acoplados indevidamente.
- [ ] Shared contem apenas codigo realmente compartilhado.

## Revisao de dominio

- [ ] A regra pertence ao dominio correto.
- [ ] A linguagem usada faz sentido para o negocio.
- [ ] Entidades e value objects preservam invariantes.
- [ ] Eventos representam fatos de negocio.
- [ ] Historico de partidas, atletas e times foi preservado.

## Revisao de banco

- [ ] Tabelas e colunas seguem naming convention.
- [ ] Constraints e indices foram considerados.
- [ ] RLS foi aplicada quando necessario.
- [ ] Triggers nao substituem use cases.
- [ ] Auditoria e soft delete foram considerados quando aplicavel.

## Revisao de backend

- [ ] Use cases sao pequenos e claros.
- [ ] Controllers nao contem regra de negocio.
- [ ] Repositories nao tomam decisoes de negocio.
- [ ] Handlers sao idempotentes quando necessario.
- [ ] Erros sao consistentes.

## Revisao de frontend

- [ ] Telas preservam simplicidade.
- [ ] Componentes sao reutilizaveis sem acoplamento excessivo.
- [ ] Estado e cache nao quebram consistencia.
- [ ] Offline-first foi considerado quando aplicavel.
- [ ] Linguagem de UI nao altera dado canonico.

## Revisao de seguranca

- [ ] Permissoes foram revisadas.
- [ ] Dados sensiveis estao protegidos.
- [ ] RLS e autorizacao de aplicacao estao coerentes.
- [ ] Nao ha vazamento em logs ou respostas.
- [ ] LGPD foi considerada quando dados pessoais forem envolvidos.

## Revisao de QA

- [ ] Testes cobrem fluxo feliz.
- [ ] Testes cobrem erros.
- [ ] Testes cobrem autorizacao.
- [ ] Testes cobrem idempotencia quando aplicavel.
- [ ] Testes cobrem consistencia historica quando aplicavel.

## Revisao documental

- [ ] Documentacao acompanha a mudanca.
- [ ] Indice foi atualizado.
- [ ] Nao ha contradicao com documentos aprovados.
- [ ] Decisoes novas foram registradas.

## Resultado da revisao

Toda revisao deve terminar com uma classificacao:

- Approved
- Approved with comments
- Needs changes
- Blocked

Mudancas que violem arquitetura, dominio, seguranca ou integridade historica devem ser classificadas como `Blocked`.
