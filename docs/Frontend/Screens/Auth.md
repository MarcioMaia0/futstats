---
title: Screen: Auth (Historical Bridge)
status: Historical
version: 0.2.0
owner: Product Architecture
last_update: 2026-07-17
related_documents:
  - Login.md
  - Sign_Up.md
  - Forgot_Password.md
  - Complete_Profile.md
  - ../../API/Auth_API.md
---

# Screen: Auth

## Objetivo deste documento

Este documento deixou de ser a fonte canônica da experiência de e-mail e senha.

A decisão atual do produto é separar a antiga `AuthScreen` em duas telas distintas:

- `LoginScreen`
- `SignUpScreen`

## Fontes canônicas atuais

- login por e-mail e senha:
  - `Login.md`
- criação de conta por e-mail e senha:
  - `Sign_Up.md`
- recuperação de acesso:
  - `Forgot_Password.md`
- complemento de perfil após social ou telefone:
  - `Complete_Profile.md`

## Motivo da mudança

Embora uma tela única com alternância entre entrar e criar conta fosse viável tecnicamente, o produto fechou que os dois fluxos devem existir como superfícies separadas porque:

- os campos são diferentes;
- a densidade visual e cognitiva é diferente;
- a navegação fica mais clara;
- a implementação e a evolução visual ficam mais previsíveis.

## Regra de compatibilidade

Qualquer documento antigo que cite `Auth.md` deve ser interpretado como referência histórica ao conjunto do fluxo de autenticação por e-mail, nunca mais como definição canônica de uma tela única.
