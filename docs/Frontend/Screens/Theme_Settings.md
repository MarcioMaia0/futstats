---
title: Screen: Theme Settings
status: Draft
version: 0.7.0
owner: Product Architecture
last_update: 2026-07-07
related_documents: []
---

# Screen: Theme Settings

## Objetivo

Configurações de tema.

## Elementos

- Seletor de tema: claro / escuro / tema do time quando aplicável (componente `ThemePicker`).

## Campos

- `preferred_theme_id` — nullable. Origem: `user_preferences.preferred_theme_id`.

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