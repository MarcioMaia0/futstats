---
title: Table Spec ui_vocabulary
status: Draft
version: 1.0.0
owner: Product Architecture
last_update: 2026-07-07
related_documents:
  - Table_Spec_user_preferences.md
  - ../../ADR/ADR_005_UI_Language_Modes.md
  - ../../Product/Language_Modes.md
---

# Table Spec ui_vocabulary

## Objetivo

Especificar a tabela `ui_vocabulary`, usada para resolver textos da interface por modo de linguagem.

## Finalidade

Permitir que a mesma chave canonica de interface seja apresentada em `TECHNICAL`, `VARZEA` ou `RESENHA` sem contaminar banco, API ou codigo com copy variavel.

## Campos sugeridos

- `id` (uuid, PK)
- `vocabulary_key` (text)
- `language_mode` (enum `language_mode`)
- `label` (text)
- `description` (text, nullable)
- `context` (text, nullable)
- `is_active` (boolean, default `true`)
- `created_at`
- `updated_at`

## Regra de unicidade

- Unico por (`vocabulary_key`, `language_mode`).

## Regras

- `vocabulary_key` deve ser tecnica e canonica, por exemplo `goalkeeper_mistake`.
- O estado atual do produto deve suportar pelo menos os modos `TECHNICAL`, `VARZEA` e `RESENHA`.
- Se uma chave nao existir no modo escolhido, o fallback deve ser `TECHNICAL`.
- Essa tabela nao substitui i18n completo; ela cobre a camada de tom e dialeto do produto.
- `label` e `description` sao conteudo de experiencia e podem mudar sem alterar o dado esportivo.
