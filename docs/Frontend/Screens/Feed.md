---
title: Screen: Feed
status: Draft
version: 0.7.0
owner: Product Architecture
last_update: 2026-07-07
related_documents: []
---

# Screen: Feed

## Objetivo

Feed social de resultados, posts e resenha.

## Elementos

- Lista de posts e resultados (cards).
- Reações e comentários (interação social).
- Torcedor (não autenticado): leitura pública liberada; reagir/comentar dispara o `AuthPromptSheet` (ver `../Components/Auth_Prompt_Sheet.md`).

## Campos

Nenhum campo de entrada direta. A interação social (reagir/comentar) exige conta.

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