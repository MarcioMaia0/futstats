---
title: Screen: Share Card
status: Draft
version: 0.1.0
owner: Product Architecture
last_update: 2026-07-07
related_documents:
  - ../../Implementation/Core_Flows/Share_Card_Implementation.md
---

# Screen: Share Card

## Objetivo

Permitir visualizar, gerar e compartilhar cards de resultado e cards derivados da experiencia esportiva.

## Elementos

- preview do card;
- acoes de compartilhar;
- acoes de exportar imagem;
- seletor de variante do card quando aplicavel;
- call-to-action da marca FUTSTATS.

## Campos

Nenhum campo obrigatorio de digitacao. A tela trabalha sobre dados ja existentes da partida, do time ou do atleta.

## Regras de UX

- O card deve usar tema do time quando disponivel.
- Se nao houver tema, usar tema padrao.
- Deve suportar modo claro e escuro.
- Deve ser exportavel para imagem.
- Deve ser compartilhavel em WhatsApp, Instagram e links.
- Nao deve expor dados privados sem permissao.

## Estados

- loading;
- error;
- success;
- offline quando aplicavel.

## Eventos

- gerar card de resultado;
- gerar card de atleta;
- compartilhar imagem ou link;
- copiar link quando disponivel.
