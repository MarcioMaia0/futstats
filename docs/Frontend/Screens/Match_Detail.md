---
title: Screen: Match Detail
status: Draft
version: 0.8.0
owner: Product Architecture
last_update: 2026-07-07
related_documents:
  - ../../Implementation/Frontend/Screen_Spec_Match_Report_Historical.md
  - ../../Implementation/Core_Flows/Share_Card_Implementation.md
---

# Screen: Match Detail

## Objetivo

Detalhes da partida: placar, gols, eventos e compartilhamento.

## Elementos

- placar;
- gols;
- destaques;
- estatisticas simples;
- estatisticas avancadas se disponiveis;
- midia;
- comentarios;
- compartilhamento.

## Campos

Tela de leitura predominante. Edicao de placar e eventos deve respeitar permissao e status da partida.

## Regras de UX

- Priorizar clareza e simplicidade.
- Exibir apenas campos essenciais inicialmente.
- Mostrar acoes primarias com destaque.
- Permitir avancar para detalhes.
- Respeitar tema e modo de linguagem.
- Dados ausentes nao devem gerar erro visual.
- Quando metricas avancadas nao estiverem disponiveis, mostrar mensagem educativa.
- Compartilhamento deve ser rapido e visualmente destacado.

## Estados

- loading;
- empty;
- error;
- success;
- offline quando aplicavel.

## Eventos

- abrir compartilhamento do resultado;
- navegar para comentarios, midia e destaques;
- abrir estatisticas avancadas apenas quando houver dados suficientes.
