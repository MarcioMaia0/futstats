---
title: Database Tables
status: Draft
version: 0.7.0
owner: Product Architecture
last_update: 2026-07-14
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

Representa a presença autenticada da pessoa dentro da plataforma.

### persons

Representa a identidade canônica da pessoa, com ou sem conta no app.

### person_social_connections

Representa os links sociais públicos da pessoa canônica, reutilizáveis por atleta, dirigente, comissão, técnico e outros papéis.

### user_preferences

Preferências da experiência da pessoa no app.

### user_team_roles

Papéis contextuais de gestão ou participação interna do usuário autenticado no time.

### roles

Reserva conceitual para futura evolução de papéis customizáveis, além do enum atual do produto.

## Teams

### teams

Representa um time.

### team_members

Representa o pertencimento-base entre pessoa e time.

### team_modalities

Representa as modalidades preferenciais declaradas pelo time, sem limitar partidas futuras em outras modalidades.

### team_players

Representa o vínculo esportivo oficial entre integrante-atleta e time.

### team_player_frame_defaults

Pré-configuração logística de quadro por modalidade para leitura de presença e organização do elenco.

### team_staff_defaults

Configuração padrão de staff do time, hoje focada em técnico por modalidade.

### team_settings

Configurações operacionais e de experiência do time.

### team_social_connections

Conexões sociais do time com plataformas externas.

### team_join_requests

Solicitações para entrar em um time.

### team_blocks

Bloqueios de interação aplicados por gestores do time.

## Players

### players

Representa o perfil esportivo canônico do atleta.

### player_modalities

Modalidades declaradas do atleta.

### player_positions

Posições declaradas do atleta por modalidade.

### player_match_statistics

Projeção do desempenho factual do atleta por partida.

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

## Scheduled Matches

### scheduled_matches

Representa o compromisso futuro de jogo antes da partida operacional.

### match_attendance_responses

Respostas de presença ao compromisso agendado, por integrante do time.

## Matches

### matches

Representa a partida operacional. No estado atual, cada `match` já representa um quadro específico.

### match_players

Atletas relacionados à partida por time, inclusive avulsos.

### match_players_positions

Posições realmente usadas pelo atleta no contexto daquela partida.

### match_staff

Staff efetivo da partida, como técnico.

### match_operator_assignments

Distribuição de responsabilidades operacionais da partida entre usuários autenticados.

### match_events

Linha fina de acontecimentos e scout contextual da partida.

### match_substitutions

Substituições detalhadas da partida.

### match_goals

Camada operacional sensível de gols e leitura de placar.

### match_opponent_players

Elenco adversário contextual daquela partida.

### match_ratings

Notas sociais e contextuais da partida para jogadores e técnico, separando `PEER` e `GENERAL`.

### match_cards

Cards compartilháveis gerados a partir da partida.

### match_status_history

Possível evolução futura para trilha de estados da partida. Não é tabela canônica do estado atual.

### match_links

Possível evolução futura para relacionar partidas entre si. Não é tabela canônica do estado atual.

## Venues and Opponents

### venues

Locais, quadras e campos.

### local_opponents

Adversários privados por time.

### local_opponent_players

Jogadores adversários privados, reutilizáveis, ligados a um `local_opponent`.

## Referees

### referees

Cadastro mestre de árbitros formais.

### match_referees

Arbitragem efetiva vinculada à partida, podendo ser formal, ad-hoc ou externa não identificada.

### referee_reviews

Avaliações da atuação da arbitragem na partida.

## Social

### posts

Publicações.

### comments

Comentários.

### reactions

Reações.

### follows

Relações de seguir entre usuários, times e atletas.

### media_assets

Imagens e vídeos persistidos.

### notifications

Notificações da plataforma.

### post_distribution_attempts

Persistência operacional das tentativas de distribuição externa de posts.

## Statistics

### metric_definitions

Define métricas e semânticas analíticas.

### statistics_snapshots

Snapshots agregados prontos para leitura mais rápida.
