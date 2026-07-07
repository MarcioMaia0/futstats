---
title: Database Tables
status: Draft
version: 0.4.0
owner: Product Architecture
last_update: 2026-07-06
related_documents: []
---

# Database Tables

## Objetivo

Listar as principais tabelas previstas para o FUTSTATS e sua finalidade.

> As colunas detalhadas de cada tabela estão em `../Implementation/Database/Table_Spec_*.md` (fonte única). Este documento é um mapa de alto nível; algumas tabelas aqui ainda são visão e podem não ter spec definida.

## Identity

### accounts

Armazena autenticação. Representa login e provedores externos.

### users

Representa a pessoa dentro da plataforma.

### roles

Define papéis possíveis.

### user_team_roles

Relaciona usuários, times e permissões.

## Teams

### teams

Representa um time.

### team_players

Relaciona jogadores a times.

### team_settings

Define configurações do time.

### team_invites

Controla convites.

## Players

### players

Representa perfil esportivo.

### player_claims

Controla reivindicação de perfis.

### player_attributes

Atributos avaliáveis do jogador.

## Matches

### matches

Representa a partida.

### match_events

Eventos da partida.

### match_appearances

Participação de atletas (jogador ou técnico).

### match_ratings

Notas dos participantes da partida (peer e geral).

### match_status_history

Histórico de status.

### match_links

Vínculo entre jogos, como primeiro e segundo quadro.

## Venues and Opponents

### venues

Locais e quadras.

### local_opponents

Adversários privados por time.

## Referees

### referees

Cadastro de árbitros.

### match_referees

Árbitros vinculados à partida.

### referee_reviews

Avaliações de arbitragem.

## Experience

### themes

Temas visuais.

### user_preferences

Preferências pessoais.

### team_experience_settings

Preferências do time.

### ui_vocabulary

Vocabulário por modo de linguagem.

## Social

### posts

Publicações.

### comments

Comentários.

### reactions

Reações.

### follows

Seguidores.

### media_assets

Imagens e vídeos.

### team_blocks

Bloqueios de interação aplicados por diretores (moderação).

## Statistics

### metric_definitions

Define métricas.

### statistics_snapshots

Snapshots agregados.

### player_match_statistics

Estatísticas de jogador por partida.

### team_match_statistics

Estatísticas do time por partida.
