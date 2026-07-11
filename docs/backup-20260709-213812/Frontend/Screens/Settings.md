---
title: Screen: Settings
status: Draft
version: 0.7.0
owner: Product Architecture
last_update: 2026-07-07
related_documents: []
---

# Screen: Settings

## Objetivo

Hub de configurações do usuário: conta, privacidade, aparência (tema) e idioma. Componente: `SettingsScreen`.

## Elementos

- Seção Conta (dados básicos do usuário).
- Link "Privacidade" → `Privacy_Settings` (visibilidade de perfil, exibição de nome, região).
- Link "Aparência" → `Theme_Settings`.
- Link "Idioma" → `Language_Settings`.
- Ação de sair (logout).

## Campos

Nenhum. Tela de navegação.

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