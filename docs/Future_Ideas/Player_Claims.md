---
title: Future Idea - Player Claims
status: Idea
version: 1.0.0
owner: Product Architecture
last_update: 2026-07-09
related_documents:
  - ../API/Players_API.md
  - ../Domain/Players.md
  - ../Implementation/Core_Flows/Player_Profile_Implementation.md
---

# Future Idea: Player Claims

## Objetivo

Avaliar a criacao de uma tabela propria para registrar reivindicacoes de perfil de atleta e merges operacionais entre atletas criados por times e atletas revendicados por usuarios reais.

## Problema que a ideia resolve

Hoje o fluxo de claim ja existe como operacao e regra de negocio, mas ainda nao esta consolidado como trilha persistente dedicada.

Uma tabela propria poderia ajudar em:

- auditoria;
- rastreabilidade;
- revisao manual;
- mediacao de conflito;
- historico de merges.

## Exemplos de uso

- jogador criado por um diretor sem conta entra no app meses depois e reivindica o proprio historico;
- mesmo atleta ja foi criado operacionalmente por mais de um time;
- a operacao de merge precisa ficar auditavel;
- uma reivindicacao precisa passar por aprovacao contextual antes da consolidacao.

## Possivel escopo futuro

- registrar origem e destino do merge;
- registrar quem iniciou;
- registrar quem aprovou ou confirmou;
- registrar conflito detectado;
- registrar resultado final da consolidacao.

## Status

Ideia valida para evolucao futura, mas ainda nao e tabela canonica do modelo atual.
