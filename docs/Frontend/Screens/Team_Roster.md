---
title: Screen: Team Roster
status: Review
version: 0.1.0
owner: Product Architecture
last_update: 2026-07-20
related_documents:
  - ../../API/Teams_API.md
  - ../../Implementation/Database/Table_Spec_team_members.md
  - ../../Implementation/Database/Table_Spec_team_players.md
  - ../../Implementation/Database/Table_Spec_team_player_frame_defaults.md
  - ../../Implementation/Database/Table_Spec_team_modalities.md
  - Team_Profile.md
  - Team_Settings.md
---

# Screen: Team Roster

## Objetivo

Exibir o elenco e os integrantes do time com dados vindos do banco, separando jogadores por modalidade e quadro quando aplicável.

Componente atual: `TeamRosterScreen`.

## Estado implementado

- A tela lê o roster do banco por serviço de time.
- Os filtros de modalidade exibem somente modalidades configuradas em `team_modalities`.
- Se o time tiver apenas uma modalidade configurada, os filtros podem ficar invisíveis.
- Jogadores são separados por quadro dentro da modalidade selecionada.
- Jogadores sem configuração em `team_player_frame_defaults` aparecem em "Sem quadro definido".
- O container de sem quadro fica invisível quando não houver jogadores nessa situação.
- A tela também lista presidência, diretoria e comissão.
- Avatares usam `avatar_url` quando disponível, com fallback para ícone.

## Regras de modalidade e quadro

- Um jogador pode atuar em mais de uma modalidade.
- Um jogador pode ter quadro diferente por modalidade.
- `team_modalities.default_match_frame_count` define se a modalidade trabalha por padrão com um ou dois quadros.
- `team_player_frame_defaults.default_frame_type` define o quadro esperado do jogador naquela modalidade.
- Quando a modalidade tiver apenas um quadro, a UI pode simplificar a separação visual.

## Criação rápida de jogador

- O fluxo rápido cria pessoa/atleta/vínculo com o time.
- Modalidades disponíveis no fluxo devem respeitar as modalidades configuradas no time.
- Ao selecionar uma modalidade, a UI mostra quadro quando a modalidade tiver mais de um quadro configurado.
- Posições devem usar componente de seleção multi-select.
- Etiquetas globais de posição devem ser usadas para resumos visuais, por exemplo `LD`, `VOL`, `ATA`.
- Após salvar, a tela deve recarregar ou atualizar o roster para refletir a persistência.

## Próxima evolução

Criar a tela de visualização/configuração de integrante do time.

Regras de permissão:

- jogadores e comissão podem alterar apenas suas próprias configurações e visualizar as dos outros;
- diretoria pode alterar jogadores, comissão e a própria configuração;
- presidência pode alterar todas as configurações.
