---
title: Current Project Status
status: Review
version: 0.1.0
owner: Product Architecture
last_update: 2026-07-20
related_documents:
  - ./Handoff_Guide.md
  - ./Launch_Snapshot_Build_Sequence.md
  - ./Open_Issues.md
  - ../API/Auth_API.md
  - ../API/Teams_API.md
  - ../Frontend/Screens/Create_Team_Wizard.md
  - ../Frontend/Screens/Team_Profile.md
  - ../Frontend/Screens/Team_Settings.md
  - ../Frontend/Screens/Team_Roster.md
---

# Current Project Status

## Objetivo

Registrar o estado real do desenvolvimento em 2026-07-20 para retomada do projeto sem depender do histórico da conversa.

## Stack e validação

- App mobile em React Native + Expo, dentro de `apps/mobile`.
- Backend atual em Supabase remoto, projeto `vjivzajsnbhunnbacrgh`.
- O MCP do Supabase foi usado com sucesso para validar e aplicar migrations recentes.
- `npm run typecheck` em `apps/mobile` passou após as últimas alterações de código.
- A documentação ativa fica em `docs`. Pastas `docs/backup-*` são snapshots históricos e não representam necessariamente o estado atual.

## Estado funcional

### Autenticação e identidade

- Login por e-mail/senha e Google OAuth estão conectados ao app.
- A tela de login aceita identificador único:
  - se tiver `@`, tenta autenticar como e-mail e, se não resolver, busca `username`;
  - se não tiver `@`, busca primeiro `username` e depois `contact_phone`;
  - telefone é apenas identificador de busca em `public.users.contact_phone`, não fator de autenticação.
- A criação de conta exige telefone com DDD quando o telefone é informado e persiste o valor normalizado em formato brasileiro E.164 (`+55...`).
- O bootstrap de usuário sincroniza avatar do provider social para o bucket público `user-avatars` e grava a URL em `public.users.avatar_url`.
- O menu inferior usa a imagem do usuário no item Perfil, com fallback para ícone.

### Criação e configuração de time

- O Create Team Wizard pode ser aberto diretamente por URL com `?wizardteam=true` para testes sem passar pelo fluxo completo.
- O wizard cria time com nome mínimo e permite complementar:
  - escudo;
  - data de fundação;
  - cores;
  - modalidades;
  - quantidade padrão de quadros por modalidade;
  - quadra principal;
  - localidade;
  - redes sociais.
- A configuração de time hidrata dados do banco e persiste alterações no botão de salvar.
- O modelo de quadras foi ajustado para permitir múltiplas quadras por time.
- `team_modalities.default_match_frame_count` guarda a quantidade padrão de quadros por modalidade (`1` ou `2`).

### Perfil do time

- A tela principal do time lê dados do time criado.
- O menu de ações rápidas usa comportamento sticky; o cabeçalho superior recolhe e o conteúdo rola abaixo do menu.
- A solução atual de rolagem está aceitável, mas a sobreposição de backgrounds translúcidos ainda deve ser considerada em futuras mudanças visuais.
- Cards principais já receberam ícones:
  - próximo jogo;
  - última publicação;
  - elenco em destaque;
  - agenda.
- Alguns cards ainda são parcialmente placeholders até a implementação completa de jogos, publicações e agenda.

### Elenco

- A tela de elenco lê dados reais do banco por `fetchTeamRoster`.
- Os filtros de modalidade respeitam apenas as modalidades configuradas no time.
- Quando existe apenas uma modalidade configurada, o filtro visual pode ser omitido.
- Jogadores são agrupados por modalidade e por quadro usando `team_player_frame_defaults`.
- Existe container separado para atletas sem quadro definido, escondido quando não há itens.
- A criação rápida de pessoa/jogador persiste no banco por RPC e atualiza a tela após salvar.
- A interface já usa labels e abreviações de posição globais para exibição compacta.
- Avatares de diretoria/comissão/jogadores usam `public.users.avatar_url` quando disponível, com fallback para ícone.

### Solicitações e notificações

- A tela de notificações exibe solicitações de entrada no time.
- O modal de aprovação tem rolagem para funcionar em celular na horizontal.
- Ao aprovar uma solicitação, a gestão pode escolher papéis e, se a pessoa for jogador, configurar modalidade e quadro conforme as modalidades do time.
- O desenho de permissões para a futura tela de configuração de integrante está definido:
  - jogador e comissão editam apenas as próprias configurações e visualizam as dos outros;
  - diretoria edita jogadores, comissão e a própria configuração;
  - presidência edita todos.

### Sistema visual e ícones

- Foi criada uma tela `Icon Preview` como referência de ícones usados no app.
- A tela está ligada temporariamente ao botão Buscar do menu inferior do time.
- Ícones já foram adicionados em login, criação de conta, wizard de time, perfil do time e elenco.
- Ainda falta padronizar mais telas para reduzir excesso de texto e aumentar reconhecimento visual.

## Banco e migrations recentes

Além da migration inicial de identidade e times, o desenvolvimento recente adicionou:

- leitura de perfis de usuário para elenco;
- RPC de criação rápida de pessoa/jogador no time;
- quantidade padrão de quadros por modalidade em `team_modalities`;
- tabela `team_player_frame_defaults`;
- resolução de login por identificador (`resolve_login_identifier`);
- hardening da RPC de resolução de login;
- bucket público `user-avatars` com políticas de acesso para avatar do usuário.

## Status da fase

A fase atual continua no bloco de time, elenco e onboarding operacional. A fase 6 não deve ser considerada encerrada.

O próximo passo recomendado é terminar a tela de visualização/configuração de integrantes do time, porque ela fecha a governança de elenco antes de voltar para partida rápida e agenda.

## Pendências principais

- Construir a tela de view/config dos integrantes do time com as permissões por papel.
- Finalizar persistência/edição completa das configurações esportivas por integrante.
- Implementar fluxo completo de partida rápida.
- Substituir placeholders de próximo jogo, publicação e agenda por dados reais.
- Ampliar testes manuais e automatizados para auth, criação de time, settings, elenco, notificações e avatars.
- Revisar RLS e policies com foco em dados de time, elenco, solicitações e storage.
