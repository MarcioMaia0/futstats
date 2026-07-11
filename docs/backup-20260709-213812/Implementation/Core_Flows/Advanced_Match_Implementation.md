---
title: Advanced Match Implementation
status: Draft
version: 1.2.0
owner: Product Architecture
last_update: 2026-07-09
---

# Advanced Match Implementation

## Objetivo

Especificar a partida avancada para diretores, tecnicos e analistas.

## Contexto

O fluxo avancado existe para times que desejam organizar elenco, quadra, adversario, arbitragem, relacao de jogo, escalacao, eventos e estatisticas.

## Fluxo

1. Criar ou selecionar partida agendada.
2. Selecionar adversario local.
3. Selecionar venue.
4. Definir tipo de partida.
5. Definir quadro.
6. Fazer check-in dos atletas.
7. Selecionar relacionados do quadro.
8. Definir titulares arrastando atletas para dentro da quadra ou campo.
9. Salvar a escalacao do quadro.
10. Operar eventos ao vivo na mesma superficie visual.
11. Finalizar partida.
12. Revisar por video, se necessario.
13. Gerar relatorio.

## Regras

- O fluxo avancado nao deve substituir o fluxo rapido.
- Qualquer etapa avancada pode ser ignorada se nao for essencial.
- Estatisticas devem indicar limitacoes quando dados estiverem incompletos.
- Alteracoes de eventos devem recalcular placar e estatisticas derivadas.
- A mesma base de tela deve servir para:
  - escalacao;
  - operacao ao vivo;
  - revisao por video.
- O gesto de arrastar nao deve abrir evento automaticamente.
- Microfluxos de evento devem nascer de selecao intencional do ator em quadra ou campo.
- `Ataque (ATTACK)` e `Defesa (DEFENSE)` devem funcionar como pre-filtro semantico dos microfluxos.
- `Substituicao (SUBSTITUTION)` deve nascer de gesto de saida da area jogavel.
- Todo microfluxo deve aceitar salvamento antecipado com persistencia parcial do evento.

## API sugerida

```http
POST /matches
POST /matches/{matchId}/appearances
POST /matches/{matchId}/lineup
POST /matches/{matchId}/events
POST /matches/{matchId}/finish
GET /matches/{matchId}/report
```

## Criterios de qualidade

- O fluxo deve funcionar para usuario casual sem exigir cadastro excessivo.
- Recursos avancados devem ser progressivos e opcionais.
- O comportamento deve preservar consistencia entre frontend, backend, API e banco.
- Todas as entidades tecnicas, payloads, enums e nomes internos devem usar ingles.
- Textos exibidos ao usuario devem passar por camada de linguagem/configuracao.

## Regras para IA

Ao usar este documento como contexto para implementacao, a IA deve:
1. preservar o principio de uso casual simples;
2. nao criar campos obrigatorios que bloqueiem o primeiro valor percebido;
3. respeitar separacao entre dado canonico e texto de interface;
4. manter compatibilidade com evolucao futura;
5. sugerir migrations, testes e endpoints quando alterar dominio.
