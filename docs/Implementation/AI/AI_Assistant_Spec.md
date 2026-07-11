---
title: AI Assistant Spec
status: Draft
version: 0.9.0
owner: Product Architecture
last_update: 2026-07-06
---

# AI Assistant Spec

## Objetivo

Especificar futuro assistente de IA.

## Casos de uso

- resumir partida;
- sugerir insights;
- explicar estatísticas;
- detectar padrões;
- gerar texto de post;
- sugerir próximos passos para diretor.

## Restrições

- IA não deve inventar dados.
- IA deve indicar quando análise é limitada por dados incompletos.
- IA não deve substituir decisão humana.
- IA deve respeitar privacidade.


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
