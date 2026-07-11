---
title: Progressive Disclosure Detail
status: Draft
version: 0.9.0
owner: Product Architecture
last_update: 2026-07-06
---

# Progressive Disclosure Detail

## Objetivo

Detalhar progressive disclosure.

## Regra central

Mostrar primeiro o necessário para o uso casual. Mostrar avançado somente quando o usuário procurar.

## Exemplos

- Campo de quadra em "mais opções".
- Scout em aba avançada.
- Arbitragem opcional.
- Plus/Minus apenas quando há dados suficientes.


## Critérios de qualidade

- O fluxo deve funcionar para usuário casual sem exigir cadastro excessivo.
- Recursos avançados devem ser progressivos e opcionais.
- O comportamento deve preservar consistência entre frontend, backend, API e banco.
- Todas as entidades técnicas, payloads, enums e nomes internos devem usar inglês.
- Textos exibidos ao usuário devem passar por camada de linguagem/configuração.

## Regras para IA

Ao usar este documento como contexto para implementação, a IA deve:
1. preservar o princípio de uso casual simples;
2. não criar campos obrigatórios que bloqueiem o primeiro valor operacional;
3. respeitar separação entre dado canônico e texto de interface;
4. manter compatibilidade com evolução futura;
5. sugerir migrations, testes e endpoints quando alterar domínio.
