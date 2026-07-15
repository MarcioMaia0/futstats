---
title: ADR 011 Multi Modality Support
status: Draft
version: 1.1.0
owner: Product Architecture
last_update: 2026-07-14
related_documents:
  - ../API/Scheduled_Matches_API.md
  - ../Domain/Matches.md
  - ../Implementation/Database/Table_Spec_scheduled_matches.md
  - ../Implementation/Database/Table_Spec_matches.md
  - ../Implementation/Database/Table_Spec_team_modalities.md
  - ../Implementation/Database/Table_Spec_teams.md
---

# ADR 011: Multi Modality Support

## Status

Draft

## Contexto

O FUTSTATS nasce focado em futsal, mas deve ficar aberto para society e campo desde o início.

A principal variável entre as modalidades é a quantidade de jogadores titulares:

- futsal: 5
- society: 6 por padrão, ajustável no momento da escalação
- campo: 11

Na várzea, variações locais são comuns e o sistema precisa ser flexível sem virar bagunçado.

## Decisão

1. Jogos agendados (`scheduled_matches`) e partidas operacionais (`matches`) carregam a modalidade e a quantidade de titulares:
   - `modality`: enum canônico `FUTSAL`, `SOCIETY`, `FIELD`.
   - `starters_count`: inteiro com padrão derivado da modalidade, editável quando a regra local exigir.
2. Times possuem modalidades preferenciais em `team_modalities`, usadas para acelerar criação de jogos, filtros e sugestões, mas sem limitar partidas em outras modalidades.
3. `modality` não substitui `match_type` (amistoso, campeonato, festival etc.); são conceitos independentes.
4. Quando uma tela precisar de sugestão inicial de modalidade, deve preferir as modalidades declaradas em `team_modalities`; se não houver preferência, a tela pode usar um padrão de produto sem persistir isso em `teams`.
5. `teams` não deve possuir `default_modality`.

## Consequências

- Estatísticas, rankings e scout podem segmentar por modalidade sem migração estrutural futura.
- Escalação e confirmação validam titulares contra `starters_count`, não contra valor fixo no código.
- A UI casual permanece simples: modalidade só aparece quando ajuda o fluxo.
- Regras de negócio de cada modalidade podem evoluir a partir do mesmo enum.
- A modalidade real de uma partida sempre vem do jogo agendado ou da partida operacional, não das preferências do time.
