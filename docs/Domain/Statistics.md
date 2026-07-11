---
title: Statistics Domain
status: Draft
version: 1.0.0
owner: Product Architecture
last_update: 2026-07-09
related_documents: []
---

# Statistics Domain

## Objetivo

Transformar dados factuais do produto em indicadores úteis sem inventar precisão que o sistema ainda não sustenta.

## Camadas

1. Placar e gols.
2. Jogadores e assistências registradas.
3. Escalações e participação por partida.
4. Scout.
5. Inteligência.

## Regras

1. Estatística usa dados disponíveis.
2. Dado ausente não invalida uso casual.
3. Métricas avançadas exigem pré-condições.
4. Rankings devem considerar contexto.
5. Alterações recalculam agregados.
6. O domínio deve distinguir estatística completa de estatística parcial.
7. O perfil de atleta no estado atual do produto deve priorizar números defensáveis: partidas, titularidade, gols, assistências registradas, resultados e recortes por modalidade/time.

## Plus/Minus

Calculado apenas quando escalações e substituições forem suficientes.

## Estatísticas de atleta no estado atual do produto

Conjunto mínimo confiável:

- partidas jogadas;
- partidas como titular;
- partidas saindo do banco/reserva;
- partidas como vínculo oficial do time;
- partidas como avulso;
- vitórias;
- empates;
- derrotas;
- gols marcados;
- assistências registradas;
- gols contra;
- quebra por modalidade;
- quebra por time.

## Interpretação do perfil esportivo

O sistema pode inferir uma tendência esportiva do atleta quando houver base suficiente.

Essa inferência deve combinar:

- posição declarada por modalidade;
- posição historicamente exercida;
- assinatura estatística observada.

## Exemplos de tendência

- `OFFENSIVE`
  - maior peso para gols, finalizações, assistências e presença ofensiva.
- `DEFENSIVE`
  - maior peso para desarmes, interceptações, bloqueios e ações defensivas.
- `BALANCED`
  - distribuição mais equilibrada entre ações de ataque e defesa.
- `GOALKEEPER`
  - maior peso para defesas, gols sofridos e ações típicas do goleiro.

## Regras da inferência

- a inferência é contextual e pode variar por modalidade;
- a inferência também pode variar por time, quando o histórico justificar;
- a inferência não deve sobrescrever o que o atleta declara que joga;
- a inferência existe para ordenar relevância visual e leitura analítica, não para rotular de forma rígida.

## Limitações explícitas do estado atual do produto

- assistência não registrada não pode ser inferida;
- minutos jogados não existem sem camada temporal suficiente;
- scout fino depende de `match_events` e evolução futura;
- plus/minus depende de substituições e contexto temporal mais completo.
