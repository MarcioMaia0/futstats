---
title: Screen: Team Settings
status: Draft
version: 1.3.0
owner: Product Architecture
last_update: 2026-07-09
related_documents:
  - ../../Implementation/Database/Table_Spec_team_settings.md
  - ../../Implementation/Database/Table_Spec_team_social_connections.md
  - ../../API/Teams_API.md
  - Team_Profile.md
---

# Screen: Team Settings

## Objetivo

Permitir que pessoas com gestão do time configurem comportamento, identidade complementar e integrações sociais do time.

## Regra de fronteira com o perfil público

- Esta tela controla configurações internas e operacionais.
- O perfil público do time pode exibir links públicos e identidade visual.
- Esta tela não representa, por padrão, conteúdo público do time.
- Status de conexão, preferência de publicação e ações administrativas pertencem apenas ao contexto de gestão.

## Seções iniciais

- identidade complementar do time;
- aparência do app com as cores do time;
- quadra principal;
- comentários e reações;
- redes sociais conectadas;
- preferências de publicação de eventos.

## Seção: Aparência do app com as cores do time

### Objetivo

Permitir que a gestão escolha como as cores oficiais do time serão aplicadas visualmente no app, sem alterar a ordem oficial dessas cores.

### Contexto

- As cores oficiais do time ficam em `teams` como:
  - `first_color`
  - `second_color`
  - `third_color`
- Esta seção não muda a identidade oficial do time.
- Esta seção define apenas a aplicação visual dessas cores em superfícies do app.

### Campos sugeridos

- `ui_primary_color_source`
- `ui_secondary_color_source`
- `ui_background_color_source`

### Regras

- cada campo escolhe como o app mapeia visualmente:
  - `FIRST_COLOR`
  - `SECOND_COLOR`
  - `THIRD_COLOR`
- a pessoa gestora deve ver preview da composição antes de salvar;
- o preview deve deixar claro, por exemplo, qual cor ficará em:
  - destaque principal;
  - elementos secundários;
  - fundo ou superfície dominante;
- essa configuração existe porque a melhor ordem visual para a interface nem sempre é idêntica à ordem oficial das cores do time;
- a UI deve preservar a linguagem da várzea ao mostrar as cores oficiais como:
  - primeira cor
  - segunda cor
  - terceira cor

## Seção: Redes sociais conectadas

### Objetivo

Permitir cadastrar e vincular as contas oficiais do time em plataformas externas.

### Plataformas iniciais

- YouTube
- Instagram
- TikTok

### Campos e elementos esperados

- handle ou URL pública de cada plataforma;
- status da conexão;
- ação `Conectar` ou `Reconectar`;
- ação `Desconectar`, quando aplicável;
- toggle `Publicar eventos do time nesta rede`;
- informação de última validação da conexão, quando existir.

### Regras

- cadastro de handle público pode existir antes da conexão completa;
- publicação simultânea só é permitida quando a conexão estiver válida;
- a pessoa gestora deve poder desligar publicação automática por plataforma;
- a decisão final de publicar ou não um evento ainda pertence ao fluxo do evento;
- a configuração aqui define capacidade e preferência padrão, não obrigação.

### Tratamento de falha na UI

Se o problema for estrutural da conexão, esta é a tela principal para correção.

Estados esperados por plataforma:

- `Conectado`
- `Conexão pendente`
- `Conexão expirada`
- `Reconexão necessária`
- `Falha de publicação`
- `Publicação desativada`

### Ações corretivas

- `Conectar`
- `Reconectar`
- `Validar novamente`
- `Desconectar`
- `Ativar publicação`
- `Desativar publicação`

### Relação com retry manual de posts

- Quando a falha do evento apontar problema estrutural da conta ou da permissão, a pessoa gestora deve ser trazida para esta tela.
- Esta tela não executa retry do post diretamente.
- O retry do post pertence ao contexto do evento/post.
- Esta tela corrige capacidade estrutural da conta para que um retry futuro possa acontecer.

### Regra de UX

- falha de rede social não deve parecer falha do evento social em si;
- a tela deve explicar o próximo passo correto;
- a pessoa gestora deve entender se o problema é conexão, permissão, expiração ou falha temporária.

### Contrato esperado com a API

- carregar estado atual:
  - `GET /api/v1/teams/:team_id/social-connections`
- editar handle, URL e preferência:
  - `PATCH /api/v1/teams/:team_id/social-connections/:platform`
- iniciar OAuth:
  - `POST /api/v1/teams/:team_id/social-connections/:platform/connect/start`
- concluir OAuth:
  - `POST /api/v1/teams/:team_id/social-connections/:platform/connect/complete`
- desconectar:
  - `POST /api/v1/teams/:team_id/social-connections/:platform/disconnect`
- validar ou revalidar:
  - `POST /api/v1/teams/:team_id/social-connections/:platform/validate`

## Seção: Preferências de publicação

### Campos sugeridos

- `default_publish_team_events`

### Regras

- esse campo sugere o comportamento padrão para novos eventos do time;
- cada evento ainda pode sobrescrever essa sugestão no momento da publicação.
