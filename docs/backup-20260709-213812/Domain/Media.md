---
title: Media Domain
status: Draft
version: 0.5.0
owner: Product Architecture
last_update: 2026-07-06
related_documents: [Social.md, Matches.md]
---

# Media Domain

## Objetivo

Definir como imagens, vídeos, clipes e assets visuais são usados no FUTSTATS.

## Contexto

Vídeos e imagens são essenciais para social, resenha, memória e análise.

## Entidades

### MediaAsset

Arquivo ou link de mídia.

### MatchHighlight

Lance associado a uma partida.

### PlayerHighlight

Lance associado a um jogador.

### ShareCard

Imagem gerada para compartilhamento.

## Regras

1. Mídia pode ser link externo ou arquivo próprio.
2. Lance pode estar associado a evento específico.
3. Card deve usar identidade visual do time.
4. Conteúdo público deve respeitar privacidade.
5. Usuário deve poder remover mídia enviada por ele quando permitido.
6. Mídia de análise pode ser privada.

## Casos de uso

- Adicionar vídeo completo.
- Adicionar clipe de gol.
- Gerar card do jogo.
- Compartilhar imagem.
- Vincular lance a jogador.
- Moderar mídia.

## Decisão

Mídia atende social, inteligência e legado simultaneamente.
