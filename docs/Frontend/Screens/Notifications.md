---
title: Screen: Notifications
status: Review
version: 0.1.0
owner: Product Architecture
last_update: 2026-07-20
related_documents:
  - ../../API/Teams_API.md
  - ../../Implementation/Database/Table_Spec_notifications.md
  - ../../Implementation/Database/Table_Spec_team_join_requests.md
  - Team_Roster.md
---

# Screen: Notifications

## Objetivo

Exibir notificações operacionais e permitir que a gestão responda solicitações de entrada no time.

Componente atual: `NotificationsScreen`.

## Estado implementado

- A tela exibe solicitações de entrada no time.
- O modal de solicitação tem rolagem interna para funcionar em aparelhos na horizontal.
- A aprovação permite marcar papéis:
  - jogador;
  - comissão;
  - diretoria;
  - presidência.
- Quando `Jogador` é selecionado, a UI exibe modalidades configuradas no time e seleção de quadro por modalidade.
- A UI usa a mesma lógica visual de modalidade/quadro da criação/configuração de time.

## Regras

- O modal nunca deve ficar maior que a tela sem opção de rolagem.
- Só modalidades configuradas no time devem aparecer.
- Se a modalidade tiver apenas um quadro configurado, a UI pode simplificar a seleção.
- Aprovar deve persistir papéis e, quando houver jogador, configurar o vínculo esportivo necessário para a tela de elenco.
- Dispensar deve encerrar a pendência sem criar vínculo.
