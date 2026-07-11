---
title: Social Experience PRD
status: Review
version: 1.0.0
owner: Product Architecture
last_update: 2026-07-06
related_documents:
  []
---

# PRD: Social Experience

## Objetivo

Definir a experiência social do FUTSTATS como principal motor de adoção inicial.

## Funcionalidades

- Card de resultado.
- Feed do time.
- Perfil de jogador.
- Perfil de time.
- Curtidas.
- Comentários.
- Compartilhamento.
- Resenha pública.
- Posts automáticos de partida.

## Regras

1. Card de resultado deve estar no recorte inicial de lançamento.
2. Usuário deve compartilhar sem preencher dados avançados.
3. Comentários e resenha devem ter moderação.
4. O time deve controlar exposição pública.

## Eventos de produto

- `match_card_generated`
- `match_card_shared`
- `post_created`
- `post_reacted`
- `comment_created`
- `player_profile_viewed`

## Riscos

- Conteúdo ofensivo.
- Exposição indesejada.
- Resenha virar conflito.
- Feed vazio no início.

## Mitigações

- Denúncia.
- Controle de privacidade.
- Empty states bons.
- Conteúdo automático de partidas.
