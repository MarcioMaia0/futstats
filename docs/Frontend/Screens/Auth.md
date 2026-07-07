---
title: Screen: Auth
status: Draft
version: 0.1.0
owner: Product Architecture
last_update: 2026-07-07
related_documents:
  - ../../Domain/Identity.md
  - ../../ADR/ADR_004_Account_User_Player_Separation.md
  - ../../Security/Auth_Security.md
  - ../../API/Auth_API.md
  - Welcome.md
  - Forgot_Password.md
  - Complete_Profile.md
---

# Screen: Auth

## Objetivo

Criar conta ou entrar pelo caminho de e-mail e senha. Tela única com alternância entre "Entrar" e "Criar conta". Componente: `AuthScreen`.

## Elementos

- Alternância "Entrar" / "Criar conta".
- Campos do modo ativo.
- Botão primário ("Entrar" ou "Criar conta").
- Link "Esqueci a senha" (modo entrar).
- Aceite de Termos e Privacidade (modo criar conta).
- Link para voltar à Welcome.

## Campos

### Modo criar conta

- `display_name` — obrigatório. Origem: `users.display_name`.
- `email` — obrigatório, formato de e-mail. Origem: `accounts.email`.
- `password` — obrigatório, regras mínimas de força. Nunca persistido em claro (Supabase Auth).
- `terms_accepted` — checkbox obrigatório. Origem: `accounts.terms_accepted_at`.

### Modo entrar

- `email` — obrigatório.
- `password` — obrigatório.

## Regras de UX

- Validação inline; não revelar se um e-mail existe (mensagem neutra).
- `auth_provider` gravado como `EMAIL`.
- Cadastro cria `account` + `user`; nunca cria `player`.
- Textos via i18n; tokens de tema.

## Estados

- loading: durante submit.
- error: credencial inválida, e-mail já cadastrado, senha fraca, rate limit.
- offline: submit indisponível, com aviso.
- success: sessão criada → completar perfil (se necessário) ou Home.

## Eventos

- Criar conta com sucesso emite criação de `account` + `user` (ver `MatchScheduled`/eventos de domínio equivalentes de identidade quando definidos).
- Verificação de e-mail conforme política do Supabase Auth.
