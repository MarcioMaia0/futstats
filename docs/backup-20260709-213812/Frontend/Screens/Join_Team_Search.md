---
title: Screen: Join Team Search
status: Draft
version: 0.2.0
owner: Product Architecture
last_update: 2026-07-09
related_documents:
  - ../../Domain/Identity.md
  - ../../Domain/Teams.md
  - ../../API/Identity_API.md
  - ../../API/Teams_API.md
  - ../../Implementation/Database/Table_Spec_team_join_requests.md
  - ../../Implementation/Database/Table_Spec_user_team_roles.md
  - Start_Path_Selection.md
  - Home_Dashboard.md
---

# Screen: Join Team Search

## Objetivo

Permitir que a pessoa busque um time do qual já faz parte e envie uma solicitação de entrada, sem criar vínculo final automático.

Componente sugerido: `JoinTeamSearchScreen`.

## Quando aparece

- quando a pessoa escolhe `Entrar em um time` em `Start Path Selection`;
- em futuros pontos do produto onde a pessoa queira solicitar entrada em um novo time.

## Estrutura geral da tela

### Bloco superior inicial

- título principal explicando o objetivo da tela;
- texto curto orientando a pessoa a procurar um time;
- campo de busca principal.

### Bloco de resultados

- lista de times encontrados;
- cada item com:
  - escudo;
  - nome do time;
  - localidade resumida quando disponível;
  - affordance clara de seleção.

### Bloco inferior contextual

- inicialmente oculto;
- passa a aparecer depois da primeira solicitação enviada;
- contém:
  - mensagem de continuidade;
  - CTA para seguir para a Home neutra.

## Conteúdo visível

### Estado inicial

Título sugerido:

`Encontre um time que você já faz parte`

Texto de apoio:

`Busque o nome do time e envie uma solicitação para entrar.`

### Estado após primeira solicitação enviada

Título principal muda para:

`Quer se juntar a mais algum time?`

Mensagem de confirmação mais recente:

`Solicitação enviada para o time X`

Essa confirmação pode exibir:

- escudo do time;
- nome do time;
- estado resumido da solicitação enviada.

Mensagem inferior:

`Enquanto aguarda a aprovação, veja o que está rolando por aí!!!`

CTA:

`Ir para a Home`

## Campos

- `team_search_query`

Sem formulário adicional nesta tela.

## Ações principais

### Buscar time

- a pessoa digita no campo de busca;
- a tela mostra resultados relevantes;
- usa `GET /api/v1/teams/search`;
- pode haver debounce e busca incremental depois, mas isso é detalhe técnico futuro.

### Selecionar time

- tocar em um resultado abre um modal de confirmação;
- selecionar o time não envia a solicitação automaticamente.
- a disponibilidade da ação deve respeitar `request_context.can_request_join`.

### Confirmar solicitação

- modal confirma a intenção de enviar solicitação;
- ao confirmar, o sistema chama `POST /api/v1/teams/:team_id/join-requests`;
- se der certo, a tela atualiza o estado contextual.

### Buscar outro time

- permanece na mesma tela;
- mantém o campo de busca disponível;
- atualiza a confirmação visual para a solicitação mais recente enviada.

### Ir para a Home

- disponível após a primeira solicitação enviada;
- encaminha para a Home neutra;
- não cancela as solicitações já enviadas.

## Modal de confirmação

### Objetivo

Evitar envio acidental e deixar claro que a entrada não é automática.

### Conteúdo esperado

- nome e escudo do time;
- texto curto explicando que será enviada uma solicitação;
- ação primária `Enviar solicitação`;
- ação secundária `Cancelar`.

### Regra

O vínculo com o time não nasce neste modal.

O modal apenas confirma a criação da solicitação.

## Regras de domínio refletidas na tela

- a tela cria solicitação, não vínculo final;
- a tela não cria `user_team_roles`;
- a tela não coloca a pessoa no elenco;
- a tela não cria perfil esportivo completo;
- a tela não transforma a pessoa em membro do time automaticamente.

## Validações antes de enviar

Antes de criar a solicitação, o sistema deve verificar:

1. se já existe solicitação pendente para aquele time;
2. se a pessoa já faz parte daquele time.

Se qualquer verificação falhar:

- o envio é bloqueado;
- a pessoa recebe mensagem clara e específica.

Exemplos conceituais de feedback:

- `Você já enviou uma solicitação para este time.`
- `Você já faz parte deste time.`

### Resultado esperado da busca

Cada item retornado pela API deve trazer pelo menos:

- `team_id`
- `name`
- `slug`
- `crest_url`
- `location_label`
- `request_context`

`request_context` deve permitir à UI identificar:

- se a pessoa já faz parte do time;
- se já existe solicitação pendente;
- se ainda pode solicitar entrada.

## Estados da tela

### initial

- título inicial;
- campo de busca vazio ou pronto para uso;
- nenhuma solicitação enviada ainda.

### searching

- busca em andamento;
- loading leve na lista.

### results

- resultados exibidos;
- pessoa pode selecionar um time.

### empty_results

- nenhum time encontrado;
- oferecer orientação para ajustar a busca.

### confirm_modal_open

- modal ativo aguardando decisão.

### request_sent

- solicitação enviada com sucesso;
- tela muda o texto principal;
- mostra confirmação mais recente;
- habilita CTA para Home.

### validation_error

- solicitação bloqueada por regra;
- mantém a pessoa no fluxo sem quebrar a busca.

### request_error

- erro operacional ao enviar;
- pode oferecer retry.

### offline

- busca ou envio indisponíveis;
- exibir aviso claro;
- CTA para Home pode continuar disponível se fizer sentido no produto.

## Regras de UX

- a busca deve ser o foco principal da tela;
- a confirmação de solicitação precisa deixar claro que a entrada depende de aprovação;
- a interface deve incentivar continuidade sem pressionar a pessoa a enviar múltiplas solicitações;
- a mensagem pós-envio deve ser clara e visualmente reconfortante;
- quando houver mais de uma solicitação enviada, a UI pode mostrar confirmação de uma por vez, priorizando a mais recente;
- a ida para a Home neutra deve parecer continuação natural, não saída de erro;
- a tela deve evitar sensação de limbo.

## Persistência conceitual

### O que persiste

- uma solicitação de entrada no time em `team_join_requests`, após confirmação.
- a criação da linha acontece por `POST /api/v1/teams/:team_id/join-requests`.

### O que não persiste nesta tela

- vínculo final com o time;
- papel de gestão;
- entrada no elenco;
- perfil esportivo completo;
- follow automático.

## Dependências técnicas futuras

- endpoint de busca de times já definido em `GET /api/v1/teams/search`;
- endpoint de criação de solicitação de entrada já definido em `POST /api/v1/teams/:team_id/join-requests`;
- validação de pendência existente e vínculo já existente deve acontecer dentro da própria criação;
- componente global reutilizável de busca com resultados;
- modal reutilizável de confirmação.

## Assuntos relacionados, mas não resolvidos aqui

- fluxo de aprovação pelo time;
- modal ou tela de definição da função inicial no momento da aprovação;
- tratamento de múltiplas solicitações pendentes no nível de domínio;
- momento exato em que o cadastro esportivo fino do atleta é retomado após aprovação.

## Regra operacional complementar

- após `POST /api/v1/teams/:team_id/join-requests` com sucesso, a pessoa solicitante segue seu fluxo normalmente;
- a notificação para quem gerencia o time é efeito derivado do backend;
- esta tela não precisa esperar confirmação de entrega da notificação para avançar.
