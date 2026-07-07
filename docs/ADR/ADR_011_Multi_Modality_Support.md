---
title: ADR 011 Multi Modality Support
status: Draft
version: 1.0.0
owner: Product Architecture
last_update: 2026-07-07
related_documents:
  - ../Domain/Matches.md
  - ../Implementation/Database/Table_Spec_matches.md
  - ../Implementation/Database/Table_Spec_teams.md
---

# ADR 011: Multi Modality Support

## Status

Draft

## Contexto

O FUTSTATS nasce focado em futsal, mas deve ficar aberto para society e campo desde o início. A principal variável entre as modalidades é a quantidade de jogadores titulares (futsal: 5, society: 7, campo: 11), com variações comuns na várzea (fut7, fut8).

## Decisão

1. Partidas (incluindo agendadas — a própria tabela `matches` cobre agendamento via `status`) carregam a modalidade e a quantidade de titulares:
   - `modality`: enum canônico `FUTSAL`, `SOCIETY`, `FIELD`.
   - `starters_count`: inteiro com padrão derivado da modalidade (`FUTSAL` = 5, `SOCIETY` = 7, `FIELD` = 11), editável para variações locais.
2. Times possuem `default_modality`, herdada na criação de partidas para não adicionar fricção ao fluxo casual.
3. `modality` não substitui `match_type` (amistoso, campeonato etc.); são conceitos independentes.
4. O MVP opera com `FUTSAL` como padrão; nenhuma tela exige escolher modalidade para registrar partida.

## Consequências

- Estatísticas, rankings e scout podem segmentar por modalidade sem migração estrutural futura.
- Escalação e check-in validam titulares contra `starters_count`, não contra valor fixo no código.
- A UI casual permanece simples: modalidade só aparece quando o usuário quiser mudá-la.
- Regras de negócio de cada modalidade (duração, quadros) podem evoluir a partir do mesmo enum.
