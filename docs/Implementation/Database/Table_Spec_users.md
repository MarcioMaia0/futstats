---
title: Table Spec users
status: Draft
version: 0.9.0
owner: Product Architecture
last_update: 2026-07-06
---

# Table Spec users

## Objetivo

Especificar tabela `users`.

## Finalidade

Representar pessoa dentro da plataforma.

## Campos sugeridos

- `id`
- `account_id`
- `display_name`
- `avatar_url`
- `preferred_language_mode`
- `preferred_theme_id`
- `created_at`
- `updated_at`

## Regras

- User pode não ser player.
- Preferências pertencem ao usuário.


## Critérios de qualidade

- O fluxo deve funcionar para usuário casual sem exigir cadastro excessivo.
- Recursos avançados devem ser progressivos e opcionais.
- O comportamento deve preservar consistência entre frontend, backend, API e banco.
- Todas as entidades técnicas, payloads, enums e nomes internos devem usar inglês.
- Textos exibidos ao usuário devem passar por camada de linguagem/configuração.

## Regras para IA

Ao usar este documento como contexto para implementação, a IA deve:
1. preservar o princípio de uso casual simples;
2. não criar campos obrigatórios que bloqueiem o MVP;
3. respeitar separação entre dado canônico e texto de interface;
4. manter compatibilidade com evolução futura;
5. sugerir migrations, testes e endpoints quando alterar domínio.
