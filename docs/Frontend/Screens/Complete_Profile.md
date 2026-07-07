---
title: Screen: Complete Profile
status: Draft
version: 0.1.0
owner: Product Architecture
last_update: 2026-07-07
related_documents:
  - ../../Domain/Identity.md
  - ../../ADR/ADR_004_Account_User_Player_Separation.md
  - Welcome.md
  - Phone_Otp.md
---

# Screen: Complete Profile

## Objetivo

Capturar o handle público e o nome de exibição logo após o primeiro auth via social/telefone. Componente: `CompleteProfileScreen`. Passo mínimo — nada além do necessário.

## Elementos

- Saudação de boas-vindas.
- Campo de nome de exibição.
- Botão "Continuar".

## Campos

- `username` — obrigatório, único, com verificação de disponibilidade. Origem: `users.username`.
- `display_name` — obrigatório (pré-preenchido com o nome do provedor social quando houver). Origem: `users.display_name`.

## Regras de UX

- Exibida em login social/telefone para conta nova (o `username` nunca vem do provedor); pulada quando o login vincula a uma conta já existente (ver ADR 012). Em login por e-mail os dados já foram coletados na Auth.
- Não pedir foto, apelido esportivo, posição ou time favorito aqui — tudo diferido (casual-first).
- Textos via i18n; tokens de tema.

## Estados

- loading: salvando.
- error: validação ou rede.
- success: perfil mínimo completo → Home.

## Eventos

- Salvar atualiza `users.display_name`.
