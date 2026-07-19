---
title: Screen: Complete Profile
status: Draft
version: 0.1.3
owner: Product Architecture
last_update: 2026-07-17
related_documents:
  - ../../Domain/Identity.md
  - ../../ADR/ADR_004_Account_User_Player_Separation.md
  - ../../API/Auth_API.md
  - Welcome.md
  - Phone_Otp.md
  - Sign_Up.md
---

# Screen: Complete Profile

## Objetivo

Capturar o handle público e o nome de exibição logo após o primeiro auth via social ou telefone. Componente: `CompleteProfileScreen`. Passo mínimo, sem pedir dados além do necessário.

## Elementos

- saudação de boas-vindas;
- campo de username;
- campo de nome de exibição;
- botão `Continuar`.

## Campos

- `username` - obrigatório, único, com verificação de disponibilidade. Origem: `public.users.username`.
- `display_name` - obrigatório, pré-preenchido com o nome do provedor social quando houver. Origem: `public.users.display_name`.

## Regras de UX

- exibida sempre que `GET /api/v1/me` retornar `onboarding.requires_complete_profile = true`;
- isso normalmente acontece em login social ou telefone para conta nova, porque o `username` nunca vem do provedor;
- em login por e-mail, os dados já foram coletados na `Sign Up`, então esta tela deve ser pulada;
- se o login apenas vincular a uma conta já existente, esta tela deve ser pulada;
- se a sessão for restaurada e o perfil mínimo ainda estiver incompleto, a aplicação deve voltar para esta tela antes da Home;
- `username` usa a mesma validação e a mesma verificação de disponibilidade da tela `Sign Up`;
- não pedir foto, apelido esportivo, posição ou time favorito aqui; tudo isso fica para depois;
- textos via i18n; tokens de tema.

## Estados

- loading: salvando.
- error: validação ou rede.
- success: perfil mínimo completo e redirecionamento para a Home.

## Eventos

- salvar submete `POST /api/v1/auth/complete-profile`.
- consulta de disponibilidade de `username` usa `GET /api/v1/auth/username-availability`.
- salvar atualiza `public.users.username` e `public.users.display_name`.
