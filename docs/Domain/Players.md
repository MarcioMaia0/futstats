---
title: Players Domain
status: Draft
version: 1.0.0
owner: Product Architecture
last_update: 2026-07-09
related_documents: []
---

# Players Domain

## Objetivo

Representar atletas e seu histórico esportivo.

## Regras

1. Player é diferente de user.
2. Person é diferente de user e diferente de player.
3. Player sempre aponta para uma `person`.
4. User representa presença autenticada na plataforma, não o cadastro esportivo em si.
5. Player pode nascer incompleto.
6. Jogador pode atuar em vários times.
7. Avulsos devem ser aceitos sem burocracia.
8. Estatísticas permanecem no histórico.
9. Nem todo player operacional precisa gerar projeções estatísticas imediatamente.

## Casos de uso

- Criar jogador rápido.
- Reivindicar perfil.
- Vincular a time.
- Registrar avulso.
- Ver estatísticas.
- Ver timeline esportiva.

## Modelo canônico

- `persons`
  - identidade canônica da pessoa;
- `users`
  - presença da pessoa dentro do app, vinculada 1:1 a `auth.users`;
- `players`
  - identidade esportiva opcional da pessoa;
- `team_members`
  - pertencimento contextual da pessoa a um time;
- `team_players`
  - vínculo oficial do atleta com um time;
- `match_players`
  - participação do atleta em uma partida específica;
- `match_staff`
  - staff efetivo da partida, separado de atleta relacionado.

## Situações válidas

1. Pessoa com conta e com player.
2. Pessoa com conta e sem player.
3. Pessoa sem conta e com player.
4. Pessoa sem conta, criada rapidamente para virar player de uso operacional.

## Regra de player canônico

- O `player` canônico da pessoa é o `player` vinculado à `person` do usuário real que usa o app.
- `players` criados operacionalmente por um time, sem usuário real reivindicando, são válidos para:
  - elenco;
  - escalação;
  - gols;
  - substituições;
  - histórico bruto da partida.
- presença em compromisso não pertence ao `player`; ela pertence ao integrante contextual do time.
- Esses `players` operacionais não precisam gerar automaticamente todas as projeções avançadas do perfil do atleta.

## Regra de projeção estatística

- Fato bruto de partida pode ser persistido para qualquer `player` operacional válido.
- Projeções ricas do perfil do atleta devem ser priorizadas para `players` canônicos já reivindicados.
- Se um atleta operacional nunca for reivindicado por uma pessoa real, o sistema não é obrigado a manter:
  - `player_profile_summary`
  - `player_statistics_summary`
  - `player_statistics_by_modality`
  - `player_statistics_by_team_modality`
  - `player_performance_series`
  - demais leituras avançadas equivalentes
- Quando um atleta operacional for reivindicado e vinculado ao `player` canônico da pessoa, o sistema deve poder reconstruir essas projeções a partir dos fatos brutos já existentes.

## Regras de vínculo

- Um atleta pode existir globalmente sem pertencer a nenhum time.
- Uma pessoa pode pertencer a um time sem ser atleta, via `team_members`.
- Um atleta pode pertencer a vários times via `team_players`.
- Um atleta avulso de uma partida não deve virar `team_player` automaticamente.
- O mesmo `player` pode acumular histórico em partidas de times diferentes.
- Papéis de gestão do time não ficam em `players`; ficam em `user_team_roles`.

## Regra de merge por reivindicação

- Quando um usuário entra no app e é aprovado em um time que já possuía um atleta operacional correspondente, o sistema deve permitir vincular esse atleta operacional ao `player` canônico do usuário.
- Nesse cenário:
  - o `player` do usuário é o destino canônico;
  - o `player` operacional do time é a origem temporária;
  - o `team_member` operacional do time também pode ser origem contextual temporária;
  - o sistema deve reatribuir os registros históricos da origem para o destino;
  - o sistema deve consolidar o vínculo contextual do time em favor da pessoa real;
  - o sistema não deve apagar o histórico do destino;
  - o sistema não deve somar estatísticas manualmente em tabelas derivadas.
- A consolidação correta é:
  - reatribuir os fatos operacionais;
  - resolver conflitos de unicidade;
  - reconstruir projeções derivadas do atleta consolidado.
- Depois da consolidação contextual do time, o `integrante de origem do time (source_team_member)` não precisa ser preservado como registro operacional separado.
- Isso permite que a mesma pessoa preserve histórico vindo de múltiplos times que tenham criado registros operacionais antes de ela entrar no app.

## Relação com partida

- Jogadores relacionados para o jogo ficam em `match_players`.
- Técnico efetivo da partida fica em `match_staff`.
- Presença/ausência confirmada fica em `match_attendance_responses`, ligada ao integrante contextual do time.
- Posições efetivamente usadas na partida ficam em `match_players_positions`.

## Leitura de perfil

- perfil declarado do atleta é diferente de timeline do atleta;
- timeline do atleta é diferente de estatística agregada;
- o perfil pode combinar:
  - identidade esportiva declarada;
  - números consolidados;
  - fatos cronológicos relevantes.

Ver também:

- `../Domain/Identity.md`
- `../Implementation/Database/Table_Spec_persons.md`
- `../Implementation/Database/Table_Spec_users.md`
- `../Implementation/Database/Table_Spec_players.md`
