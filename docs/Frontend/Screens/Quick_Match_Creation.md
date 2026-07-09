---
title: Screen: Quick Match Creation
status: Draft
version: 0.8.0
owner: Product Architecture
last_update: 2026-07-07
related_documents:
  - ../../Implementation/Core_Flows/Quick_Match_Implementation.md
---

# Screen: Quick Match Creation

## Objetivo

Criar partida rapida em poucos segundos, para uso casual.

## Elementos

- seletor de time;
- campo de adversario;
- placar;
- acoes rapidas para gols;
- area de autores dos gols;
- botao compartilhar;
- botao finalizar;
- expansao opcional para dados avancados.

## Campos

- `team_id` - obrigatorio; selecionar time existente ou criar em fluxo auxiliar.
- `opponent_name` ou `local_opponent_id` - obrigatorio; texto livre no caso simples.
- `home_score` - obrigatorio.
- `opponent_score` - obrigatorio.
- `match_date` - obrigatorio.
- `goal_authors` - opcional.
- `venue_id` - opcional.
- `referee_id` - opcional.
- `players` - opcional.
- `comments` - opcional.

## Regras de UX

- Priorizar clareza e simplicidade.
- Exibir apenas campos essenciais inicialmente.
- Mostrar acoes primarias com destaque.
- Permitir avancar para detalhes sem bloquear o fluxo principal.
- Respeitar tema e modo de linguagem.
- Compartilhar deve ficar visivel no fluxo principal.
- Nao exigir scout, arbitragem, elenco completo ou quadra para concluir a partida.
- Recursos avancados devem ficar atras de expansao ou etapa opcional.

## Estados

- loading;
- empty;
- error;
- success;
- offline quando aplicavel.

## Eventos

- criar rascunho ou partida rapida;
- atualizar placar;
- registrar gols;
- finalizar partida;
- gerar card compartilhavel.
