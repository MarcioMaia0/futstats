---
title: Team Profile Implementation
status: Draft
version: 0.9.0
owner: Product Architecture
last_update: 2026-07-06
---

# Team Profile Implementation

## Objetivo

Definir o perfil do time.

## Contexto

O time é a unidade central de organização, experiência, inteligência e legado.

## Conteúdo do perfil

- nome;
- escudo;
- cores;
- estatísticas simples;
- últimos jogos;
- próximos jogos;
- elenco;
- destaques;
- feed;
- histórico.

## Regras

- Time pode ser criado com dados mínimos.
- Identidade visual pode ser completada depois.
- Time pode ser público, privado ou restrito.
- Diretores controlam permissões.
- Histórico não pertence a um único usuário.

## API

```http
POST /teams
GET /teams/{teamId}
PATCH /teams/{teamId}
GET /teams/{teamId}/profile
GET /teams/{teamId}/timeline
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
