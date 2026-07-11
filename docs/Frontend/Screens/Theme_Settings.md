---
title: Screen: Theme Settings
status: Draft
version: 0.8.1
owner: Product Architecture
last_update: 2026-07-07
related_documents:
  - Settings.md
  - ../../Domain/Experience.md
  - ../../Implementation/Database/Table_Spec_user_preferences.md
  - ../../Implementation/Database/Table_Spec_themes.md
  - ../../Implementation/Database/Table_Spec_team_settings.md
---

# Screen: Theme Settings

## Objetivo

Permitir que a pessoa escolha como a interface deve ser colorida e de onde vem o tema visual principal.

## Elementos

- Seletor de tema: Claro / Escuro / Tema do time quando aplicavel.
- Preview resumido do tema selecionado.
- Bloco informativo quando o tema do time estiver indisponivel.
- Link opcional para o perfil do time quando o tema vier do time.

## Campos

- `preferred_theme_id` - nullable. Origem: `user_preferences.preferred_theme_id`.

## Regras de UX

- Priorizar clareza e simplicidade.
- Exibir apenas as tres escolhas principais no estado atual do produto.
- `Tema do time` so deve aparecer quando a pessoa estiver vinculada a pelo menos um time com tema padrao configurado.
- Se a pessoa estiver em mais de um time, usar o time em contexto atual; na ausencia de contexto, usar o ultimo time ativo.
- Quando o time nao tiver tema configurado, mostrar fallback para Claro ou Escuro sem erro visual.
- Preview deve refletir cores principais antes de salvar, sem exigir navegação adicional.
- Textos via i18n; tokens de tema e cores canonicas.

## Estados

- loading;
- error;
- success;
- offline quando aplicavel.

## Eventos

- carregar temas disponiveis para a pessoa;
- atualizar `user_preferences.preferred_theme_id`;
- salvar via `PATCH /api/v1/me/preferences`;
- reidratar o tema ativo da sessao apos salvar.
