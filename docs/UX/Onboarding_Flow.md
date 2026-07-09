---
title: Onboarding Flow
status: Draft
version: 1.1.0
owner: Product Architecture
last_update: 2026-07-08
related_documents:
  - ../Frontend/Screens/Welcome.md
  - ../Frontend/Screens/Complete_Profile.md
  - ../Frontend/Screens/Start_Path_Selection.md
  - ../API/Auth_API.md
---

# Onboarding Flow

## Objetivo

Criar uma entrada simples e progressiva para diferentes intenções de uso, sem classificar a pessoa em um tipo fixo de usuário.

## Fluxo principal

1. entrar ou criar conta;
2. completar perfil mínimo quando necessário;
3. escolher como quer começar;
4. seguir para:
   - criação de time;
   - busca para entrar em time;
   - Home neutra.

## Fluxo criar meu time

1. abrir wizard step by step;
2. preencher nome do time;
3. opcionalmente configurar escudo;
4. opcionalmente configurar dados técnicos;
5. concluir criação;
6. criar time e vínculo de gestão com `DIRECTOR`.

## Fluxo entrar em um time

1. buscar um time;
2. selecionar o time;
3. confirmar envio da solicitação;
4. visualizar confirmação;
5. continuar buscando ou seguir para a Home neutra enquanto aguarda.

## Fluxo explorar primeiro

1. seguir direto para a Home neutra;
2. consumir conteúdo;
3. permitir que o produto aprenda interesse implícito de navegação sem criar vínculo automático.

## Regra

Onboarding não deve obrigar a pessoa a escolher tudo no primeiro acesso e não deve exigir dados esportivos completos antes do momento certo.
