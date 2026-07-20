---
title: Open Issues
status: Review
version: 1.2.0
owner: Product Architecture
last_update: 2026-07-20
related_documents:
  - ./Current_Project_Status.md
  - ./Launch_Snapshot_Build_Sequence.md
---

# Open Issues

## Objetivo

Registrar decisões e lacunas ainda abertas no estado atual do projeto.

## Decisões já fechadas

- Stack atual: React Native + Expo no mobile.
- Backend atual: Supabase remoto.
- Autenticação atual: Supabase Auth com e-mail/senha e Google OAuth.
- Login por identificador: e-mail, username ou telefone de contato resolvido por RPC.
- Storage inicial: Supabase Storage.
- Avatares de usuário: bucket público `user-avatars` com URL persistida em `public.users.avatar_url`.
- Modalidades do time: `team_modalities`.
- Quantidade padrão de quadros por modalidade: `team_modalities.default_match_frame_count`.
- Quadro padrão do jogador por modalidade: `team_player_frame_defaults`.

## Produto

- Definir branding final.
- Definir nomes comerciais dos planos.
- Definir limites do plano gratuito.
- Definir se haverá verificação de times no recorte inicial.
- Definir política de conteúdo público.
- Definir o nível de exposição pública do elenco, comissão, diretoria e presidência em times abertos.

## Desenvolvimento ativo

- Construir a tela de visualização/configuração de integrantes do time.
- Aplicar permissões por papel na configuração de integrantes:
  - jogador e comissão editam apenas a própria configuração;
  - diretoria edita jogadores, comissão e a própria configuração;
  - presidência edita todos.
- Fechar persistência/edição de modalidade, quadro e posição por integrante.
- Retomar a fase 6 após a tela de integrantes.
- Implementar partida rápida com dados reais.
- Substituir placeholders de próximo jogo, última publicação, elenco em destaque e agenda por leituras reais.

## UX

- Continuar a troca gradual de texto por ícones nas telas principais.
- Consolidar a tela `Icon Preview` como referência de ícones e evitar divergência entre telas.
- Validar a solução atual de rolagem sticky do perfil do time em aparelhos pequenos e orientação horizontal.
- Revisar contraste e legibilidade com temas de time, evitando cores mockadas em telas configuráveis.

## Dados e segurança

- Revisar RLS das tabelas de time, integrantes, solicitações, elenco e storage.
- Criar testes ou checklist manual para:
  - login por identificador;
  - criação de conta com telefone;
  - criação de time;
  - settings de time;
  - criação rápida de jogador;
  - aprovação de solicitação;
  - avatar do provider social;
  - elenco por modalidade e quadro.
- Verificar comportamento de usuários antigos que ainda tenham `avatar_url` apontando diretamente para provider externo.
- Rodar lint SQL local quando a stack local do Supabase estiver operacional.
