---
title: Player Claim Flow
status: Draft
version: 1.0.0
owner: Product Architecture
last_update: 2026-07-09
related_documents:
  - ../../../API/Players_API.md
  - ../../../API/Teams_API.md
  - ../../../Domain/Players.md
  - ../../Database/Table_Spec_players.md
---

# Player Claim Flow

## Objetivo

Definir o fluxo de reivindicação de atleta quando já existe histórico operacional criado por times antes de a pessoa entrar no app.

## Contexto

- Um diretor pode cadastrar atletas do elenco antes que esses atletas criem conta no FUTSTATS.
- Esses atletas passam a existir como `person + player` operacional.
- Depois, a pessoa real pode entrar no app, criar conta e solicitar entrada no time.
- Ao aprovar, a gestão pode vincular a pessoa real ao atleta operacional já existente.

## Regra central

- O `player` do usuário real é o destino canônico da identidade esportiva.
- O `player` operacional criado pelo time é origem temporária.
- O sistema deve reatribuir fatos operacionais da origem para o destino.
- O sistema não deve copiar nem somar manualmente estatísticas derivadas.

## Modos iniciais

- `CLAIM_ONLY`
  - a pessoa reivindica o próprio atleta sem merge de histórico externo.
- `MERGE_OPERATIONAL_PLAYER`
  - a pessoa reivindica o atleta e incorpora histórico de um `player` operacional já existente.

## Fluxo conceitual

1. Diretor cria atleta operacional no time.
2. Atleta operacional passa a participar de elenco, partidas, gols e histórico bruto.
3. Pessoa real cria conta no app.
4. Pessoa solicita entrada no time.
5. Gestão aprova a solicitação com modo que inclua `PLAYER`.
6. Gestão escolhe uma das opções:
   - criar/reusar o `player` do solicitante sem merge; ou
   - vincular ao atleta operacional já existente no time.
7. Se houver vínculo com atleta operacional:
   - o backend garante o `target_player_id` do usuário;
   - identifica o `source_player_id` operacional;
   - reatribui fatos históricos da origem para o destino;
   - resolve conflitos de unicidade;
   - reconstrói as projeções derivadas do destino.

## Regras específicas

- O fluxo deve preservar o histórico esportivo já existente do usuário.
- O fluxo deve preservar o histórico esportivo que o time registrou antes da reivindicação.
- O merge deve atuar sobre fatos operacionais, não sobre resumos estatísticos.
- Se o atleta já tiver histórico em outros times, esse histórico não pode ser substituído.
- O resultado final deve ser um único `player_id` canônico para leitura futura do atleta.

## Tabelas operacionais mínimas do merge

- `team_players`
- `match_players`
- `match_goals.player_id`
- `match_goals.assist_player_id`
- `match_attendance_responses`
- `match_ratings.target_player_id`
- `player_modalities`
- `player_positions`
- `teams.default_coach_player_id`, quando aplicável

## Conflitos esperados

- `team_players`
  - se destino já estiver ativo no mesmo time, não pode nascer vínculo ativo duplicado.
- `match_players`
  - se origem e destino já coexistirem na mesma partida/time, a camada de contexto da partida precisa ser consolidada.
- Dependências por `match_player_id`
  - quando houver consolidação de `match_players`, também devem ser reapontadas:
    - `match_players_positions`
    - `match_events`
    - `match_substitutions`

## Pós-merge

- O `player` de destino vira a única referência canônica para leitura do atleta.
- As projeções do perfil do atleta devem ser reconstruídas.
- A operação deve deixar trilha auditável.

## Critérios de aceite

- O fluxo principal está definido.
- O destino canônico do merge está explícito.
- As tabelas mínimas afetadas estão listadas.
- Os conflitos de unicidade principais estão previstos.
- A regra de rebuild das projeções após merge está explícita.
