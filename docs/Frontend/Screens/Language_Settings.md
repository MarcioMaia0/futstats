---
title: Screen: Language Settings
status: Draft
version: 0.7.0
owner: Product Architecture
last_update: 2026-07-07
related_documents: []
---

# Screen: Language Settings

## Objetivo

Configuração dos modos de linguagem da UI (Technical, Varzea, Resenha).

## Elementos

- Seletor de modo de linguagem: Technical / Varzea / Resenha (componente `LanguageModeSelector`; ver `../../ADR/ADR_005_UI_Language_Modes.md`).

## Campos

- `preferred_language_mode` — enum. Origem: `user_preferences.preferred_language_mode` (default pelo locale do dispositivo).

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