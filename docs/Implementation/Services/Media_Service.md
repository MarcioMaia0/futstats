---
title: Media Service
status: Draft
version: 1.1.0
owner: Product Architecture
last_update: 2026-07-09
---

# Media Service

## Objetivo

Especificar serviço de mídia.

## Responsabilidades

- upload de imagens;
- upload de vídeos;
- emissão de tokens temporários de upload;
- promoção de upload temporário para ativo final;
- associação de mídia a partidas, jogadores e posts;
- thumbnails;
- validação de tamanho;
- privacidade;
- remoção.

## Regras

- Mídia pode ser pública, privada ou restrita.
- Vídeos de lances podem ser vinculados a eventos.
- Imagens de cards podem ser regeneradas.
- Conteúdo deve poder ser denunciado.

## Regras para upload temporário

- O serviço deve permitir criar uma intenção de upload temporário.
- Cada intenção deve registrar dono, propósito, caminho temporário, expiração e status.
- O serviço deve validar tipo e tamanho do arquivo conforme o propósito declarado.
- O serviço deve permitir promoção do arquivo temporário para ativo final apenas por serviços de negócio autorizados.
- Promoção deve invalidar o uso posterior do token temporário.
- O serviço não deve permitir que a UI persista diretamente uma URL temporária como mídia final.
- O serviço deve suportar o caso em que a UI substitui uma mídia temporária por outra antes da conclusão do caso de uso principal.
- O serviço não precisa promover automaticamente o token anterior substituído; basta garantir que o novo token seja o válido para o fluxo corrente.
- Tokens expirados ou já consumidos devem falhar com erro explícito no momento de promoção.

## Propósitos iniciais

- `TEAM_CREST`
- `USER_AVATAR` (reservado para fluxo futuro)

## Critérios de qualidade

- O fluxo deve funcionar para usuário casual sem exigir cadastro excessivo.
- Recursos avançados devem ser progressivos e opcionais.
- O comportamento deve preservar consistência entre frontend, backend, API e banco.
- Todas as entidades técnicas, payloads, enums e nomes internos devem usar inglês.
- Textos exibidos ao usuário devem passar por camada de linguagem/configuração.

## Regras para IA

Ao usar este documento como contexto para implementação, a IA deve:
1. preservar o princípio de uso casual simples;
2. não criar campos obrigatórios que bloqueiem o primeiro valor operacional;
3. respeitar separação entre dado canônico e texto de interface;
4. manter compatibilidade com evolução futura;
5. sugerir migrations, testes e endpoints quando alterar domínio.
