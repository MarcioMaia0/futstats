---
title: Acceptance Core MVP
status: Draft
version: 0.9.0
owner: Product Architecture
last_update: 2026-07-06
---

# Acceptance Core MVP

## Objetivo

Definir critérios de aceitação do MVP.

## Cenários obrigatórios

1. Criar time com nome.
2. Criar partida rápida.
3. Registrar placar.
4. Registrar gol com autor.
5. Registrar gol sem autor.
6. Gerar card compartilhável.
7. Criar jogador rápido.
8. Ver histórico simples.
9. Alterar tema do time.
10. Escolher modo de linguagem.

## Critério

Usuário casual deve conseguir registrar e compartilhar um jogo sem configurar scout.


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
