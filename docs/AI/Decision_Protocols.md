---
title: Decision Protocols
status: Approved
version: 1.0.0
owner: Product Architecture
last_update: 2026-07-06
related_documents:
  - AI/AI_Development_Framework.md
  - Architecture/Architecture_Principles.md
  - Architecture/Recommended_Project_Structure.md
---

# Decision Protocols

## Objetivo

Definir perguntas obrigatorias antes de criar ou alterar codigo, banco, eventos, APIs e documentacao.

## Protocolo antes de criar codigo

Responder:

1. Qual dominio e afetado?
2. Ja existe modulo relacionado?
3. Ja existe entidade parecida?
4. Ja existe use case parecido?
5. Ja existe repository parecido?
6. Ja existe evento parecido?
7. A funcionalidade altera regra de negocio?
8. A funcionalidade exige persistencia?
9. A funcionalidade exige API?
10. A documentacao precisa ser atualizada?

Se algo parecido ja existir, preferir evoluir o existente antes de criar duplicacao.

## Protocolo para novo dominio

Criar um novo dominio somente se:

- a responsabilidade nao pertence claramente a dominio existente;
- ha linguagem propria de negocio;
- ha regras e entidades especificas;
- o modulo tera evolucao independente;
- Architecture Guardian aprovar.

## Protocolo para novo use case

Um use case deve representar uma acao clara da aplicacao.

Antes de criar, validar:

- nome em verbo no imperativo ou acao clara;
- entrada e saida definidas;
- invariantes de dominio respeitadas;
- repository interface necessaria;
- eventos emitidos quando houver efeitos colaterais;
- testes unitarios previstos.

## Protocolo para novo evento

Criar evento quando:

- algo relevante ja aconteceu;
- outro dominio precisa reagir;
- o efeito colateral nao deve acoplar diretamente os modulos;
- a acao principal nao deve depender de todos os efeitos secundarios.

Eventos devem ser nomeados no passado:

- `GoalRegistered`
- `MatchFinished`
- `PlayerLinkedToTeam`
- `PostPublished`

## Protocolo para banco de dados

Antes de criar ou alterar tabela:

1. Qual entidade ou agregado sera persistido?
2. Qual dominio e dono do dado?
3. Ha impacto historico?
4. Ha soft delete?
5. Ha auditoria?
6. Quais indices sao necessarios?
7. Quais constraints protegem integridade?
8. Quais politicas RLS sao necessarias?
9. A regra esta no dominio ou indevidamente no banco?

## Protocolo para Supabase

Supabase deve ser tratado como infraestrutura.

Pode ser usado para:

- Auth;
- PostgreSQL;
- RLS;
- Storage;
- Realtime;
- Edge Functions;
- logs e integrações auxiliares.

Nao deve ser usado como substituto para:

- regras de dominio;
- use cases;
- orquestracao principal de negocio;
- decisao de produto.

## Protocolo para documentacao

Atualizar documentacao quando:

- nova decisao arquitetural for tomada;
- nova regra de negocio for criada;
- novo modulo, tabela, evento ou endpoint for criado;
- comportamento documentado mudar;
- documento existente ficar contraditorio.

Todo novo documento relevante deve ser indexado em `Documentation_Index.md`.
