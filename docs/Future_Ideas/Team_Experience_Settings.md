---
title: Future Idea - Team Experience Settings
status: Idea
version: 1.0.0
owner: Product Architecture
last_update: 2026-07-09
related_documents:
  - ../Implementation/Database/Table_Spec_team_settings.md
  - ../Implementation/Database/Table_Spec_themes.md
  - ../Frontend/Screens/Theme_Settings.md
---

# Future Idea: Team Experience Settings

## Objetivo

Avaliar uma separacao futura entre configuracoes operacionais do time e configuracoes de experiencia, apresentacao e personalizacao.

## Problema que a ideia resolve

Com o crescimento do produto, uma unica tabela de configuracoes do time pode ficar ampla demais e misturar naturezas diferentes de dados.

## Exemplo de configuracao operacional

- localidade;
- quadra principal;
- modalidade contextual;
- preferencia de agenda;
- dados estruturais do time.

## Exemplo de configuracao de experiencia

- tema visual ligado ao time;
- ordem de cores no app;
- vocabulario aplicado ao time;
- configuracao de notificacoes;
- comportamento de exibicao social.

## Valor potencial

- melhor organizacao do dominio Experience;
- menor acoplamento com configuracoes operacionais;
- base mais limpa para personalizacao futura.

## Status

Ideia valida para evolucao futura, mas ainda nao e tabela canonica do modelo atual.
