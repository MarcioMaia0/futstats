---
title: Media Storage Strategy
status: Draft
version: 1.1.0
owner: Product Architecture
last_update: 2026-07-09
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

## Estratégia para uploads temporários

- Uploads de imagem não devem nascer diretamente como ativos finais de domínio.
- O cliente primeiro envia a mídia para uma área temporária de storage.
- O backend devolve um token opaco de curta duração para representar esse upload temporário.
- O token temporário deve carregar, ao menos em nível lógico:
  - dono do upload;
  - propósito do upload;
  - localização temporária do arquivo;
  - status do upload;
  - expiração;
  - marca de consumo único.
- A promoção para ativo final deve acontecer apenas quando um endpoint de negócio aceitar esse token.

## Estratégia inicial para escudo de time

- O propósito canônico do upload é `TEAM_CREST`.
- O app prepara a imagem no cliente.
- O app solicita uma intenção de upload temporário.
- O arquivo é enviado para storage temporário assim que a pessoa confirmar a versão final da imagem.
- O `upload_token` retorna ao fluxo de criação do time como `crest_upload_token`.
- Esse token fica guardado no rascunho do wizard até a conclusão ou expiração.
- Se a pessoa trocar o escudo antes de concluir:
  - novo upload temporário deve acontecer;
  - o token anterior deixa de ser o token corrente do fluxo.
- Ao concluir `POST /api/v1/teams`, o backend valida e consome o token, move ou promove o arquivo e persiste a referência final no time.
- Se `POST /api/v1/teams` falhar, o token ainda pode ser reutilizado enquanto estiver válido.
- Se o token expirar antes da conclusão, a UI deve exigir novo upload.

## Regras de segurança e integridade

- Token temporário pertence ao usuário autenticado que o criou.
- Token temporário expira.
- Token temporário não pode ser reutilizado depois de consumido.
- Token com propósito incompatível não pode ser promovido para outro domínio.
- O domínio consumidor não deve persistir URL temporária como URL final.
