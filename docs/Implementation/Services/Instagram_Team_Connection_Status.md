---
title: Instagram Team Connection Status
status: Draft
version: 0.1.0
owner: Engineering
last_update: 2026-07-16
related_documents:
  - ../../Frontend/Screens/Team_Settings.md
  - ../../API/Teams_API.md
  - ../Database/Table_Spec_team_social_connections.md
  - ../Database/Table_Spec_social_connection_secrets.md
---

# Instagram Team Connection Status

## Objetivo

Registrar o estado real da implementacao da conexao de Instagram para `team_social_connections`.

## Contexto

O projeto decidiu priorizar Instagram antes de YouTube e TikTok porque essa e a rede mais relevante para o tipo de publicacao esportiva e social previsto no FUTSTATS.

## Status geral

Estado em 2026-07-16:

- backend estrutural: parcialmente implementado
- app mobile/web: parcialmente implementado
- persistencia: implementada
- OAuth real em producao: nao concluido
- teste ponta a ponta com conta profissional: pendente
- item pausado na configuracao do app da Meta

## Ponto exato de pausa

Integracao pausada em `2026-07-16` no primeiro bloco externo ao codigo:

- criar o app na Meta for Developers;
- habilitar `Instagram Login`;
- localizar e copiar:
  - `INSTAGRAM_APP_ID`
  - `INSTAGRAM_APP_SECRET`;
- cadastrar a redirect URI oficial.

Ao retomar, o primeiro passo nao e mais mexer no codigo.

O primeiro passo e:

1. abrir o painel `Meta for Developers`;
2. criar o app;
3. habilitar `Instagram Login`;
4. cadastrar a redirect URI abaixo.

### Redirect URI prevista no projeto

Para ambiente web local, o valor planejado hoje e:

`http://localhost:8081/?screen=team-settings&social_provider=instagram`

Observacao:

- esse valor precisa ser identico no app da Meta e no secret `INSTAGRAM_REDIRECT_URI` do Supabase.

## O que ja foi feito

### Banco e contrato

- `team_social_connections` ja existia e esta pronta para:
  - `handle`
  - `channel_url`
  - `connection_status`
  - `access_token_ref`
  - `refresh_token_ref`
  - `token_expires_at`
  - `publish_events_enabled`
  - `last_validated_at`
- `social_connection_secrets` foi criada para guardar segredos fora da tabela principal.
- a constraint de banco impede `publish_events_enabled = true` quando `connection_status <> CONNECTED`.

### App

- a tela de configuracoes do time carrega e salva os dados de `team_social_connections`;
- o card de Instagram ja mostra:
  - handle publico
  - URL publica
  - status da conexao
  - ultima validacao
  - conectar
  - validar
  - desconectar
  - toggle de publicacao
- o app aceita `/?screen=team-settings`, necessario para callback web do Instagram.

### Servicos criados

- `apps/mobile/src/features/teams/services/teamSocialConnectionsService.ts`
- `apps/mobile/src/features/teams/services/teamInstagramConnectionService.ts`

### Backend

- foi criada a edge function:
  - `supabase/functions/team-social-instagram/index.ts`
- ela ja tem estrutura para:
  - `start`
  - `complete`
  - `validate`

## O que esta funcionando hoje

### Funciona de verdade

- salvar no banco o `handle` e a `URL publica`;
- carregar esse estado de volta na tela;
- marcar `REVOKED` ao desconectar;
- bloquear publicacao automatica quando a conexao nao estiver `CONNECTED`;
- preparar a URL oficial de autorizacao do Instagram, desde que as credenciais estejam configuradas.

### Funciona tecnicamente, mas depende de ambiente externo

- abrir o fluxo oficial de `Instagram Login`;
- concluir a conexao com `authorization_code`;
- trocar token curto por token long-lived;
- validar a conta conectada em `graph.instagram.com/me`.

Esses pontos so funcionarao quando o projeto tiver:

- app da Meta configurado;
- `redirect_uri` exata cadastrada;
- secrets configurados no Supabase;
- conta Instagram profissional para teste.

## O que ainda falta

### Infraestrutura

- publicar a edge function no projeto Supabase real;
- configurar:
  - `SUPABASE_SERVICE_ROLE_KEY`
  - `INSTAGRAM_APP_ID`
  - `INSTAGRAM_APP_SECRET`
  - `INSTAGRAM_REDIRECT_URI`
  - `SOCIAL_CONNECTION_ENCRYPTION_KEY`

### Meta

- criar ou ajustar um app com `Instagram Login`;
- registrar a `Valid OAuth Redirect URI`;
- validar se os escopos desejados estao habilitados;
- preparar o caminho de review se a Meta exigir acesso adicional.

### Estado atual do bloqueio

Bloqueio atual nao esta no app FUTSTATS.

Bloqueio atual esta na configuracao inicial da Meta, que ainda nao foi concluida.

### Produto e engenharia

- implementar `disconnect` como acao dedicada no backend social;
- decidir se `state` sera persistido server-side;
- decidir politica de refresh do token;
- definir estrategia de fallback quando a conta deixar de ser profissional;
- replicar o padrao para YouTube e TikTok depois.

## Requisitos de negocio para teste real

Para o teste ponta a ponta ser valido, a conta usada precisa ser:

- uma conta Instagram profissional;
- do tipo `Business` ou `Creator`;
- autorizada dentro do contexto do app configurado na Meta.

## Comportamento esperado com conta pessoal

Se a pessoa tentar conectar uma conta pessoal do Instagram:

- o fluxo pode ate retornar da Meta;
- a validacao final deve falhar no backend;
- `team_social_connections.connection_status` deve ficar em `ERROR`;
- `publish_events_enabled` deve permanecer `false`;
- a UI deve informar claramente:
  - que a conta conectada nao e profissional;
  - que e necessario usar uma conta `Business` ou `Creator`.

## Checklist para concluir a tarefa

### Bloco 1 - ambiente

- [ ] App da Meta criado e configurado para Instagram Login
- [ ] Redirect URI oficial cadastrada
- [ ] Segredos configurados no Supabase
- [ ] Edge function publicada

### Bloco 2 - teste tecnico

- [ ] `Conectar conta` abre a autorizacao oficial
- [ ] callback retorna para `team-settings`
- [ ] `complete` persiste token seguro
- [ ] `connection_status` vira `CONNECTED`
- [ ] `handle` e `channel_url` sao reconciliados com a conta real
- [ ] `validate` reconsulta a conta com sucesso

### Bloco 3 - regra de produto

- [ ] `Publicar eventos nesta rede` so ativa em conta conectada
- [ ] `disconnect` força `publish_events_enabled = false`
- [ ] status expirada aparece corretamente quando o token vencer

## Como considerar esta task pronta

Esta task so deve ser considerada concluida quando:

1. o fluxo `start -> complete -> validate` funcionar com conta profissional real;
2. a tela refletir o estado real da conta conectada;
3. o banco guardar o token de forma segura;
4. a conexao puder ser desligada corretamente.

## Observacao importante

No estado atual do projeto, a implementacao ja esta preparada para continuar sem retrabalho estrutural grande. O principal bloqueio deixou de ser modelagem e passou a ser configuracao real do provedor e disponibilidade de uma conta profissional de teste.
