---
title: Advanced Match Implementation
status: Draft
version: 1.3.0
owner: Product Architecture
last_update: 2026-07-10
related_documents:
  - ../../API/Matches_API.md
  - ../../API/Scheduled_Matches_API.md
  - ../../Frontend/Screens/Match_Operation.md
  - ../Database/Table_Spec_matches.md
  - ../Database/Table_Spec_match_events.md
  - ../Database/Table_Spec_match_substitutions.md
  - ../Database/Table_Spec_match_operator_assignments.md
---

# Advanced Match Implementation

## Objetivo

Especificar a partida avancada para diretores, tecnicos e analistas.

## Contexto

O fluxo avancado existe para times que desejam organizar:

- adversario;
- venue;
- arbitragem;
- relacao de jogo;
- escalacao por quadro;
- operadores da partida;
- eventos ao vivo;
- estatisticas derivadas;
- revisao por video.

## Fluxo

1. Criar a partida operacional a partir de um jogo agendado ou sem agendamento previo.
2. Selecionar ou confirmar adversario operacional.
3. Selecionar ou confirmar venue.
4. Definir tipo de partida e categoria etaria.
5. Registrar operadores da partida quando aplicavel.
6. Fazer check-in dos atletas e relacionados do quadro.
7. Definir titulares arrastando atletas para dentro da quadra ou campo.
8. Salvar a escalacao do quadro.
9. Operar eventos ao vivo na mesma superficie visual.
10. Registrar substituicoes, gols, faltas e eventos derivados.
11. Finalizar a partida.
12. Revisar por video, se necessario.

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
- Como `matches` ja representa um quadro especifico, a salvacao de escalacao nao deve repetir `frame_type` em subrota filha.

## API sugerida

```http
POST /api/v1/matches
GET /api/v1/matches/{matchId}
PATCH /api/v1/matches/{matchId}
POST /api/v1/matches/{matchId}/lineups/save
POST /api/v1/matches/{matchId}/goals
POST /api/v1/matches/{matchId}/events
PATCH /api/v1/matches/{matchId}/events/{eventId}
POST /api/v1/matches/{matchId}/substitutions
POST /api/v1/matches/{matchId}/operator-assignments
PATCH /api/v1/matches/{matchId}/operator-assignments/{assignmentId}
POST /api/v1/matches/{matchId}/finish
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
