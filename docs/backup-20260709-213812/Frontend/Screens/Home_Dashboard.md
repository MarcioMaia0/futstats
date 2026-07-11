---
title: Screen: Home Dashboard
status: Draft
version: 0.7.0
owner: Product Architecture
last_update: 2026-07-07
related_documents: []
---

# Screen: Home Dashboard

## Objetivo

Entrada do usuário com próximos jogos, ações rápidas e feed.

## Elementos

- Estado torcedor (não autenticado): notícias e destaques de todos os times; slot de conteúdo patrocinado (nunca rotulado como "anúncio" ao usuário — ver `UX_Principles.md`); busca de time; busca de player; acesso a feeds e perfis públicos.
- Estado autenticado: próximo jogo, último resultado, atalho "nova partida" (para membros de time), feed.
- Barra de busca (time/player), disponível nos dois estados.

## Campos

Nenhum campo de entrada além da busca. Tela de leitura/navegação. Ações que geram dado só aparecem para usuários vinculados a um time.

## Regras de UX

- Priorizar clareza e simplicidade.
- Exibir apenas campos essenciais inicialmente.
- Mostrar ações primárias com destaque.
- Permitir avanço para detalhes.
- Respeitar tema e modo de linguagem.

## Estados

- loading;
- empty;
- error;
- success;
- offline quando aplicável.

## Eventos

A definir conforme integração com API.