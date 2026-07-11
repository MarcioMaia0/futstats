---
title: Source of Truth Map
status: Approved
version: 1.3.0
owner: Product Architecture
last_update: 2026-07-10
related_documents:
  - ../Documentation_Index.md
  - ../Product/Product_Overview.md
  - ../Product/Product_Principles.md
  - ../Product/Launch_Scope_Snapshot.md
  - ../API/Auth_API.md
  - ../API/Scheduled_Matches_API.md
  - ../API/Matches_API.md
  - ../Frontend/Screens/Auth.md
  - ../Frontend/Screens/Welcome.md
  - ../Frontend/Screens/Complete_Profile.md
  - ../Frontend/Screens/Start_Path_Selection.md
  - ../Frontend/Reusable_Building_Blocks.md
  - ../Implementation/Database/Table_Spec_users.md
  - ../Implementation/Database/Table_Spec_team_members.md
  - ../Implementation/Database/Table_Spec_scheduled_matches.md
  - ../Implementation/Database/Table_Spec_matches.md
---

# Source of Truth Map

## Objetivo

Definir onde cada assunto deve ser documentado e como diferenciar fonte canônica de material complementar ou histórico.

## Fontes oficiais

| Assunto | Fonte oficial | Papel |
|---|---|---|
| Visão geral do produto | `Product/Product_Overview.md` | Canônico |
| Visão estratégica | `Product/Product_Vision.md` | Canônico |
| Princípios permanentes do produto | `Product/Product_Principles.md` | Canônico |
| Domínios de negócio | `Domain/README.md` + documento do domínio específico | Canônico |
| Princípios arquiteturais | `Architecture/Architecture_Principles.md` | Canônico |
| Arquitetura de backend | `Backend/Backend_Architecture.md` | Canônico |
| Convenções gerais de API | `API/API_Conventions.md` | Canônico |
| Contratos por domínio de API | `API/*.md` do domínio correspondente | Canônico |
| Banco em alto nível | `Database/Tables.md`, `Database/Relationships.md` e `Database/Entity_Relationships.md` | Canônico de mapa |
| Banco em detalhe | `Implementation/Database/Table_Spec_*.md` | Canônico de contrato |
| Frontend reutilizável | `Frontend/Reusable_Building_Blocks.md` | Canônico |
| Telas e UX por fluxo | `Frontend/Screens/*.md` | Canônico da superfície |
| Detalhamento técnico de endpoint | `Implementation/API/Endpoint_Detail_*.md` | Complementar normativo |
| Serviços de aplicação | `Implementation/Services/*.md` | Complementar normativo |
| Recorte inicial de lançamento | `Product/Launch_Scope_Snapshot.md` | Histórico útil |
| Ideias futuras não fechadas | `Future_Ideas/*.md` | Histórico planejado |

## Fontes canônicas por recorte crítico

| Recorte | Fonte principal |
|---|---|
| Identidade, autenticação e bootstrap de sessão | `API/Auth_API.md` |
| Presença autenticada da pessoa | `Implementation/Database/Table_Spec_users.md` |
| Pessoa canônica | `Implementation/Database/Table_Spec_persons.md` |
| Perfil esportivo do atleta | `Implementation/Database/Table_Spec_players.md` |
| Pertencimento ao time | `Implementation/Database/Table_Spec_team_members.md` |
| Vínculo esportivo oficial com o time | `Implementation/Database/Table_Spec_team_players.md` |
| Papéis de gestão do time | `Implementation/Database/Table_Spec_user_team_roles.md` |
| Agenda de jogos | `API/Scheduled_Matches_API.md` + `Implementation/Database/Table_Spec_scheduled_matches.md` |
| Resposta de presença | `Implementation/Database/Table_Spec_match_attendance_responses.md` |
| Partida operacional | `API/Matches_API.md` + `Implementation/Database/Table_Spec_matches.md` |
| Escalação e atletas relacionados | `Implementation/Database/Table_Spec_match_players.md` |
| Eventos e scout da partida | `Implementation/Database/Table_Spec_match_events.md` |
| Substituições | `Implementation/Database/Table_Spec_match_substitutions.md` |
| Gols | `Implementation/Database/Table_Spec_match_goals.md` |
| Operação colaborativa ao vivo | `Implementation/Match_Operation_Technical_Contract.md` + `Implementation/Database/Table_Spec_match_operator_assignments.md` |
| Staff efetivo da partida | `Implementation/Database/Table_Spec_match_staff.md` |
| Arbitragem da partida | `Implementation/Database/Table_Spec_match_referees.md` |
| Cadastro mestre de árbitros | `Implementation/Database/Table_Spec_referees.md` |
| Avaliação da arbitragem | `Implementation/Database/Table_Spec_referee_reviews.md` |
| Cards compartilháveis da partida | `Implementation/Database/Table_Spec_match_cards.md` + `Implementation/Core_Flows/Share_Card_Implementation.md` |
| Notas da partida | `Implementation/Database/Table_Spec_match_ratings.md` |
| Adversários privados | `Implementation/Database/Table_Spec_local_opponents.md` + `Implementation/Database/Table_Spec_local_opponent_players.md` |

## Regra principal

Evitar duplicação. Quando um documento precisar citar outro assunto, deve referenciar a fonte oficial em vez de reescrever o contrato.

## Regra para banco

- `Database/Tables.md`, `Database/Relationships.md` e `Database/Entity_Relationships.md` são mapas de alto nível.
- A verdade detalhada de colunas, enums, constraints, checks, unicidade e regras semânticas está nas `Implementation/Database/Table_Spec_*.md`.
- Em caso de conflito entre mapa e especificação detalhada, prevalece a `Table_Spec_*`.

## Regra para telas e API

- A tela define UX, ordem de exibição, campos visíveis e comportamento de superfície.
- A API define contrato de entrada e saída.
- A tabela define persistência e invariantes semânticos.
- Nenhuma dessas camadas deve substituir a outra.

## Regra para materiais de recorte inicial

- `Launch_Scope_Snapshot.md` e documentos semelhantes não definem sozinhos o estado atual do produto.
- Eles continuam úteis quando preservam decisões, requisitos ou trade-offs que ainda não foram totalmente migrados.
- Se houver conflito entre um documento de recorte inicial e uma fonte canônica atualizada, prevalece a fonte canônica.
- Um documento com origem em recorte inicial só pode ser removido quando seu conteúdo único já estiver absorvido em outra fonte melhor organizada.

## Regra para ideias futuras

- Tudo que ainda não estiver fechado e for apenas direção, hipótese ou evolução futura deve ficar em `Future_Ideas/`.
- `Future_Ideas/` não substitui contrato atual.
- Se um item sair de ideia e virar decisão, ele deve ser migrado para a fonte canônica correspondente.

## Regra complementar para onboarding

- Regras de decisão de fluxo após autenticação pertencem a `API/Auth_API.md`.
- Telas devem descrever UX e campos, sem redefinir a regra de roteamento fora de `GET /api/v1/me`.
- `Start_Path_Selection` define a intenção inicial de uso, mas não substitui contratos de persistência, API ou autorização.
- `Forgot_Password` deve apontar para `POST /api/v1/auth/forgot-password` sem redefinir políticas de segurança.
- `Phone_Otp` deve apontar para `POST /api/v1/auth/phone/request-code`, `POST /api/v1/auth/phone/verify-code` e usar `GET /api/v1/me` para a decisão de onboarding.
- Persistência de `username` e `display_name` pertence a `Implementation/Database/Table_Spec_users.md`.
- Antes de criar novo componente, hook ou fluxo visual, consultar `Frontend/Reusable_Building_Blocks.md`.
