---
title: Reusable Building Blocks
status: Draft
version: 1.2.0
owner: Product Architecture
last_update: 2026-07-09
related_documents:
  - Frontend_Architecture.md
  - App_Structure.md
  - Components.md
  - Component_Guidelines.md
  - Screens/Start_Path_Selection.md
  - Screens/Create_Team_Wizard.md
  - Screens/Join_Team_Search.md
  - Screens/Athlete_Data_Completion.md
---

# Reusable Building Blocks

## Objetivo

Definir o catálogo canônico de componentes, fluxos e métodos reutilizáveis do frontend.

Este documento existe para evitar que novas telas criem variações paralelas de algo que já foi pensado, documentado ou validado conceitualmente.

## Regra de uso

- Toda nova tela deve consultar este catálogo antes de propor componente, hook, fluxo ou serviço novo.
- Se já existir algo conceitualmente equivalente, a regra padrão é reutilizar.
- Se o item existente estiver quase adequado, a regra padrão é evoluir o item existente, e não criar um segundo parecido.
- Só é aceitável criar um item novo quando houver diferença real de responsabilidade, contrato ou comportamento.
- Componentes visuais não conhecem API.
- Hooks e serviços encapsulam integração, estado e efeitos colaterais reutilizáveis.
- Itens genéricos devem permanecer genéricos; regra de negócio específica continua dentro do módulo de domínio.

## Regra de rastreabilidade

- Todo item reutilizável deve registrar onde já está sendo usado conceitualmente.
- Sempre que um item passar a ser adotado por uma nova tela ou fluxo, este documento deve ser atualizado.
- Mudança de contrato de entrada, saída, eventos emitidos ou payload interno reutilizado exige revisão prévia dos consumidores registrados.
- Se a mudança quebrar consumidores existentes, a regra padrão é uma destas três:
  - evoluir de modo retrocompatível;
  - versionar explicitamente o contrato;
  - criar um item novo com outra responsabilidade.

## Como registrar uso

Cada item reutilizável deve informar:

- responsabilidade;
- onde usar;
- consumidores conhecidos;
- risco de impacto ao evoluir;
- limites do que não deve fazer.

## Regra para evolução segura

Antes de evoluir um componente, fluxo, hook ou serviço reutilizável, validar:

- quais telas ou fluxos já dependem dele;
- se a mudança altera props, callbacks, formato de retorno, payload, eventos ou estados expostos;
- se a mudança é retrocompatível;
- se a mudança exige ajuste simultâneo da documentação das telas consumidoras.

Se a alteração mudar contrato, a revisão não deve olhar apenas o item isolado. Deve olhar também todos os consumidores registrados neste catálogo.

## Critério para decidir entre reutilizar e criar

Reutilizar quando:

- a responsabilidade principal é a mesma;
- a diferença é só de texto, tema, ícone, ordem visual ou pequeno detalhe de layout;
- o contrato de entrada e saída pode continuar estável.

Evoluir o item existente quando:

- a responsabilidade continua sendo a mesma;
- falta apenas um parâmetro, variante visual, estado ou callback novo;
- a mudança melhora o ativo compartilhado sem acoplar a um único caso de uso.

Criar item novo quando:

- há outra responsabilidade;
- o contrato ficaria confuso ou inflado se absorvesse o novo caso;
- a generalização geraria um componente "faz tudo" difícil de manter.

## Estado do catálogo

- Os itens abaixo são canônicos em nível de documentação.
- Eles podem ainda não estar implementados no código.
- Quando forem implementados, o nome técnico pode seguir a convenção do frontend sem mudar a responsabilidade descrita aqui.
- Os contratos descritos aqui são arquiteturais e preliminares.
- Durante a implementação, detalhes de props, tipos, eventos, nomes técnicos e estrutura interna podem evoluir.
- Se a implementação exigir mudança relevante, este documento deve ser atualizado para refletir o contrato mais maduro.

## Mini padrão de contrato

Cada item reutilizável deve, sempre que possível, registrar:

- responsabilidade;
- entradas esperadas;
- saídas esperadas;
- eventos ou callbacks relevantes;
- dependências relevantes;
- onde usar;
- consumidores conhecidos;
- risco de impacto ao evoluir;
- limites do que não deve fazer.

## Regra sobre estabilidade do contrato

- Antes da implementação, o contrato aqui descrito serve como direção arquitetural.
- Durante a implementação, o time pode ajustar o contrato para melhor ergonomia, clareza ou viabilidade técnica.
- Depois que houver consumidores reais no código, o contrato deixa de ser apenas uma intenção e passa a exigir controle de impacto antes de qualquer mudança incompatível.
- Mudanças pequenas de nomenclatura ou organização interna não exigem novo item se a responsabilidade continuar a mesma.
- Mudanças que alterem integração entre consumidores e item reutilizável devem atualizar este catálogo.

## Componentes reutilizáveis

### ActionChoiceCard

Responsabilidade:

- renderizar uma opção principal de decisão do usuário;
- exibir título, apoio visual, descrição curta e ação principal;
- suportar estados normal, pressionado, desabilitado e destacado.

Entradas esperadas:

- identificador da opção;
- título;
- descrição curta;
- apoio visual opcional;
- estado atual da opção;
- callback de seleção ou confirmação.

Saídas esperadas:

- evento de seleção;
- evento de ação principal, quando existir.

Eventos ou callbacks relevantes:

- `onSelect`
- `onPress`

Dependências relevantes:

- tokens visuais do design system;
- camada de navegação da tela consumidora.

Usar em:

- `Start_Path_Selection`;
- outras telas de escolha de intenção, modo ou caminho inicial.

Consumidores conhecidos:

- `Frontend/Screens/Start_Path_Selection.md`

Risco de impacto ao evoluir:

- médio;
- mudanças em ação principal, estado selecionado ou estrutura de retorno podem afetar qualquer tela que dependa da decisão tomada no card.

Não deve:

- decidir navegação por conta própria;
- conter lógica de permissão;
- buscar dados remotos.

### StepNavigationContainer

Responsabilidade:

- estruturar fluxos em etapas;
- exibir progresso, navegação entre etapas, validação por etapa e ação final;
- permitir cards ou subetapas com rolagem lateral controlada.

Entradas esperadas:

- lista de etapas;
- etapa atual;
- estado de validação por etapa;
- conteúdo renderizável da etapa;
- callbacks de avançar, voltar e concluir.

Saídas esperadas:

- evento de avanço;
- evento de retorno;
- evento de conclusão;
- estado de progresso derivado.

Eventos ou callbacks relevantes:

- `onNext`
- `onBack`
- `onComplete`
- `onStepChange`

Dependências relevantes:

- regras locais de validação da tela;
- mecanismo de rascunho local, quando houver.

Usar em:

- `Create_Team_Wizard`;
- futuros fluxos guiados de criação, configuração ou perfil.

Consumidores conhecidos:

- `Frontend/Screens/Create_Team_Wizard.md`

Risco de impacto ao evoluir:

- alto;
- mudanças em progressão, validação por etapa ou contrato de conclusão podem afetar múltiplos wizards.

Não deve:

- conhecer o domínio de time, quadra, atleta ou qualquer outro;
- persistir dados diretamente.

Observação de nomenclatura:

- este item substitui o nome anterior `StepWizardShell`;
- o nome foi ajustado para refletir melhor a ideia de container estrutural da navegação lateral por etapas.

### EntitySearchInput

Responsabilidade:

- capturar termo de busca;
- exibir resultados paginados ou limitados;
- lidar com carregamento, vazio, erro e seleção de entidade.

Entradas esperadas:

- tipo de entidade buscada;
- termo atual;
- lista de resultados;
- estados de carregamento e erro;
- callback de mudança do termo;
- callback de seleção de resultado.

Saídas esperadas:

- termo atualizado;
- entidade selecionada.

Eventos ou callbacks relevantes:

- `onQueryChange`
- `onResultSelect`

Dependências relevantes:

- `useEntitySearch`;
- contrato de busca do backend correspondente.

Usar em:

- `Join_Team_Search`;
- futuras buscas de time, atleta, árbitro, quadra ou adversário.

Consumidores conhecidos:

- `Frontend/Screens/Join_Team_Search.md`

Risco de impacto ao evoluir:

- alto;
- mudanças em formato de resultado, seleção ou callbacks podem quebrar diferentes buscas de entidade.

Não deve:

- definir regra de negócio de duplicidade;
- enviar solicitação final por conta própria.

### ConfirmationModal

Responsabilidade:

- confirmar ação sensível antes do envio;
- exibir contexto mínimo da entidade afetada;
- separar ação primária, secundária e cancelamento.

Entradas esperadas:

- estado aberto ou fechado;
- título e mensagem;
- contexto resumido da entidade;
- rótulos das ações;
- callbacks de confirmar e cancelar.

Saídas esperadas:

- confirmação explícita;
- cancelamento explícito.

Eventos ou callbacks relevantes:

- `onConfirm`
- `onCancel`
- `onClose`

Dependências relevantes:

- componente base de modal ou sheet;
- regras de acessibilidade e foco.

Usar em:

- confirmação de solicitação para entrar em time;
- ações de envio, vínculo, remoção ou mudança relevante.

Consumidores conhecidos:

- `Frontend/Screens/Join_Team_Search.md`

Risco de impacto ao evoluir:

- médio;
- alterações em confirmação, cancelamento ou payload de aceite podem afetar ações críticas.

### ImagePreviewCard

Responsabilidade:

- exibir imagem atual ou placeholder;
- expor ações de trocar, remover, editar ou recortar;
- receber estados de upload e processamento.

Entradas esperadas:

- imagem atual ou placeholder;
- estado de upload;
- disponibilidade das ações;
- callbacks de editar, remover e substituir.

Saídas esperadas:

- intenção de editar;
- intenção de remover;
- intenção de trocar arquivo.

Eventos ou callbacks relevantes:

- `onEdit`
- `onRemove`
- `onReplace`

Dependências relevantes:

- `ImageAcquisitionFlow`;
- `useTemporaryUpload`, quando integrado.

Usar em:

- escudo do time;
- avatar do usuário;
- outras imagens de perfil ou identidade visual.

Consumidores conhecidos:

- `Frontend/Screens/Create_Team_Wizard.md`
- `Frontend/Screens/Athlete_Data_Completion.md`
- futuro fluxo de avatar do usuário

Risco de impacto ao evoluir:

- alto;
- mudanças em estados de upload, edição ou remoção podem quebrar integração com fluxos de mídia.

Observação para fluxo de escudo:

- quando integrado ao wizard de criação de time, este card deve refletir claramente:
  - imagem local em edição;
  - upload temporário em andamento;
  - upload temporário concluído com token válido;
  - token expirado ou inválido exigindo reenvio.

### ToggleField

Responsabilidade:

- representar escolha booleana de forma clara;
- permitir texto auxiliar contextual;
- abrir conteúdo dependente quando ativado.

Entradas esperadas:

- valor booleano;
- rótulo;
- texto auxiliar opcional;
- callback de mudança;
- conteúdo dependente opcional.

Saídas esperadas:

- mudança de estado booleano.

Eventos ou callbacks relevantes:

- `onValueChange`

Dependências relevantes:

- componentes básicos de formulário;
- lógica local da tela consumidora.

Usar em:

- `Tem quadra principal?`;
- outros flags de configuração com efeito imediato na UI.

Consumidores conhecidos:

- `Frontend/Screens/Create_Team_Wizard.md`

Risco de impacto ao evoluir:

- baixo;
- o risco cresce se o toggle passar a emitir contrato mais rico do que simples estado booleano.

### TeamColorPickerField

Responsabilidade:

- capturar a primeira, segunda e terceira cor oficial do time;
- exibir preview visual das cores já escolhidas;
- suportar estado vazio com placeholder visual.

Entradas esperadas:

- valores atuais de:
  - `first_color`
  - `second_color`
  - `third_color`
- rótulos visuais por cor;
- callback de mudança por cor;
- suporte opcional a integração de color picker.

Saídas esperadas:

- atualização de cada cor;
- estado consolidado do bloco de cores.

Eventos ou callbacks relevantes:

- `onFirstColorChange`
- `onSecondColorChange`
- `onThirdColorChange`
- `onChange`

Dependências relevantes:

- color picker escolhido na implementação;
- tokens visuais para preview e placeholder.

Usar em:

- `Create_Team_Wizard`;
- futuras edições de identidade do time em `Team Settings`.

Consumidores conhecidos:

- `Frontend/Screens/Create_Team_Wizard.md`
- `Frontend/Screens/Team_Settings.md`

Risco de impacto ao evoluir:

- médio;
- mudanças em payload, nome das cores ou formato do valor afetam identidade do time e preview visual.

Não deve:

- decidir sozinho o mapeamento visual do app;
- persistir em API.

### ModalityToggleGroup

Responsabilidade:

- renderizar grupo de toggles para modalidades;
- permitir seleção simples ou múltipla;
- reutilizar a mesma linguagem visual de modalidade em mais de um fluxo.

Entradas esperadas:

- lista de modalidades disponíveis;
- modalidades selecionadas;
- modo de seleção;
- callback de mudança.

Saídas esperadas:

- conjunto atualizado de modalidades selecionadas.

Eventos ou callbacks relevantes:

- `onChange`

Dependências relevantes:

- catálogo canônico de modalidades;
- convenções visuais de toggle do frontend.

Usar em:

- `Create_Team_Wizard`;
- futuros fluxos de atleta, filtros e configurações esportivas.

Consumidores conhecidos:

- `Frontend/Screens/Create_Team_Wizard.md`

Risco de impacto ao evoluir:

- médio;
- mudanças no contrato de seleção podem afetar time, atleta e filtros futuros.

Não deve:

- impor regra de negócio específica do domínio consumidor;
- impedir seleção múltipla quando o fluxo permitir.

### SocialHandleTabs

Responsabilidade:

- organizar múltiplas redes sociais em uma navegação compacta por ícones;
- mostrar um campo por vez;
- preservar valores já digitados ao trocar de aba.

Entradas esperadas:

- lista de plataformas disponíveis;
- plataforma ativa;
- valores atuais por plataforma;
- callback de troca de aba;
- callback de mudança do valor.

Saídas esperadas:

- plataforma ativa atualizada;
- valores atualizados por plataforma.

Eventos ou callbacks relevantes:

- `onTabChange`
- `onValueChange`

Dependências relevantes:

- ícones das plataformas;
- convenções de campo por handle, nome de canal ou URL.

Usar em:

- `Create_Team_Wizard`;
- futuras edições de redes sociais em `Team Settings`.

Consumidores conhecidos:

- `Frontend/Screens/Create_Team_Wizard.md`
- `Frontend/Screens/Team_Settings.md`

Risco de impacto ao evoluir:

- médio;
- mudanças na forma de preservar estado, trocar abas ou validar plataformas afetam cadastro social em mais de um contexto.

Não deve:

- iniciar OAuth;
- validar conexão real com a plataforma;
- decidir política de publicação.

### LocationMacroForm

Responsabilidade:

- coletar localidade macro padronizada;
- concentrar o contrato de:
  - estado
  - cidade
  - região
- aceitar preenchimento manual ou pré-preenchimento vindo de outro fluxo, como quadra principal.

Entradas esperadas:

- valores atuais de:
  - `region_state`
  - `region_city`
  - `region_zone`
- modo de edição;
- indicação de origem do pré-preenchimento, quando houver;
- callbacks de mudança.

Saídas esperadas:

- estrutura atualizada de localidade macro.

Eventos ou callbacks relevantes:

- `onChange`
- `onPrefillApplied`

Dependências relevantes:

- `AutocompleteLocationField`;
- fonte de dados de localidade.

Usar em:

- `Create_Team_Wizard`;
- `PrimaryVenueFormFlow`;
- outros fluxos que usem localidade macro.

Consumidores conhecidos:

- `Frontend/Screens/Create_Team_Wizard.md`

Risco de impacto ao evoluir:

- alto;
- mudanças em estrutura de retorno ou normalização impactam persistência e UX de time e quadra.

Não deve:

- assumir que toda localidade vem de quadra;
- forçar endereço micro.

### AutocompleteLocationField

Responsabilidade:

- facilitar seleção de estado, cidade e região;
- sugerir opções à medida que o usuário digita;
- reduzir erro manual de localidade.

Entradas esperadas:

- tipo de localidade ou nível atual;
- valor atual;
- sugestões disponíveis;
- estado de carregamento;
- callbacks de busca e seleção.

Saídas esperadas:

- valor digitado;
- localidade selecionada;
- possível estrutura normalizada de retorno.

Eventos ou callbacks relevantes:

- `onSearch`
- `onSelect`

Dependências relevantes:

- `LocationSelectionFlow`;
- fonte de dados de localidade.

Usar em:

- cadastro de time;
- cadastro de quadra;
- qualquer fluxo que dependa de localidade estruturada.

Consumidores conhecidos:

- `Frontend/Screens/Create_Team_Wizard.md`
- futuro mini-fluxo de `primary_venue`

Risco de impacto ao evoluir:

- alto;
- mudanças em estrutura de localidade podem afetar payload, validação e persistência.

Observação de UX:

- no recorte atual, este fluxo deve ser acionado dentro do wizard, e não como tela separada.

## Fluxos reutilizáveis

### ImageAcquisitionFlow

Responsabilidade:

- centralizar escolha da galeria, captura por câmera, edição, corte, zoom, rotação e reposicionamento;
- entregar um artefato final pronto para upload temporário;
- esconder das telas a biblioteca específica de captura/edição.

Entradas esperadas:

- contexto do ativo;
- proporção ou regra visual desejada;
- permissões necessárias;
- imagem inicial opcional.

Saídas esperadas:

- arquivo final processado;
- metadados mínimos do arquivo;
- estado de cancelamento ou falha.

Eventos ou callbacks relevantes:

- `onAssetReady`
- `onCancel`
- `onError`

Dependências relevantes:

- `react-native-image-picker`;
- biblioteca de crop/edição ainda a ser consolidada na implementação.

Decisão já tomada:

- captura inicial com `react-native-image-picker`;
- telas não falam diretamente com a biblioteca;
- crop, zoom, rotação e reposicionamento pertencem a este fluxo reutilizável.

Observação de nomenclatura:

- este fluxo continua responsável pela aquisição e edição da imagem;
- em fluxos de tela, ele pode aparecer como parte de um `MediaPickAndAdjustFlow`, sem mudar a responsabilidade central aqui descrita.

Usar em:

- escudo do time;
- avatar do usuário;
- avatar do atleta;
- futuras imagens equivalentes.

Consumidores conhecidos:

- `Frontend/Screens/Create_Team_Wizard.md`
- `Frontend/Screens/Athlete_Data_Completion.md`
- futuro fluxo de avatar do usuário

Risco de impacto ao evoluir:

- alto;
- mudanças no artefato final, token temporário ou callbacks de edição impactam upload e promoção de mídia.

### LocationSelectionFlow

Responsabilidade:

- guiar seleção estruturada de localidade;
- compartilhar regras de autocomplete e normalização visual;
- servir tanto para telas completas quanto para mini-fluxos ou modais.

Entradas esperadas:

- contexto da coleta;
- valor inicial opcional;
- granularidade necessária;
- callbacks de avanço ou confirmação.

Saídas esperadas:

- localidade estruturada;
- confirmação ou cancelamento do fluxo.

Eventos ou callbacks relevantes:

- `onConfirm`
- `onCancel`
- `onChange`

Dependências relevantes:

- `AutocompleteLocationField`;
- estratégia de dados de localidade.

Usar em:

- cidade, estado e região do time;
- cidade, estado e região de quadra principal;
- outras capturas de localidade.

Consumidores conhecidos:

- `Frontend/Screens/Create_Team_Wizard.md`

Risco de impacto ao evoluir:

- médio;
- mudanças em normalização ou ordem de seleção afetam consistência entre time e quadra.

Observação de UX:

- no recorte atual, o fluxo de localidade da quadra principal deve abrir como mini-fluxo interno do wizard.

### PrimaryVenueFormFlow

Responsabilidade:

- capturar os dados mínimos e opcionais de `primary_venue`;
- permitir reutilização do mesmo núcleo de coleta em contextos diferentes;
- desacoplar o conteúdo do formulário da forma de navegação usada para hospedá-lo.

Entradas esperadas:

- contexto de uso;
- dados iniciais opcionais;
- modo de hospedagem;
- callbacks de confirmar, cancelar e remover, quando aplicável.

Saídas esperadas:

- estrutura temporária ou final de `primary_venue`;
- cancelamento do fluxo;
- remoção da quadra principal, quando o contexto permitir.

Eventos ou callbacks relevantes:

- `onConfirm`
- `onCancel`
- `onRemove`
- `onChange`

Dependências relevantes:

- `AutocompleteLocationField`;
- `LocationSelectionFlow`;
- regras mínimas do domínio `venues`.
- integração de busca externa de locais, com primeira opção sugerida em `Google Places`.

Usar em:

- mini-fluxo interno do `Create_Team_Wizard`;
- edição de quadra principal em configurações do time;
- fluxo isolado de cadastro ou edição de quadras.

Consumidores conhecidos:

- `Frontend/Screens/Create_Team_Wizard.md`
- futuro fluxo de `Team Settings`
- futuro fluxo isolado de `venues`

Risco de impacto ao evoluir:

- alto;
- mudanças em payload, obrigatoriedade de campos ou callbacks podem afetar onboarding, configurações do time e cadastro isolado de quadras.

Observação de arquitetura:

- o item reutilizável é o fluxo/formulário de `primary_venue`, não a tela que o hospeda.
- ele deve suportar, ao menos conceitualmente, três modos de hospedagem:
  - `embedded`
  - `modal`
  - `screen`

Observação de UX:

- no `Create_Team_Wizard`, o modo recomendado é mini-fluxo interno em `modal`;
- em configurações do time, pode abrir como `modal`;
- em cadastro isolado de quadra, pode usar `screen`.

Observação de busca externa:

- quando houver busca inteligente de quadra, o fluxo deve aceitar resultado por:
  - nome da quadra;
  - nome do campo;
  - endereço;
- resultado externo só acelera preenchimento;
- o fluxo continua obrigado a suportar revisão manual e cadastro manual completo.

## Hooks e métodos reutilizáveis

### useTemporaryUpload

Responsabilidade:

- enviar arquivo processado para armazenamento temporário;
- devolver token temporário e metadados necessários para promoção futura;
- centralizar estados de envio, falha, repetição e cancelamento.

Entradas esperadas:

- arquivo processado;
- contexto do upload;
- política de retry ou cancelamento, quando aplicável.

Saídas esperadas:

- token temporário;
- metadados do upload;
- estados de carregamento, sucesso e erro.

Eventos ou callbacks relevantes:

- `startUpload`
- `retryUpload`
- `cancelUpload`

Dependências relevantes:

- endpoint de upload temporário;
- estratégia de mídia do backend.

Observação de maturidade:

- o formato exato de `upload_token`, `upload_url`, headers e metadados ainda pode evoluir na implementação;
- a responsabilidade estável é criar upload temporário seguro e devolver um identificador consumível por um endpoint de negócio.

Regras de uso no wizard:

- quando a pessoa confirmar a imagem final, o upload temporário deve acontecer antes da conclusão do caso de uso principal;
- o token retornado deve ficar salvo no rascunho local;
- se a imagem for trocada, o hook deve substituir o token anterior pelo novo;
- se a conclusão do fluxo principal falhar, o token ainda pode ser reaproveitado enquanto estiver válido;
- se o token expirar, o consumidor deve exigir novo upload.

Usar em:

- `crest_upload_token`;
- upload temporário de avatar;
- outros uploads que precisem confirmação posterior.

Consumidores conhecidos:

- `Frontend/Screens/Create_Team_Wizard.md`
- `Frontend/Screens/Athlete_Data_Completion.md`
- futuro fluxo de avatar do usuário

Risco de impacto ao evoluir:

- alto;
- se mudar o formato do token, metadados retornados ou estados expostos, quebra consumidores e integração com backend.

### useEntitySearch

Responsabilidade:

- encapsular debounce, consulta, paginação curta e estados de busca;
- receber tipo de entidade e contrato de resposta;
- alimentar `EntitySearchInput`.

Entradas esperadas:

- tipo de entidade;
- termo de busca;
- configuração opcional de debounce ou limite.

Saídas esperadas:

- resultados;
- estado de carregamento;
- estado de erro;
- helpers de paginação ou repetição.

Eventos ou callbacks relevantes:

- atualização reativa ao termo informado;
- ação manual de refetch, se existir.

Dependências relevantes:

- endpoint de busca do domínio correspondente;
- `EntitySearchInput`.

Consumidores conhecidos:

- `Frontend/Screens/Join_Team_Search.md`

Risco de impacto ao evoluir:

- alto;
- qualquer mudança no contrato de resposta pode quebrar campos de busca compartilhados.

### useWizardProgress

Responsabilidade:

- gerenciar progresso do wizard;
- armazenar rascunho local;
- decidir avanço, retorno e conclusão conforme validação da etapa.

Entradas esperadas:

- definição das etapas;
- etapa inicial;
- estado inicial do rascunho;
- validadores por etapa.

Saídas esperadas:

- etapa atual;
- progresso;
- rascunho atualizado;
- ações de avançar, voltar e concluir.

Eventos ou callbacks relevantes:

- `nextStep`
- `previousStep`
- `completeWizard`
- `updateDraft`

Dependências relevantes:

- `StepNavigationContainer`;
- persistência local opcional, quando adotada.

Consumidores conhecidos:

- `Frontend/Screens/Create_Team_Wizard.md`

Risco de impacto ao evoluir:

- alto;
- mudanças em persistência de rascunho, conclusão ou navegação afetam todo fluxo por etapas.

### useInterestTracking

Responsabilidade:

- registrar sinais leves de interesse;
- capturar buscas, visualizações e recorrência de navegação;
- servir personalização leve sem criar vínculo explícito.

Entradas esperadas:

- tipo de evento de interesse;
- entidade ou contexto relacionado;
- metadados leves de navegação.

Saídas esperadas:

- registro confirmado;
- estado de envio, se necessário expor;
- fila local, se houver operação offline.

Eventos ou callbacks relevantes:

- `trackSearch`
- `trackView`
- `trackEngagement`

Dependências relevantes:

- camada de analytics;
- regras de privacidade e consentimento aplicáveis.

Usar em:

- experiência neutra;
- sugestão futura de times, atletas, notícias e possíveis follows.

Consumidores conhecidos:

- `Frontend/Screens/Start_Path_Selection.md`
- `Frontend/Screens/Join_Team_Search.md`
- futuras telas neutras e de descoberta

Risco de impacto ao evoluir:

- médio;
- se os eventos rastreados mudarem, afeta analytics, recomendação e consistência de personalização.

## Serviços de aplicação reutilizáveis

### TemporaryUploadPromotionService

Responsabilidade:

- confirmar um token temporário aceito pelo backend;
- promover o arquivo temporário para ativo final;
- devolver referência estável para persistência no domínio correto.

Entradas esperadas:

- token temporário;
- contexto do domínio dono do ativo;
- política de validação do arquivo temporário.

Saídas esperadas:

- referência final do ativo;
- metadados persistíveis;
- erro de promoção, quando houver.

Eventos ou callbacks relevantes:

- confirmação de promoção;
- falha de promoção.

Dependências relevantes:

- backend de mídia;
- estratégia de storage e vínculo de domínio.

Observação de maturidade:

- a promoção pode ser implementada como move, copy + delete, ou outra estratégia equivalente de storage;
- o comportamento estável é consumir o token temporário e devolver uma referência final válida para o domínio.

Observação:

- este item conversa com a estratégia de mídia e com o backend;
- a UI não deve decidir sozinha a promoção do arquivo.

Consumidores conhecidos:

- `POST /api/v1/teams`
- futuro fluxo de atualização de avatar

Risco de impacto ao evoluir:

- alto;
- mudança de confirmação ou promoção final pode quebrar persistência de mídia em mais de um domínio.

## Governança

- Este catálogo é a fonte oficial para reutilização no frontend.
- `Components.md` continua útil como visão resumida de famílias de componentes.
- Este documento é o lugar certo para registrar ativos reutilizáveis com responsabilidade, limites e casos de uso.
- Quando uma tela nova exigir algo parecido, a primeira ação deve ser atualizar este catálogo antes de espalhar a definição em múltiplos arquivos.
