---
title: Advanced Match Implementation
status: Draft
version: 0.9.0
owner: Product Architecture
last_update: 2026-07-06
---

# Advanced Match Implementation

## Objetivo

Especificar a partida avançada para diretores, técnicos e analistas.

## Contexto

O fluxo avançado existe para times que desejam organizar elenco, quadra, adversário, árbitro, relação de jogo, escalação, eventos e estatísticas.

## Fluxo

1. Criar ou selecionar partida agendada.
2. Selecionar adversário local.
3. Selecionar venue.
4. Definir tipo de partida.
5. Definir quadro.
6. Fazer check-in dos atletas.
7. Definir titulares.
8. Registrar eventos.
9. Finalizar partida.
10. Gerar relatório.

## Regras

- O fluxo avançado não deve substituir o fluxo rápido.
- Qualquer etapa avançada pode ser ignorada se não for essencial.
- Estatísticas devem indicar limitações quando dados estiverem incompletos.
- Alterações de eventos devem recalcular placar e estatísticas derivadas.

## API sugerida

```http
POST /matches
POST /matches/{matchId}/appearances
POST /matches/{matchId}/lineup
POST /matches/{matchId}/events
POST /matches/{matchId}/finish
GET /matches/{matchId}/report
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
