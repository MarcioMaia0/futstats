---
title: Screen: Language Settings
status: Draft
version: 0.8.1
owner: Product Architecture
last_update: 2026-07-07
related_documents:
  - Settings.md
  - ../../ADR/ADR_005_UI_Language_Modes.md
  - ../../Product/Language_Modes.md
  - ../../Implementation/Database/Table_Spec_user_preferences.md
  - ../../Implementation/Database/Table_Spec_ui_vocabulary.md
---

# Screen: Language Settings

## Objetivo

Permitir que a pessoa escolha o modo de linguagem da UI sem alterar dados canonicos.

## Elementos

- Seletor de modo de linguagem: Technical / Varzea / Resenha.
- Preview curto com exemplos de termos que mudam conforme o modo.
- Texto explicativo deixando claro que a mudanca afeta a interface, nao os dados registrados.

## Campos

- `preferred_language_mode` - enum. Origem: `user_preferences.preferred_language_mode`.

## Regras de UX

- A troca deve ser imediata apos salvar ou aplicar.
- O preview deve usar chaves reais de vocabulario, nao exemplos inventados em tempo de execucao.
- A UI deve manter semantica estavel: muda o tom, nao a regra de negocio.
- Se faltar traducao para uma chave no modo escolhido, usar fallback `TECHNICAL`.
- Textos e exemplos devem vir da camada de vocabulario, nao hardcoded na tela.

## Estados

- loading;
- error;
- success;
- offline quando aplicavel.

## Eventos

- carregar modos disponiveis;
- atualizar `user_preferences.preferred_language_mode`;
- salvar via `PATCH /api/v1/me/preferences`;
- recarregar o bundle de vocabulario ativo apos salvar.
