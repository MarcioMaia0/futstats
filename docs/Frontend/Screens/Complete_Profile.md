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

Capturar o nome de exibição logo após o primeiro auth, quando o provedor não o forneceu (típico em telefone; às vezes em social). Componente: `CompleteProfileScreen`. Passo mínimo e único — nada além do necessário.

## Elementos

- Saudação de boas-vindas.
- Campo de nome de exibição.
- Botão "Continuar".

## Campos

- `display_name` — obrigatório. Origem: `users.display_name`.

## Regras de UX

- Aparece apenas quando `display_name` está ausente após o auth; caso contrário, pular direto para a Home.
- Não pedir foto, apelido esportivo, posição ou time favorito aqui — tudo diferido (casual-first).
- Textos via i18n; tokens de tema.

## Estados

- loading: salvando.
- error: validação ou rede.
- success: perfil mínimo completo → Home.

## Eventos

- Salvar atualiza `users.display_name`.
