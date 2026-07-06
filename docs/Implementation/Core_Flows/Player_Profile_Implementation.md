---
title: Player Profile Implementation
status: Draft
version: 0.9.0
owner: Product Architecture
last_update: 2026-07-06
---

# Player Profile Implementation

## Objetivo

Definir implementação do perfil de jogador.

## Contexto

O perfil do jogador precisa funcionar para resenha, identidade e estatísticas. Ele deve poder nascer simples e evoluir.

## Níveis de perfil

### Perfil mínimo

- apelido;
- time;
- gols registrados.

### Perfil básico

- foto;
- posição;
- perna dominante;
- número.

### Perfil completo

- histórico;
- estatísticas;
- cards;
- atributos;
- conquistas;
- vídeos.

## Regras

- Player pode existir sem user.
- User pode reivindicar player.
- Histórico não deve ser perdido na reivindicação.
- Apelido deve ser destaque visual.
- Nome completo pode ser opcional em contextos sociais.

## API

```http
POST /players
GET /players/{playerId}
PATCH /players/{playerId}
POST /players/{playerId}/claim
GET /players/{playerId}/timeline
```


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
