---
title: Teams Domain
status: Draft
version: 0.8.0
owner: Product Architecture
last_update: 2026-07-09
related_documents:
  - ../Frontend/Screens/Create_Team_Wizard.md
  - ../Frontend/Screens/Join_Team_Search.md
  - ../Frontend/Screens/Team_Settings.md
  - ../Implementation/Database/Table_Spec_teams.md
  - ../Implementation/Database/Table_Spec_team_members.md
  - ../Implementation/Database/Table_Spec_team_players.md
  - ../Implementation/Database/Table_Spec_user_team_roles.md
  - ../Implementation/Database/Table_Spec_venues.md
  - ../Implementation/Database/Table_Spec_team_social_connections.md
---

# Teams Domain

## Objetivo

Definir times como unidade central de organização.

## Regras

1. Time pode ser criado com nome mínimo.
2. Elenco completo não é obrigatório na criação.
3. Cores oficiais do time são identidade do time, não tema pessoal do usuário.
4. Histórico pertence ao time.
5. Time pode ter adversários locais privados.
6. Time pode ter múltiplos administradores.
7. Quem cria o time vira integrante canônico do próprio time e recebe papel inicial `DIRECTOR`.
8. O time só deve ser persistido ao concluir o fluxo de criação.
9. Escudo, localidade, quadra principal, cores e presença social são dados progressivos, não bloqueios do primeiro valor operacional.
10. O time pode declarar múltiplas modalidades preferenciais sem ficar limitado a elas.
11. Capacidade de mando é atributo estrutural do time, não atributo de uma partida.

## Casos de uso

- `CreateTeam`
- `UpdateTeamIdentity`
- `SetPrimaryVenue`
- `UpdateTeamColors`
- `UpdateTeamSettings`
- `ConnectTeamSocialAccount`
- `CreateJoinRequest`
- `ApproveJoinRequest`
- `AddDirector`
- `PromoteManagerRole`
- `ConfigurePrivacy`

## Observações de domínio

- `PRESIDENT` e `DIRECTOR` têm o mesmo peso operacional no estado atual do produto.
- A diferença entre esses papéis é de nomenclatura de negócio.
- `COMMITTEE` representa integrante interno do time sem papel de gestão e sem identidade esportiva de jogador.
- Quadra principal pode ser cadastrada na criação, mas continua opcional.
- O time pode ter presença social externa vinculada para ampliar distribuição de eventos e conteúdo do próprio time.
- A identidade oficial de cores do time pertence ao próprio `team`, usando a lógica de primeira, segunda e terceira cor.
- A forma como o app aplica essas cores visualmente pertence a `team_settings`.
- O domínio deve distinguir:
  - criação mínima do time;
  - completude operacional do time.
- O dominio deve distinguir:
  - pertencimento base ao time;
  - vinculo esportivo;
  - papel de gestao.
- `home_match_capability` deve aceitar:
  - `HAS_HOME_VENUE`
  - `NO_HOME_VENUE`
  - `NOT_DEFINED_YET`

## Regra de pertencimento ao time

- `team_members` e a camada canonica de pertencimento ao time.
- Toda pessoa que fizer parte do time em contexto interno deve existir primeiro como `team_member`.
- `team_members` liga `team` com `person`.
- `team_players` nao substitui `team_members`.
- `user_team_roles` nao substitui `team_members`.
- Leituras de papel ou funcao do integrante devem considerar combinacao de camadas:
  - `team_members`
  - `team_players`
  - `user_team_roles`
- Nem todo `team_member` e jogador.
- Nem todo `team_member` e gestao.
- Se a pessoa for jogador:
  - precisa existir `player` vinculado a sua `person`;
  - o vinculo esportivo do time nasce em `team_players`.
- Se a pessoa nao tiver `player`, ela pode continuar como integrante do time, mas nao como jogador.

## Regra de visibilidade: perfil do time

- O perfil do time funciona como vitrine pública por padrão.
- O público pode ver:
  - nome;
  - escudo;
  - cores principais;
  - modalidade principal, quando existir;
  - localidade macro do time;
  - descrição ou bio curta, quando existir;
  - links públicos de redes sociais do time;
  - feed público do time;
  - composição pública do time, incluindo:
    - jogadores;
    - comissão;
    - diretoria;
    - presidência.
  - posts públicos do time;
  - eventos públicos do time;
  - comentários e reações desses conteúdos públicos.
- O público não deve ver neste nível:
  - dados operacionais de gestão;
  - status de conexão das redes sociais;
  - preferência de publicação;
  - controles internos de administração;
  - status operacional de distribuição externa;
  - erros por plataforma;
  - ações internas de gestão sobre publicação.

## Regra de visibilidade: solicitações e fluxos internos

- `team_join_requests` nunca são públicas.
- Notificações operacionais do time nunca são públicas.
- Histórico de aprovação ou rejeição de solicitação não é público.
- Identidade de quem aprovou ou rejeitou pertence ao contexto interno de gestão.
- A pessoa solicitante pode ver apenas o estado final da própria solicitação e o resultado correspondente.
- Público geral e usuários sem contexto de gestão não devem ver decisões internas da diretoria sobre entrada no time.

## Regra de aprovação de entrada no time

Antes da aprovação existir, a entrada no time nasce como solicitação explícita iniciada pela própria pessoa.

## Regra de criação da solicitação

- A pessoa escolhe o time e confirma intenção de entrar.
- O sistema cria uma `team_join_request`, não o vínculo final.
- O domínio deve bloquear:
  - solicitação `PENDING` duplicada para a mesma pessoa no mesmo time;
  - solicitação de quem já faz parte do time.
- Solicitações antigas rejeitadas ou canceladas não bloqueiam nova tentativa por padrão.
- Após a criação, o domínio pode disparar `TeamJoinRequestCreated` para notificar a gestão do time.
- Essa notificação é efeito derivado e não pode bloquear a conclusão da solicitação.

## Regra de notificação da gestão

- O time precisa ser avisado de que existe uma nova solicitação pendente.
- No estado atual do produto, o alvo mínimo dessa notificação são pessoas com `DIRECTOR` ou `PRESIDENT`.
- `COMMITTEE` não entra como destinatário operacional por padrão.
- O objetivo da notificação é levar a pessoa gestora para a área onde poderá aprovar ou rejeitar a solicitação.
- Se uma pessoa da gestão resolver a solicitação antes das demais, as outras passam a ver apenas o resultado final, sem poder agir novamente.

Quando `team_join_requests` for `APPROVED`, a aprovação não deve ser cega.

Quem aprova deve definir a função inicial da pessoa no time.

## Regra de decisão única da solicitação

- A `team_join_request` só pode ser resolvida uma única vez.
- O primeiro `DIRECTOR` ou `PRESIDENT` que concluir uma ação válida consome a pendência.
- Não pode existir cenário em que uma pessoa aprove e outra rejeite a mesma solicitação depois.
- Depois da resolução:
  - a gestão restante vê somente o estado final;
  - a UI entra em modo somente leitura para aquela solicitação;
  - o sistema pode informar quem respondeu e qual foi a decisão.

## Regra de notificação para a pessoa solicitante

- Quando a solicitação sair de `PENDING`, a pessoa solicitante deve ser notificada.
- Se `APPROVED`:
  - a mensagem pode ser celebratória e específica, conforme `approved_membership_mode`.
- Se `REJECTED`:
  - a mensagem deve ser neutra;
  - a mensagem não deve expor quem rejeitou.
- A pessoa solicitante não precisa saber qual membro da gestão rejeitou.
- Em caso de aprovação, a pessoa solicitante pode saber o resultado final de entrada no time, mas isso não exige expor o aprovador.

## Funções visíveis na aprovação

- `Jogador`
- `Comissão`
- `Director`
- `President`

## Regras de persistência por função

- `Jogador`
  - não cria `user_team_roles`
  - cria ou reaproveita `team_member`
  - cria ou reativa vínculo esportivo da pessoa no time
- `Comissão`
  - cria ou reaproveita `team_member`
  - cria `user_team_roles.role = COMMITTEE`
  - não cria vínculo esportivo por si só
- `Director`
  - cria ou reaproveita `team_member`
  - cria `user_team_roles.role = DIRECTOR`
- `President`
  - cria ou reaproveita `team_member`
  - cria `user_team_roles.role = PRESIDENT`

## Regras de hierarquia

- `President` exclui `Director`, `Comissão` e `Jogador` como persistência redundante de papel.
- `Director` exclui `Comissão` como persistência redundante de papel.
- `Comissão` só existe quando a pessoa não for nem `President`, nem `Director`, nem `Jogador`.
- `Jogador` pode coexistir com `Director`.
- `Jogador` pode coexistir com `President`.
- `Jogador` não deve coexistir com `Comissão`.
- `Comissão` não deve coexistir com `Director` ou `President`.

## Regra de UX da aprovação

- A UI pode explicar que a pessoa aprovadora está configurando a função inicial do novo integrante.
- A UI deve deixar claro quando uma combinação é válida ou inválida.
- A UI não deve dar a entender que qualquer combinação marcada será persistida literalmente no banco.
