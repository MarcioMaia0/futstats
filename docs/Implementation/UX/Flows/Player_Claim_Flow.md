---
title: Player Claim Flow
status: Draft
version: 1.1.0
owner: Product Architecture
last_update: 2026-07-10
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
- Quando o atleta operacional existir dentro de um time, o sistema também deve consolidar o vínculo contextual desse time.

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
   - identifica o `source_team_member_id`, quando a origem vier de um time;
   - identifica ou cria o `target_team_member_id` da pessoa real naquele time;
   - reatribui fatos históricos da origem para o destino;
   - consolida o vínculo contextual do time em favor da pessoa real;
   - resolve conflitos de unicidade;
   - reconstrói as projeções derivadas do destino.

## Regras específicas

- O fluxo deve preservar o histórico esportivo já existente do usuário.
- O fluxo deve preservar o histórico esportivo que o time registrou antes da reivindicação.
- O merge deve atuar sobre fatos operacionais, não sobre resumos estatísticos.
- Se o atleta já tiver histórico em outros times, esse histórico não pode ser substituído.
- O resultado final deve ser um único `player_id` canônico para leitura futura do atleta.

## Tabelas operacionais mínimas do merge

- `team_members`
- `team_players`
- `match_players`
- `match_goals.player_id`
- `match_goals.assist_player_id`
- `match_attendance_responses`, quando dependente do integrante contextual de origem
- `match_ratings.target_player_id`
- `player_modalities`
- `player_positions`

## Conflitos esperados

- `team_members`
  - se a pessoa real já possuir integrante ativo no mesmo time, a origem contextual não pode continuar como duplicidade ativa.
- `team_players`
  - se destino já estiver ativo no mesmo time, não pode nascer vínculo ativo duplicado.
- `match_players`
  - se origem e destino já coexistirem na mesma partida/time, a camada de contexto da partida precisa ser consolidada.
- `match_attendance_responses`
  - se presença histórica estiver ligada ao integrante operacional do time, ela deve ser reapontada para o integrante real consolidado.
- Dependências por `match_player_id`
  - quando houver consolidação de `match_players`, também devem ser reapontadas:
    - `match_players_positions`
    - `match_events`
    - `match_substitutions`

## Pós-merge

- O `player` de destino vira a única referência canônica para leitura do atleta.
- As projeções do perfil do atleta devem ser reconstruídas.
- A operação deve deixar trilha auditável.
- O `integrante de origem do time (source_team_member)` não precisa ser mantido como registro útil separado depois da consolidação.

## Critérios de aceite

- O fluxo principal está definido.
- O destino canônico do merge está explícito.
- As tabelas mínimas afetadas estão listadas.
- Os conflitos de unicidade principais estão previstos.
- A regra de rebuild das projeções após merge está explícita.
