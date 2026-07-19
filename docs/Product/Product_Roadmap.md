---
title: Product Roadmap
status: Draft
version: 1.0.0
owner: Product Architecture
last_update: 2026-07-13
related_documents:
  - Product_Vision.md
  - Product_Principles.md
  - ../Implementation/UX/Flows/Onboarding_Flow.md
  - ../Frontend/Screens/Login.md
  - ../Frontend/Screens/Sign_Up.md
  - ../Frontend/Screens/Start_Path_Selection.md
  - ../Frontend/Screens/Create_Team_Wizard.md
  - ../Frontend/Screens/Join_Team_Search.md
  - ../Frontend/Screens/Lineup_And_Live_Operation.md
  - ../Implementation/Match_Operation_Technical_Contract.md
---

# Product Roadmap

## Objetivo

Organizar a evolução do FUTSTATS pela ordem lógica da jornada do usuário e pela complexidade técnica real de cada fase.

Este roadmap não é uma lista de MVP reduzido. Ele é uma sequência de construção para transformar a versão rica do produto em entregas coerentes, sem quebrar o fluxo principal.

## Princípios do Roadmap

1. O desenvolvimento deve seguir o fluxo natural do usuário.
2. O app deve entregar valor antes de exigir comportamento analítico.
3. A versão rica do produto deve continuar documentada, mesmo quando a implementação for faseada.
4. Cada fase deve fechar tela, API, tabelas, serviços, permissões e estados antes de avançar.
5. Recursos avançados não devem bloquear o primeiro uso, mas também não devem ser apagados da arquitetura.

## Fase 0: Fundação Técnica e Visual

### Objetivo

Preparar a base do app para que as próximas telas sejam implementadas com consistência visual, técnica e de domínio.

### Entregas

- Projeto mobile em React Native/Expo ou stack definida.
- Tema dark oficial do FUTSTATS.
- Tema light preparado como alternativa futura.
- Tokens de cor, tipografia, espaçamento, botões, inputs e cards.
- Background pattern oficial.
- Componentes visuais base:
  - botões;
  - inputs;
  - cards;
  - escudos;
  - avatar;
  - recorte inclinado;
  - card de atleta.
- Integração inicial com Supabase:
  - Auth;
  - Postgres;
  - Storage;
  - Realtime Broadcast como caminho preferencial para operação ao vivo.
- Estrutura de navegação.
- Estrutura de i18n/dialetos preparada, sem travar textos finais.

### Critério de avanço

A equipe consegue criar telas novas usando os mesmos tokens, componentes e linguagem visual, sem redesenhar o sistema a cada fluxo.

## Fase 1: Entrada no App e Identidade

### Objetivo

Implementar o primeiro contato da pessoa com o FUTSTATS.

### Fluxo do usuário

1. abrir app;
2. ver splash/boas-vindas;
3. entrar;
4. criar conta;
5. recuperar senha;
6. entrar sem conta;
7. resolver sessão e perfil mínimo.

### Entregas

- Tela de boas-vindas.
- Tela de login.
- Tela de criar conta.
- Tela de esqueci minha senha.
- Entrada sem conta.
- Modal de cadastro obrigatório para ações que geram registro.
- Login por e-mail e senha.
- Login social Google.
- Login social Apple.
- Integração com `auth.users`.
- Criação de `persons`.
- Criação de `public.users`.
- Criação de `user_preferences` com defaults.
- `GET /api/v1/me` como leitura central de sessão, perfil e onboarding.
- `Complete Profile` quando necessário.

### Fora desta fase

- Cadastro esportivo fino do atleta.
- Criação de time.
- Solicitação de entrada em time.
- Home completa.

### Critério de avanço

A pessoa consegue entrar no app com conta, criar conta, recuperar acesso, entrar como visitante e cair no próximo passo correto do onboarding.

## Fase 2: Escolha Inicial do Caminho

### Objetivo

Implementar a tela que pergunta o que a pessoa quer fazer primeiro sem transformar isso em tipo fixo de usuário.

### Fluxo do usuário

1. pessoa autenticada conclui entrada;
2. app consulta `GET /api/v1/me`;
3. se for primeiro acesso, abre `Start Path Selection`;
4. pessoa escolhe:
   - criar um time;
   - entrar em um time;
   - explorar primeiro.

### Entregas

- Tela `Start Path Selection`.
- Registro de:
  - `users.start_path_completed_at`;
  - `users.last_start_path_choice`.
- Encaminhamento para `Create Team Wizard`.
- Encaminhamento para `Join Team Search`.
- Encaminhamento para Home neutra.
- Rastreio leve de interesse preparado para eventos de busca e visualização.

### Primeiro caminho a implementar

O primeiro caminho prático desta fase deve ser `Criar um time`, porque ele estabelece:

- criação de entidade central do produto;
- vínculo inicial de gestão;
- identidade visual do time;
- base para agenda, elenco, partidas e comunidade.

### Critério de avanço

A pessoa autenticada consegue escolher o caminho inicial e ser encaminhada corretamente, sem persistência indevida antes do fluxo seguinte.

## Fase 3: Criar Um Time

### Objetivo

Permitir que uma pessoa crie um time com o mínimo obrigatório, sem gerar registro órfão quando abandona o fluxo.

### Fluxo do usuário

1. pessoa escolhe `Criar um time`;
2. abre wizard step by step;
3. informa nome do time;
4. opcionalmente informa escudo;
5. opcionalmente informa cores, modalidades, quadra principal, localidade e redes sociais;
6. conclui criação;
7. sistema cria time e vínculo de gestão.

### Entregas

- `Create Team Wizard`.
- `StepWizardShell`.
- Etapa de nome do time.
- Etapa de escudo do time.
- Etapa de dados técnicos.
- Cores do time:
  - `first_color`;
  - `second_color`;
  - `third_color`.
- Modalidades preferenciais:
  - `FUTSAL`;
  - `FIELD`;
  - `SOCIETY`.
- Capacidade de mando:
  - `HAS_HOME_VENUE`;
  - `NO_HOME_VENUE`;
  - `NOT_DEFINED_YET`.
- Localidade macro.
- Mini-fluxo de quadra principal.
- Redes sociais do time:
  - Instagram;
  - TikTok;
  - YouTube.
- Upload temporário de escudo.
- Promoção do upload temporário no fechamento do wizard.
- `POST /api/v1/teams`.
- Persistência em:
  - `teams`;
  - `team_members`;
  - `user_team_roles`;
  - `team_settings`;
  - `team_social_connections`, quando informado;
  - `venues`, quando houver quadra principal.

### Regras críticas

- O time só nasce ao concluir o wizard.
- O único dado obrigatório para criar o time é `name`.
- Quem cria o time recebe papel inicial `DIRECTOR`.
- `Pular e concluir depois` cria o time com dados mínimos e deixa claro que a configuração pode ser completada depois.

### Critério de avanço

A pessoa consegue criar um time real, virar gestora inicial e chegar a uma primeira visão do time criado.

## Fase 4: Base do Time Criado

### Objetivo

Dar utilidade imediata ao time recém-criado.

### Entregas

- Home inicial do time.
- Perfil básico do time.
- Configurações do time.
- Edição de:
  - escudo;
  - cores;
  - modalidades;
  - localidade;
  - quadra principal;
  - redes sociais.
- Primeira estrutura de integrantes.
- Papéis:
  - `PLAYER`;
  - `COMMITTEE`;
  - `DIRECTOR`;
  - `PRESIDENT`.
- Permissões iniciais para gestão do time.

### Critério de avanço

O time criado não fica como entidade isolada. A pessoa consegue ver, revisar e evoluir dados básicos do time.

## Fase 5: Entrar em Um Time e Solicitações

### Objetivo

Permitir que pessoas solicitem entrada em times e que a diretoria aprove ou negue sem conflito entre aprovadores.

### Entregas

- Tela `Join Team Search`.
- Busca de times.
- Envio de `team_join_requests`.
- Bloqueio de duplicidade:
  - solicitação pendente;
  - pessoa já vinculada ao time.
- Notificação para diretoria/presidência.
- Aprovação com escolha de função:
  - jogador;
  - comissão;
  - diretoria;
  - presidência.
- Regras de hierarquia:
  - `PRESIDENT` prevalece sobre `DIRECTOR`, `COMMITTEE` e `PLAYER` quando incompatível;
  - `DIRECTOR` prevalece sobre `COMMITTEE`;
  - `COMMITTEE` serve para integrante não atleta e não gestor;
  - jogador exige `player` vinculado à `person`.
- Notificação para solicitante aprovado ou negado.
- Evento social opcional de boas-vindas do jogador.

### Critério de avanço

Uma pessoa consegue pedir para entrar em um time, e um responsável consegue resolver a solicitação sem conflito de decisões.

## Fase 6: Elenco, Pessoas e Reivindicação de Histórico

### Objetivo

Permitir que o time organize atletas cadastrados e não cadastrados sem perder histórico quando alguém entra no app depois.

### Entregas

- Cadastro rápido de pessoa/jogador pelo time.
- Criação de `person` sem `user`.
- Criação de `player` vinculado à `person`.
- Regra mínima de cadastro:
  - nome ou apelido;
  - apelido pode preencher `nickname`;
  - nome único pode alimentar `nickname` quando necessário.
- Busca local e global de pessoas/jogadores.
- Fluxo de reivindicação de histórico.
- Migração de histórico operacional para o `player` do usuário que reivindicou.

### Critério de avanço

Um diretor consegue cadastrar o elenco antes de os atletas usarem o app, e um atleta que entrar depois pode recuperar seu histórico.

## Fase 7: Agenda e Confirmação de Presença

### Objetivo

Permitir que o time organize jogos futuros, libere confirmação para integrantes e transforme agenda em operação de partida.

### Entregas

- Agendamento de jogo.
- Tipo de jogo.
- Organização.
- Categoria etária.
- Quantidade de quadros.
- Adversário local ou global.
- Local/quadra.
- Status do agendamento.
- `team_visibility_at`.
- Divulgação opcional do jogo.
- Confirmação de presença:
  - `GOING`;
  - `MAYBE`;
  - `NOT_GOING`;
  - `GOING_NOT_PLAYING`.
- Cobrança manual de presença.
- Cobrança automática configurável.
- Separação por quadro.

### Critério de avanço

O time consegue ver próximos jogos, confirmar presença e preparar a escalação com base em presença e quadro.

## Fase 8: Escalação e Preparação da Partida

### Objetivo

Transformar agenda confirmada em partida operacional sem gerar registros órfãos.

### Entregas

- Tela de escalação.
- Confirmação do técnico.
- Seleção de relacionados.
- Confirmação de número da camisa.
- Definição de goleiro.
- Titulares e reservas.
- Ordem de sugestão por quadro e presença.
- Adição de jogador atrasado ou avulso.
- Persistência de:
  - `matches`;
  - `match_players`;
  - `match_players_positions`;
  - `match_staff`.

### Critério de avanço

O técnico consegue montar a escalação real do quadro e salvar a partida pronta para iniciar.

## Fase 9: Operação Ao Vivo Casual

### Objetivo

Permitir registrar o jogo com baixo atrito.

### Entregas

- Placar.
- Cronômetro.
- Pausas.
- Fim de período.
- Terminar partida.
- Gol rápido.
- Autor do gol opcional.
- Gol adversário sem autor obrigatório.
- Edição rápida de gol.
- Substituição básica.
- Finalização da partida.

### Critério de avanço

Um time consegue operar uma partida inteira registrando o essencial sem usar scout avançado.

## Fase 10: Operação Ao Vivo Rica

### Objetivo

Adicionar profundidade progressiva para times que querem dados mais ricos.

### Entregas

- Microfluxos contextuais.
- Pré-filtro:
  - `ATTACK`;
  - `DEFENSE`.
- Eventos parciais.
- Salvamento antecipado.
- Chutes.
- Faltas.
- Defesas.
- Dribles.
- Passes.
- Substituições detalhadas.
- Jogadores adversários operacionais.
- Operação colaborativa.
- Escopos de operadores.
- Realtime Broadcast.
- Heartbeat do cronômetro.
- Offline event queue.
- Revisão por vídeo.

### Critério de avanço

Times avançados conseguem coletar scout rico sem impedir que times casuais continuem usando o fluxo simples.

## Fase 11: Timeline de Pressão e Leitura Ao Vivo

### Objetivo

Transformar eventos registrados em leitura visual útil durante a partida.

### Entregas

- `MatchMomentumTimeline`.
- `GET /api/v1/matches/:match_id/momentum`.
- Renderização com `@shopify/react-native-skia`.
- Filtros:
  - todos;
  - chutes;
  - gols;
  - faltas;
  - defesas;
  - dribles;
  - jogador.
- Janela:
  - 5 minutos;
  - 10 minutos;
  - 15 minutos;
  - tempo todo.
- Popover de evento.
- Filtro por jogador com titulares e reservas.
- Versão vertical fixa abaixo da quadra.
- Versão horizontal por overlay.

### Critério de avanço

O técnico consegue entender pressão, participação e momento do jogo sem abrir relatório ou dashboard.

## Fase 12: Perfil do Atleta e Resenha Social

### Objetivo

Transformar histórico esportivo em identidade, ego, comparação e compartilhamento.

### Entregas

- Perfil público do atleta.
- Dados gerais.
- Dados por modalidade.
- Filtro por time.
- Gráficos estilo game.
- Timeline de desempenho.
- Galeria de lances.
- Vínculo com posts externos.
- Redes sociais da pessoa.
- Repost/compartilhamento conforme limite das plataformas.

### Critério de avanço

O atleta tem uma página que dá vontade de mostrar, comparar e usar na resenha.

## Fase 13: Estatísticas, Consolidação e Read Models

### Objetivo

Consolidar dados ricos sem sobrecarregar consultas operacionais.

### Entregas

- `player_match_statistics`.
- Read models de perfil.
- Estatísticas por partida.
- Estatísticas por time.
- Estatísticas por modalidade.
- Estatísticas por quadro.
- Estatísticas por adversário.
- Rankings.
- Jobs de consolidação.
- Feature flag para desligar consolidação pesada se necessário.

### Critério de avanço

O app consegue mostrar histórico acumulado com boa performance sem recalcular tudo a partir dos eventos crus a cada tela.

## Fase 14: Comunidade, Feed e Publicação

### Objetivo

Expandir o FUTSTATS como ambiente social do time e da várzea.

### Entregas

- Feed.
- Comentários.
- Eventos sociais do time.
- Player welcome.
- Publicação simultânea em redes sociais.
- `event.distribution`.
- Retry de distribuição.
- Falhas visíveis na UI.
- Sugestões de times e atletas baseadas em interesse.

### Critério de avanço

O app gera conversa, engajamento e retorno sem depender apenas de estatísticas.

## Fase 15: Ecossistema

### Objetivo

Expandir para ligas, torneios, parceiros, árbitros, organização regional e dados externos.

### Entregas

- Competições.
- Ligas.
- Árbitros verificados.
- Times verificados.
- Relatórios comerciais.
- APIs públicas.
- Marketplace.
- Reivindicação de histórico de time a partir de adversário local.

### Critério de avanço

O FUTSTATS deixa de ser apenas app de time e passa a operar como infraestrutura da várzea.

## Ordem Imediata Recomendada

Para começar o desenvolvimento agora, a ordem mais lógica é:

1. Fundação visual e técnica.
2. Auth e entrada no app.
3. `GET /api/v1/me` e onboarding mínimo.
4. `Start Path Selection`.
5. `Create Team Wizard`.
6. Primeira tela pós-criação do time.

Essa sequência acompanha o primeiro fluxo real da pessoa no app e evita implementar telas avançadas antes de existir time, pessoa, sessão e identidade visual funcionando.
