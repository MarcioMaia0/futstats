---
title: Database Tables
status: Draft
version: 0.5.0
owner: Product Architecture
last_update: 2026-07-09
related_documents: []
---

# Database Tables

## Objetivo

Listar as principais tabelas previstas para o FUTSTATS e sua finalidade.

> As colunas detalhadas de cada tabela estão em `../Implementation/Database/Table_Spec_*.md`. Este documento é um mapa de alto nível.

## Identity

### accounts

Camada conceitual de autenticação. Na implementação atual, corresponde a `auth.users` do Supabase, não a uma tabela própria em `public`.

### users

Representa a pessoa dentro da plataforma.

### persons

Representa a identidade canônica da pessoa, com ou sem conta no app.

### roles

Reserva para papéis de gestão customizáveis, caso o projeto evolua além do enum do MVP.

### user_team_roles

Relaciona pessoas, times e permissões de gestão contextuais.

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

### player_match_statistics

Projeção do desempenho do atleta por partida.

### player_profile_summary

Resumo principal pronto para o topo do perfil do atleta.

### player_statistics_summary

Agregação geral do atleta.

### player_statistics_by_modality

Agregação do atleta por modalidade.

### player_statistics_by_team_modality

Agregação do atleta por time e modalidade.

### player_timeline_items

Timeline narrativa pronta do atleta.

### player_gallery_items

Itens da galeria social do atleta.

### player_gallery_group_counters

Contadores rápidos da galeria do atleta.

### player_performance_series

Série temporal pronta para gráficos do atleta.

### player_style_inference

Inferência contextual do estilo de jogo do atleta.

### player_claims

Controla reivindicação de perfis.

### player_attributes

Atributos avaliáveis do jogador.

## Matches

### matches

Representa a partida.

### match_events

Eventos da partida.

### match_players

Atletas relacionados a uma partida por time, inclusive avulsos.

### match_players_positions

Posições usadas no contexto da partida.

### match_staff

Staff efetivo da partida, como técnico.

### match_attendance_responses

Respostas de presença para jogos agendados.

### match_substitutions

Substituições detalhadas da partida.

### match_ratings

Notas dos participantes da partida.

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

Bloqueios de interação aplicados por gestores do time.

## Statistics

### metric_definitions

Define métricas.

### statistics_snapshots

Snapshots agregados.

### team_match_statistics

Estatísticas do time por partida.
