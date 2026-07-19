---
title: Screen: Start Path Selection
status: Draft
version: 0.3.1
owner: Product Architecture
last_update: 2026-07-18
related_documents:
  - ../../API/Auth_API.md
  - ../../API/Identity_API.md
  - ../../Domain/Identity.md
  - ../../Product/User_Journeys.md
  - ../../Implementation/Database/Table_Spec_team_join_requests.md
  - ../../Implementation/Database/Table_Spec_user_interest_signals.md
  - ../../Implementation/Database/Table_Spec_users.md
  - ../Navigation_Model.md
  - Welcome.md
  - Complete_Profile.md
---

# Screen: Start Path Selection

## Objetivo

Apresentar à pessoa autenticada os caminhos iniciais de uso do app e encaminhá-la ao fluxo mais adequado conforme sua intenção imediata: criar um time, entrar em um time ou explorar primeiro.

Esta tela não define tipo fixo de usuário. Ela apenas escolhe o primeiro caminho operacional após o onboarding mínimo.

Componente sugerido: `StartPathScreen`.

## Quando aparece

- no primeiro acesso da pessoa autenticada;
- depois de login ou cadastro;
- depois de `Complete Profile`, quando esse passo existir;
- antes da entrada definitiva no fluxo principal do app.

## Quando não aparece

- para visitante sem conta;
- para pessoa que já concluiu essa decisão inicial;
- para pessoa com jornada principal já estabelecida, salvo reentrada manual futura definida pelo produto.

## Estrutura da tela

### Bloco superior

- saudação curta, usando `display_name` quando existir;
- título principal: `Como você quer começar?`;
- subtítulo curto explicando que a pessoa pode escolher um caminho agora e mudar de contexto depois.

### Bloco principal

Três cards de ação empilhados verticalmente ou em composição equivalente no mobile:

1. `Criar meu time`
2. `Entrar em um time`
3. `Explorar primeiro`

Cada card deve conter:

- título da ação;
- texto de apoio;
- ícone ou ilustração simples;
- área inteira clicável;
- affordance clara de ação.

### Bloco inferior opcional

- texto leve reforçando que a escolha não é definitiva;
- link discreto de ajuda ou FAQ, se o produto quiser explicar a diferença entre as opções depois.

## Conteúdo visível

### Título visível

`Como você quer começar?`

### Opções

#### Criar meu time

Texto de apoio:

`Monte seu time e comece a organizar jogos, elenco e resultados.`

#### Entrar em um time

Texto de apoio:

`Encontre um time para você fazer parte e peça para entrar.`

#### Explorar primeiro

Texto de apoio:

`Conheça o FUTSTATS, acompanhe times e veja o que está rolando!!!`

## Campos

Sem campos editáveis.

É uma tela de decisão e encaminhamento.

## Ações

### Ação: Criar meu time

- abre o fluxo step by step de criação de time;
- não persiste nada de domínio nesta tela;
- a persistência do time só acontece ao concluir o wizard.

### Ação: Entrar em um time

- abre a tela de busca de times;
- não persiste nada de domínio nesta tela;
- a solicitação de entrada só é criada após seleção do time e confirmação no fluxo seguinte.

### Ação: Explorar primeiro

- encaminha para a Home neutra;
- não cria vínculo de domínio obrigatório.

## Regras de navegação

### Criar meu time

Encaminha para um fluxo step by step de criação de time.

O time só deve ser persistido ao concluir de fato o fluxo.

Etapas previstas:

1. nome do time
   - único dado obrigatório;
2. escudo do time
   - upload, câmera e ajuste visual;
3. dados técnicos
   - modalidade;
   - `tem quadra principal?`;
   - cidade, estado e região quando aplicável;
   - cores principais.

Se `tem quadra principal?` estiver ativo, a pessoa pode abrir um mini-fluxo ou modal para cadastrar a quadra principal. Esse preenchimento continua opcional.

Se a pessoa abandonar o fluxo antes da conclusão, não deve existir `team` nem vínculo de gestão persistidos.

Ao concluir:

- cria `team`;
- cria vínculo de gestão em `user_team_roles` com papel inicial `DIRECTOR`.

### Entrar em um time

Encaminha para uma busca de times.

Fluxo:

1. pessoa busca um time;
2. seleciona o time;
3. confirma em modal que deseja enviar a solicitação;
4. o sistema envia uma solicitação de entrada no time;
5. a tela continua disponível para novas buscas.

Depois da primeira solicitação enviada:

- o texto principal muda para `Quer se juntar a mais algum time?`;
- a UI pode exibir a confirmação mais recente, uma por vez, com nome e escudo do time;
- aparece um CTA para seguir para a Home neutra enquanto aguarda aprovação.

Regras:

- antes de enviar, o sistema verifica se já existe solicitação pendente para o time;
- antes de enviar, o sistema verifica se a pessoa já faz parte do time;
- se qualquer verificação falhar, a solicitação é bloqueada e a pessoa é avisada.

Esta etapa não cria vínculo final com o time.

### Explorar primeiro

Encaminha para a Home neutra, sem criar novo vínculo de domínio.

## Estados da tela

### loading

- enquanto o app termina de resolver sessão, perfil mínimo ou dados básicos da pessoa;
- pode mostrar skeleton dos cards.

### ready

- cards visíveis e clicáveis;
- navegação liberada.

### error

- falha ao carregar contexto mínimo necessário;
- oferecer retry;
- não confundir esse erro com erro de autenticação.

### offline

- deve permitir entrada na Home neutra se isso for compatível com cache local e política do produto;
- ações que dependem de fluxo remoto podem ficar desabilitadas ou avisar indisponibilidade.

## Regras de UX

- a tela deve ser simples, clara e orientada à ação;
- não deve perguntar “quem você é?”;
- não deve exigir dados esportivos completos;
- não deve bloquear a pessoa que quer apenas explorar;
- textos devem ser claros e neutros, sem depender de dialeto para entendimento básico;
- os três caminhos devem ter peso visual equilibrado, sem fazer o caminho neutro parecer erro ou opção menor;
- a decisão deve parecer reversível no futuro, mesmo que o produto registre que a pessoa já passou por esta etapa.

## Persistência conceitual

### Estado da própria etapa

Ao concluir a escolha inicial, o produto deve registrar em `users`:

- `start_path_completed_at`
- `last_start_path_choice`

Esses campos:

- não definem tipo fixo de usuário;
- servem apenas para controlar exibição inicial e última escolha explícita conhecida.

### Criar meu time

Persiste somente ao concluir:

- `team`;
- `user_team_roles` com `DIRECTOR`;
- dados adicionais do time preenchidos no fluxo.

Dados parciais do wizard não devem ser persistidos antes da conclusão.

### Entrar em um time

Persiste apenas uma solicitação de entrada no time.

Tabela esperada:

- `team_join_requests`

Não persiste nessa etapa:

- vínculo final de gestão;
- vínculo esportivo final;
- entrada em elenco;
- perfil esportivo completo.

### Explorar primeiro

Não exige persistência de domínio obrigatória.

## Rastreio leve de interesse

O produto pode registrar sinais leves de interesse comportamental para todas as pessoas, inclusive quem escolheu `Explorar primeiro`, com o objetivo de:

- personalizar a Home neutra;
- sugerir times para seguir;
- sugerir atletas para acompanhar;
- priorizar notícias e conteúdos mais próximos do interesse da pessoa.

Exemplos de sinais:

- buscas recorrentes por time;
- buscas recorrentes por atleta;
- visualizações repetidas de perfis ou notícias de um mesmo time;
- recorrência por modalidade ou localidade.

Regras:

- esse rastreio não cria vínculo automático;
- esse rastreio não substitui follow explícito;
- esse rastreio representa apenas interesse implícito;
- a persistência funcional esperada é `user_interest_signals`.

## Dependências técnicas futuras

- navegação condicional após `GET /api/v1/me`;
- marcação de que a pessoa já passou pela etapa de escolha inicial, via `users.start_path_completed_at`;
- registro da última escolha explícita, via `users.last_start_path_choice`;
- instrumentação leve de analytics para escolha do caminho inicial;
- integração futura com sinais implícitos de interesse;
- persistência funcional de interesse implícito em `user_interest_signals`.

## Assuntos relacionados, mas não resolvidos aqui

- momento exato de cadastro de dados esportivos finos do atleta;
- notificações e aprovação da solicitação pelo time;
- tratamento técnico de upload, câmera, corte e ajuste de imagem do escudo e do avatar.
