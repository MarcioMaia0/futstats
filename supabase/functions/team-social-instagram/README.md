---
title: Edge Function README - team-social-instagram
status: Draft
version: 0.1.0
owner: Engineering
last_update: 2026-07-16
---

# team-social-instagram

## Objetivo

Implementar a conexao oficial de um time com Instagram usando o fluxo atual da Meta para `Instagram API with Instagram Login`.

## Escopo atual

Esta funcao cobre a base do fluxo para o contexto de `team_social_connections`:

- montar a URL oficial de autorizacao;
- concluir a troca de `authorization_code` por token;
- trocar token curto por token long-lived;
- consultar o perfil conectado para validar a conta;
- persistir status e metadados de conexao em `team_social_connections`;
- guardar o token de acesso de forma segura em `social_connection_secrets`.

## Arquivos relacionados

- `apps/mobile/src/features/teams/services/teamInstagramConnectionService.ts`
- `apps/mobile/src/features/teams/screens/TeamSettingsScreen.tsx`
- `docs/Implementation/Services/Instagram_Team_Connection_Status.md`
- `docs/Frontend/Screens/Team_Settings.md`
- `docs/Implementation/Database/Table_Spec_team_social_connections.md`
- `docs/Implementation/Database/Table_Spec_social_connection_secrets.md`

## Actions suportadas

- `start`
- `complete`
- `validate`

## Variaveis obrigatorias no Supabase

- `SUPABASE_SERVICE_ROLE_KEY`
- `INSTAGRAM_APP_ID`
- `INSTAGRAM_APP_SECRET`
- `INSTAGRAM_REDIRECT_URI`
- `SOCIAL_CONNECTION_ENCRYPTION_KEY`

## Redirect URI

### Web local

Exemplo atual para web local:

`http://localhost:8081/?screen=team-settings&social_provider=instagram`

### Regra

- o valor salvo em `INSTAGRAM_REDIRECT_URI` deve ser identico ao configurado no app da Meta;
- o `redirect_uri` enviado no `start` e no `complete` precisa ser exatamente o mesmo;
- qualquer diferenca de barra, dominio, protocolo ou query string quebra o exchange do codigo.

## Permissoes esperadas

Base inicial planejada:

- `instagram_business_basic`
- `instagram_business_content_publish`

Observacao:

- pode ser necessario pedir acessos adicionais depois, conforme o escopo final de publicacao e leitura.

## O que ja foi implementado

- `start` monta `authorization_url` oficial para Instagram Login;
- `complete` faz:
  - exchange do codigo por token curto;
  - exchange do token curto por token long-lived;
  - leitura do perfil em `graph.instagram.com/me`;
  - persistencia da conexao no time;
  - armazenamento do token em `social_connection_secrets`;
- `validate`:
  - carrega o token seguro;
  - consulta novamente o perfil;
  - atualiza `last_validated_at`;
  - marca `EXPIRED` se o token ja estiver vencido.

## O que ainda falta

- deploy da edge function no projeto Supabase real;
- cadastro do app Instagram na Meta com `Instagram Login`;
- configuracao dos segredos reais no projeto Supabase;
- teste ponta a ponta com conta Instagram profissional;
- persistencia e uso de refresh/re-issue do token, se o comportamento final exigir;
- endurecimento do `state` com persistencia server-side, se quisermos elevar o nivel de seguranca do callback;
- endpoint/acao explicita de `disconnect` no backend social dedicado;
- suporte real para TikTok e YouTube.

## Limites atuais

- o fluxo real depende de conta `Business` ou `Creator`;
- sem app configurado na Meta, o `start` pode gerar erro de ambiente;
- sem conta profissional, nao existe validacao final do fluxo;
- a criptografia atual usa `AES-GCM` com chave derivada de `SOCIAL_CONNECTION_ENCRYPTION_KEY`;
- essa primeira versao e funcional para prototipo tecnico, mas ainda nao passou por auditoria de seguranca.

## Passos de deploy futuros

1. Criar ou ajustar o app na Meta.
2. Habilitar `Instagram Login`.
3. Cadastrar a `Valid OAuth Redirect URI`.
4. Configurar os segredos no projeto Supabase.
5. Publicar a edge function.
6. Testar `start`.
7. Testar `complete`.
8. Testar `validate`.
9. Testar `disconnect`.

## Resultado esperado quando completo

Ao clicar em `Conectar conta` no card de Instagram:

1. o app salva os dados publicos do card;
2. abre a autorizacao oficial da Meta;
3. retorna para a tela de configuracoes do time;
4. conclui a conexao automaticamente;
5. atualiza o card para `Conectada`;
6. permite `Publicar eventos nesta rede`.
