---
title: Screen: Create Team Wizard
status: Draft
version: 1.2.0
owner: Product Architecture
last_update: 2026-07-20
related_documents:
  - ../../Domain/Teams.md
  - ../../API/Identity_API.md
  - ../../Implementation/Database/Table_Spec_media_assets.md
  - ../../Implementation/Database/Table_Spec_teams.md
  - ../../Implementation/Database/Table_Spec_team_members.md
  - ../../Implementation/Database/Table_Spec_team_modalities.md
  - ../../Implementation/Database/Table_Spec_team_settings.md
  - ../../Implementation/Database/Table_Spec_team_social_connections.md
  - ../../Implementation/Database/Table_Spec_themes.md
  - ../../Implementation/Database/Table_Spec_user_team_roles.md
  - ../../Implementation/Database/Table_Spec_venues.md
  - Start_Path_Selection.md
  - Team_Home.md
  - Team_Profile.md
---

# Screen: Create Team Wizard

## Objetivo

Permitir que a pessoa crie um time com o menor número possível de dados obrigatórios, preservando um fluxo leve e progressivo.

O time só deve ser persistido ao concluir o wizard.

Componente sugerido: `CreateTeamWizardScreen`.

## Quando aparece

- quando a pessoa escolhe `Criar meu time` em `Start Path Selection`;
- quando um fluxo futuro de criação de time for iniciado manualmente por alguém com permissão para isso;
- em ambiente de desenvolvimento/teste, pode ser aberto diretamente quando a URL contém `?wizardteam=true`.

## Estrutura geral do fluxo

Fluxo step by step com sub telas em cards horizontais.

Cada etapa ocupa o foco principal da tela.

Elementos persistentes do shell do wizard:

- indicador de progresso;
- ação de voltar;
- ação de avançar;
- ação de pular quando aplicável;
- resumo visual curto da etapa atual;
- confirmação final apenas no fechamento do fluxo.

## Etapa 1: Nome do time

### Objetivo

Coletar o único dado obrigatório do wizard.

### Elementos

- título da etapa;
- campo de nome do time;
- texto curto explicando que os demais dados podem ser preenchidos depois;
- botão `Continuar`.

### Campos

- `name`

### Regras

- `name` é obrigatório;
- o nome deve ser curto, claro e legível;
- a validação de formato deve ser simples no fluxo atual;
- se houver slug técnico depois, ele deve ser derivado no backend e não exigido da pessoa aqui.

## Etapa 2: Escudo do time

### Objetivo

Permitir que a pessoa defina a identidade visual básica do time.

### Elementos

- preview do escudo atual ou placeholder;
- ação `Enviar imagem`;
- ação `Tirar foto`;
- ferramenta de ajuste visual da imagem;
- ação `Pular`.

### Campos

- `crest_image_temp`

### Regras

- etapa opcional;
- a pessoa pode avançar sem definir escudo;
- se usar imagem, a UI deve permitir posicionar, cortar e ajustar antes da conclusão;
- a imagem ainda não deve gerar `crest_media_id` definitivo antes da conclusão final do wizard.
- `crest_url` é apenas URL de leitura derivada após o escudo ser promovido para `media_assets`.

### Contrato de upload do escudo

- depois que a pessoa escolhe ou captura a imagem e confirma o ajuste final, o app deve iniciar upload temporário;
- o backend devolve `crest_upload_token`;
- o wizard guarda esse token no rascunho local;
- se a pessoa trocar a imagem:
  - a imagem nova gera novo upload temporário;
  - o token anterior fica obsoleto para o fluxo atual;
- ao concluir o wizard:
  - o frontend envia o `crest_upload_token` em `POST /api/v1/teams`;
- se a criação do time falhar depois do upload:
  - o token continua no rascunho enquanto ainda estiver válido;
  - a pessoa pode tentar concluir novamente sem reenviar a imagem;
- se o token expirar antes da conclusão:
  - a UI deve avisar que o escudo precisa ser reenviado;
  - o fluxo deve pedir novo upload da imagem;
- sair do wizard antes da conclusão não cria `team`, mesmo que o upload temporário já tenha acontecido.

## Etapa 3: Dados técnicos do time

### Objetivo

Permitir que a pessoa complemente dados operacionais e de identidade do time.

### Elementos

- bloco de cores principais;
- bloco de modalidades do time;
- toggle `Tem quadra principal?`;
- bloco de localidade do time;
- bloco opcional de redes sociais do time;
- ação `Concluir criação`;
- ação `Pular e concluir depois`.

### Campos

- `modalities`
- `modality_frame_counts`
- `home_match_capability`
- `has_primary_venue`
- `founded_year`
- `founded_month`
- `founded_day`
- `region_state`
- `region_city`
- `region_zone`
- `first_color`
- `second_color`
- `third_color`
- `youtube_handle`
- `instagram_handle`
- `tiktok_handle`

### Regras

- cores do time aparecem primeiro nesta etapa;
- data de fundação deve aparecer acima do bloco de cores;
- o preenchimento da fundação deve aceitar precisão parcial:
  - apenas ano
  - mês e ano
  - dia, mês e ano
- dia sem mês não deve ser aceito;
- mês sem ano não deve ser aceito;
- modalidade é opcional e contextual, não limitadora;
- o time pode marcar uma ou mais modalidades preferenciais;
- ao selecionar uma modalidade, a UI deve permitir definir a quantidade padrão de quadros daquela modalidade;
- quantidade padrão de quadros aceita valores `1` ou `2`;
- a linguagem de produto para esse conceito é "quadros";
- a persistência técnica fica em `team_modalities.default_match_frame_count`;
- marcar modalidade no wizard não impede o time de criar ou agendar partidas em outra modalidade no futuro;
- `Tem quadra principal?` é um toggle;
- `Tem quadra principal?` deve aparecer antes do bloco de localidade;
- a decisão sobre quadra principal ajuda a definir `home_match_capability`;
- ao ativar o toggle, a pessoa deve ver primeiro o ponto de busca/seleção da quadra;
- a partir dessa busca, a pessoa pode entrar no mini-fluxo interno do próprio wizard;
- esse mini-fluxo deve aparecer em modal full-screen ou sheet expandido no mobile, sem navegar para uma tela separada;
- esse mini-fluxo continua opcional e pode ser deixado para depois;
- a localidade macro do time deve usar:
  - `region_state`
  - `region_city`
  - `region_zone` opcional;
- se a quadra principal for selecionada ou preenchida antes, a localidade do time pode nascer pré-preenchida a partir dos dados da quadra;
- mesmo quando vier pré-preenchida pela quadra, a localidade do time deve continuar editável;
- a localidade macro deve usar autocomplete sempre que possível;
- `region_zone` só faz sentido para cidades grandes ou contextos onde esse detalhamento seja útil;
- cores principais são opcionais, mas úteis para identidade visual e experiências futuras de tema do time;
- redes sociais do time são opcionais;
- no wizard, o cadastro de redes deve aceitar ao menos handle ou URL pública;
- a conexão real com a plataforma pode ser concluída depois nas configurações do time.

## Regra dos botões finais da etapa 3

- `Concluir criação` representa que a pessoa quer finalizar a criação do time com os dados já preenchidos nesta etapa.
- `Pular e concluir depois` representa que o time será criado agora, mas ainda existem dados complementares que podem ser resolvidos em outro momento.
- ambos os caminhos podem concluir a criação do time, desde que o requisito mínimo global do wizard já tenha sido atendido:
  - `name`
- `Pular e concluir depois` deve existir como linguagem explícita para deixar claro que o processo do time ainda pode ser enriquecido futuramente.

## Regra de completude do time

### Criação mínima

- o time pode nascer apenas com `name`.

### Completude operacional

- depois de criado, o produto pode tratar o time como operacionalmente mais completo quando existir ao menos:
  - uma ou mais modalidades em `modalities`;
  - `region_state`;
  - `region_city`;
  - definição de capacidade de mando via `home_match_capability`.
- `region_zone` melhora o dado, mas não é requisito para considerar o time operacionalmente pronto.

## Regra de capacidade de mando

- `home_match_capability` não representa se o time foi mandante ou visitante em uma partida.
- `home_match_capability` representa a capacidade estrutural do time de mandar jogos.
- valores:
  - `HAS_HOME_VENUE`
  - `NO_HOME_VENUE`
  - `NOT_DEFINED_YET`

## Ordem canônica da etapa 3

1. `Cores do time`
2. `Modalidades`
3. `Tem quadra principal?`
4. `Localidade do time`
5. `Redes sociais`

## Bloco: Cores do time

### Objetivo

Gerar identidade visual imediata do time no momento final do wizard usando a linguagem natural de primeira, segunda e terceira cor.

### Regras

- este é o primeiro bloco da etapa 3;
- o bloco deve permitir preencher:
  - `first_color`
  - `second_color`
  - `third_color`
- o bloco é opcional;
- o preview visual deve ajudar a pessoa a sentir que o time já está ganhando identidade.
- inicialmente, cada cor pode aparecer como vazia, usando placeholder visual neutro;
- a seleção das cores pode usar componente ou integração de color picker;
- a ordem preenchida aqui representa a ordem oficial das cores do time, e não o mapeamento final de layout do app.

## Bloco: Modalidades

### Objetivo

Permitir marcar as modalidades preferenciais do time sem transformar isso em limitação operacional futura.

### Elementos esperados

- toggle deslizante para `FUTSAL`;
- toggle deslizante para `FIELD`;
- toggle deslizante para `SOCIETY`.

### Regras

- as três opções aparecem simultaneamente;
- a pessoa pode marcar nenhuma, uma ou mais modalidades;
- esse dado deve ser tratado como contexto preferencial do time;
- no futuro, ele pode acelerar fluxos como criação e agendamento de partidas;
- o time continua livre para jogar outra modalidade, ainda que ela não tenha sido marcada aqui.
- este bloco deve alimentar `modalities` como coleção, e não um campo singular.
- a persistência canônica dessa coleção é `team_modalities`.

## Bloco: Tem quadra principal?

### Objetivo

Descobrir se o time quer já aproveitar o wizard para informar a quadra principal e, quando possível, reutilizar essa informação para localidade.

### Regras

- o bloco vem antes da localidade do time;
- o controle principal é um toggle deslizante;
- se desmarcado:
  - o fluxo pode assumir `home_match_capability = NO_HOME_VENUE`;
  - o fluxo segue normalmente para a localidade manual do time;
- se marcado:
  - o fluxo pode assumir `home_match_capability = HAS_HOME_VENUE`, salvo abandono posterior do cadastro da quadra;
  - aparece o ponto de entrada para buscar a quadra;
  - a pessoa pode selecionar uma quadra conhecida ou abrir o mini-fluxo de cadastro;
  - se a quadra for preenchida, seus dados podem alimentar a localidade do time.

## Bloco: Localidade do time

### Objetivo

Definir a identidade geográfica macro do time.

### Regras

- se o time não tiver quadra principal preenchida:
  - a localidade deve ser preenchida manualmente;
- se o time tiver quadra principal preenchida:
  - `region_state`
  - `region_city`
  - `region_zone`
  podem vir pré-preenchidos a partir da quadra;
- a pessoa deve poder revisar e editar esses campos;
- isso é importante porque a quadra principal pode ajudar, mas não define sempre com perfeição a identidade territorial do time.

## Bloco opcional: Redes sociais do time

### Objetivo

Permitir que o time já nasça com presença social básica documentada e preparado para futuras publicações simultâneas.

### Elementos esperados

- ícone do Instagram;
- ícone do TikTok;
- ícone do YouTube;
- texto curto explicando que a conexão completa pode ser finalizada depois.

### Regras

- esse bloco é totalmente opcional;
- não deve bloquear criação do time;
- inicialmente a pessoa vê apenas os ícones;
- os ícones funcionam como abas visuais;
- ordem dos ícones:
  - Instagram
  - TikTok
  - YouTube
- ao tocar em um ícone:
  - o campo daquela rede aparece abaixo;
  - o campo da rede anterior é ocultado;
- ao trocar de ícone, valores já preenchidos nas outras redes devem permanecer preservados;
- cada campo pode aceitar `@handle`, nome do canal ou URL;
- a UI não precisa forçar OAuth no wizard;
- o vínculo pleno com a plataforma pertence às configurações do time.

## Mini-fluxo opcional: Quadra principal

### Objetivo

Cadastrar a quadra principal do time no contexto da criação, sem transformar isso em bloqueio.

### Elementos esperados

- nome da quadra;
- busca por nome da quadra, campo ou endereço;
- seleção de sugestão externa, quando existir;
- campos de localidade macro;
- campos de endereço micro;
- campos opcionais de piso e cobertura;
- ação de salvar;
- ação de cancelar ou deixar para depois.

### Regras

- esse fluxo só aparece se `Tem quadra principal?` estiver ativo;
- esse fluxo pertence à etapa 3 de `Create Team Wizard` e não cria navegação isolada;
- ao abrir, a pessoa continua dentro do contexto de criação do time;
- ao fechar, retorna para a etapa 3 com os dados temporários preservados;
- o time ainda pode ser criado sem quadra;
- se o mini-fluxo for abandonado, a criação do time continua possível;
- se a pessoa salvar a quadra temporária, a etapa 3 deve mostrar um resumo curto da quadra preenchida.
- a quadra pode ser buscada por integração externa antes do preenchimento manual;
- a primeira integração sugerida para essa busca é `Google Places`;
- a busca inteligente pode aceitar:
  - nome da quadra;
  - nome do campo;
  - endereço;
- quando a busca externa encontrar um local conhecido, a UI pode pré-preencher:
  - nome;
  - endereço;
  - estado;
  - cidade;
  - região ou bairro quando disponível;
  - latitude/longitude;
  - identificador externo do local;
- mesmo após seleção externa, a gestão do time deve poder revisar e editar os campos antes de salvar;
- se a quadra não for encontrada em base externa, o cadastro manual continua permitido.

### Regra de localidade macro e micro

- `teams` usam apenas localidade macro no estado atual do produto:
  - `region_state`
  - `region_city`
  - `region_zone` opcional;
- `venues` podem usar localidade macro e endereço micro;
- a localidade macro representa a identidade geográfica do time ou da quadra;
- o endereço micro representa o local operacional real quando ele existir;
- endereço micro não deve ser obrigatório para criação do time.

### Decisão de UX

- No estado atual do produto, `primary_venue` deve usar mini-fluxo interno, e não tela separada.
- A razão principal é preservar continuidade e reduzir atrito em um ponto opcional do wizard.
- Como a quadra principal ainda é um complemento e não uma entidade que a pessoa precisa administrar profundamente nesse momento, abrir outra tela traria peso desnecessário.
- Se no futuro o cadastro de quadra ganhar mais campos obrigatórios, mídia própria, agenda, preço, disponibilidade ou múltiplas quadras, essa decisão pode evoluir para fluxo dedicado.

### Decisão de arquitetura

- O ativo reutilizável não é uma tela específica de quadra.
- O ativo reutilizável é o `PrimaryVenueFormFlow`, responsável por coletar os dados da quadra principal.
- Esse fluxo deve poder ser hospedado em contextos diferentes:
  - mini-fluxo interno no `Create Team Wizard`;
  - modal em configurações do time;
  - tela completa em fluxo isolado de cadastro ou edição de quadras.
- Assim, o wizard preserva leveza sem impedir reutilização futura em outros pontos do produto.

## Ações principais

### Avançar etapa

- valida apenas os campos obrigatórios da etapa atual;
- não persiste domínio final.

### Voltar etapa

- mantém o estado temporário já preenchido;
- não persiste domínio final.

### Pular etapa

- permitido apenas nas etapas opcionais;
- mantém o fluxo leve.

### Concluir criação

Ao concluir:

- cria `team`;
- cria `team_member` ativo da pessoa fundadora;
- cria vínculo de gestão em `user_team_roles` com `DIRECTOR`;
- persiste escudo, se existir;
- persiste modalidade, localidade, cores e demais dados preenchidos;
- persiste modalidades preferenciais em `team_modalities`;
- persiste `first_color`, `second_color` e `third_color` em `teams`, quando preenchidas;
- persiste quadra principal, se ela tiver sido criada no mini-fluxo;
- cria `team_settings` com defaults;
- pode criar registros iniciais em `team_social_connections` com handles/URLs, ainda que a conexão completa fique pendente.

## Estados da tela

### loading

- durante pré-carregamento do wizard;
- durante upload ou ajuste de imagem;
- durante submissão final.

### ready

- etapa visível e interativa.

### validation_error

- erros locais da etapa atual.

### submit_error

- falha ao concluir a criação;
- não deve perder os dados temporários já preenchidos.

### offline

- se o produto não suportar criação offline neste fluxo, deve avisar de forma clara;
- se suportar, isso precisará de desenho técnico próprio depois.

## Regras de UX

- o wizard deve parecer leve e progressivo;
- o nome do time é o único bloqueio real de entrada;
- etapas opcionais não devem gerar culpa ou atrito excessivo;
- a pessoa precisa entender que pode completar escudo, quadra, cores e conexões sociais depois;
- o progresso deve ser sempre claro;
- o preview de escudo e de cores deve gerar sensação de identidade do time cedo no fluxo;
- a localidade deve exigir o mínimo de digitação manual possível;
- a abertura do mini-fluxo de quadra não deve parecer desvio de jornada nem "nova missão" dentro do onboarding.

## Persistência conceitual

### Antes da conclusão

Nada de domínio final deve ser persistido.

Tudo deve permanecer em estado temporário do fluxo:

- nome;
- escudo temporário;
- modalidade;
- quadra principal temporária;
- localidade macro do time;
- cores;
- handles/redes sociais temporários.

### Ao concluir

Persistência esperada:

- `teams`
- `media_assets`, quando houver escudo promovido
- `team_members`
- `team_modalities`
- `user_team_roles`
- eventualmente `venues`, se a quadra tiver sido cadastrada
- dados de tema ou identidade visual do time, conforme modelagem final
- `team_settings`
- `team_social_connections` em estado inicial, quando houver dados de rede

## Dependências técnicas futuras

- upload de imagem;
- captura por câmera;
- recorte, zoom, rotação e reposicionamento de imagem;
- autocomplete de localidade;
- possível componente global reutilizável de wizard por etapas;
- possível componente global reutilizável de seletor e edição de imagem;
- possível componente global reutilizável de mini-fluxo modal para captura de entidade opcional;
- possível `PrimaryVenueFormFlow` reutilizável com modos `embedded`, `modal` e `screen`;
- fluxo de OAuth por plataforma para conexões sociais do time.

## Assuntos relacionados, mas não resolvidos aqui

- contrato de API de criação de time;
- formato visual final do mini-fluxo de `primary_venue` entre modal full-screen e sheet expandido;
- estratégia técnica do color picker;
- mapeamento visual das cores do time para o app em `team_settings`;
- bibliotecas de imagem e câmera no mobile;
- detalhes técnicos de publicação simultânea em YouTube, Instagram e TikTok.
