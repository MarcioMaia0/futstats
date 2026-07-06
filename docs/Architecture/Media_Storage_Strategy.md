---
title: Media Storage Strategy
status: Draft
version: 0.9.0
owner: Product Architecture
last_update: 2026-07-06
---

# Media Storage Strategy


## Objetivo

Definir como o FUTSTATS deve lidar com imagens, escudos, vídeos e cards.

## Tipos de mídia

- escudo do time;
- foto do atleta;
- imagem de card;
- thumbnail de vídeo;
- clipe de lance;
- vídeo completo externo;
- assets de tema.

## Regras

1. Vídeos completos podem começar como links externos.
2. Clipes curtos podem ser armazenados futuramente.
3. Cards devem ser geráveis a partir de templates.
4. Mídia deve ter política de privacidade.
5. Conteúdo denunciado deve poder ser ocultado.

## Estratégia inicial

Usar storage de objetos para imagens e cards, e links externos para vídeos longos.
