---
title: Onboarding Flow
status: Review
version: 1.1.0
owner: Product Architecture
last_update: 2026-07-08
related_documents:
  - ../../../Frontend/Screens/Start_Path_Selection.md
  - ../../../API/Auth_API.md
  - ../../../API/Identity_API.md
---

# Onboarding Flow

## Objetivo

Servir como referência de implementação para o onboarding inicial do FUTSTATS, preservando o princípio casual-first e a separação entre intenção, vínculo e papel.

## Contexto

O FUTSTATS deve entregar valor desde o primeiro jogo e também permitir exploração sem fricção excessiva.

## Regra central

> O FUTSTATS nunca deve exigir comportamento analítico para entregar valor.

## Fluxo inicial

1. autenticar ou recuperar sessão;
2. consultar `GET /api/v1/me`;
3. se `onboarding.requires_complete_profile = true`, abrir `Complete Profile`;
4. se for primeiro acesso autenticado, abrir `Start Path Selection`;
5. encaminhar a pessoa para o fluxo correspondente à sua intenção inicial.

## Saídas possíveis da tela de intenção

- `Criar meu time`
  - abre wizard do time;
  - persiste apenas ao concluir;
- `Entrar em um time`
  - abre busca de time;
  - persiste apenas solicitação de entrada;
- `Explorar primeiro`
  - abre Home neutra;
  - não cria vínculo de domínio obrigatório.

## Sinais leves de interesse

O produto pode registrar sinais leves de interesse comportamental para:

- personalização da Home;
- sugestão de times para seguir;
- sugestão de atletas para acompanhar.

Esses sinais não criam follow automático nem substituem vínculo explícito.

## Critérios de aceite

- fluxo principal documentado;
- persistência parcial evitada em criação de time;
- separação entre solicitação e vínculo final em entrada de time;
- impacto no usuário casual considerado;
- impacto no usuário avançado considerado.
