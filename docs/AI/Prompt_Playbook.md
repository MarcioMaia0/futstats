---
title: Prompt Playbook
status: Approved
version: 1.0.0
owner: Product Architecture
last_update: 2026-07-06
related_documents:
  - AI/AI_Development_Framework.md
  - AI/Agent_Roles.md
  - AI/Decision_Protocols.md
---

# Prompt Playbook

## Objetivo

Fornecer modelos de prompts para desenvolvimento assistido por IA no FUTSTATS.

## Prompt para discovery

```text
Atue como Technical Lead do FUTSTATS.
Analise a seguinte solicitacao sem criar codigo.
Identifique dominios afetados, documentos que devem ser lidos, riscos, dependencias e plano recomendado.
Siga AI/AI_Development_Framework.md e Architecture/Architecture_Principles.md.

Solicitacao:
[descrever solicitacao]
```

## Prompt para design de feature

```text
Atue como Architecture Guardian e Domain Expert do FUTSTATS.
Desenhe a solucao para a feature abaixo.
Nao implemente codigo ainda.
Informe entidades, use cases, repositories, eventos, handlers, impacto em banco, testes e documentacao.

Feature:
[descrever feature]
```

## Prompt para backend

```text
Atue como Backend Developer do FUTSTATS.
Implemente a feature seguindo Modular Clean Architecture.
Nao coloque regra de negocio em controllers, repositories ou banco.
Use events quando houver efeitos colaterais entre dominios.
Inclua testes.

Feature:
[descrever feature]
```

## Prompt para banco

```text
Atue como Database Designer do FUTSTATS.
Proponha migrations, tabelas, indices, constraints e RLS para a necessidade abaixo.
Nao coloque regra de negocio no banco.
Explique impacto historico e relacao com dominios.

Necessidade:
[descrever necessidade]
```

## Prompt para revisao

```text
Atue como Architecture Guardian, Security Reviewer, QA Engineer e Consistency Guardian.
Revise a mudanca abaixo seguindo AI/Review_Checklist.md.
Classifique como Approved, Approved with comments, Needs changes ou Blocked.

Mudanca:
[colar diff ou descricao]
```

## Prompt para documentacao

```text
Atue como Documentation Maintainer do FUTSTATS.
Atualize a documentacao abaixo mantendo frontmatter, links relacionados e indice.
Evite duplicar decisoes ja documentadas.

Mudanca:
[descrever mudanca]
```

## Prompt para consistencia

```text
Atue como Consistency Guardian do FUTSTATS.
Procure contradicoes entre codigo, documentacao, nomenclatura, banco, eventos e API.
Liste inconsistencias, impacto e correcao sugerida.

Escopo:
[descrever escopo]
```

## Prompt para refatoracao

```text
Atue como Architecture Guardian e Backend Developer do FUTSTATS.
Refatore o escopo abaixo sem alterar comportamento.
Preserve testes, contratos publicos e regras de negocio.
Explique o antes, o depois e os riscos.

Escopo:
[descrever escopo]
```

## Regra para prompts

Todo prompt relevante deve informar:

- papel esperado;
- modo de trabalho;
- dominio afetado quando conhecido;
- documentos obrigatorios;
- limite do que nao deve ser feito;
- formato de saida esperado.
