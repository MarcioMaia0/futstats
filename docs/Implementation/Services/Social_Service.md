---
title: Social Service
status: Draft
version: 1.0.0
owner: Product Architecture
last_update: 2026-07-09
---

# Social Service

## Objetivo

Especificar o serviço social.

## Responsabilidades

- feed;
- posts;
- comentários;
- reações;
- compartilhamentos;
- denúncias;
- moderação;
- distribuição externa de eventos sociais do time;
- registro operacional de publicação por plataforma.

## Regras

- Social é porta de entrada.
- Compartilhamento deve ser fácil.
- Resenha deve ser moderável.
- Conteúdo sensível deve poder ser reportado.
- Times devem controlar visibilidade.
- O post no app é a publicação primária.
- Distribuição externa é efeito derivado.
- Falha de publicação externa não deve apagar o post nem desfazer a ação principal.
- Cada tentativa de distribuição externa deve ser registrada operacionalmente.

## Regras para distribuição externa

- O serviço deve consultar `team_social_connections` para decidir elegibilidade por plataforma.
- O serviço deve criar registros em `post_distribution_attempts`.
- O serviço deve suportar ao menos:
  - `QUEUED`
  - `IN_PROGRESS`
  - `PUBLISHED`
  - `SKIPPED`
  - `FAILED`
- O serviço deve permitir retry controlado sem duplicar o evento social do app.
- O serviço deve guardar resposta do provedor e motivo de falha quando possível.
- O serviço deve expor retry manual para gestão quando a tentativa falhar e a causa permitir nova tentativa operacional.

## Política de retry

- Retry automático só deve ocorrer para falhas transitórias.
- No estado atual do produto, usar no máximo 3 tentativas totais por plataforma e por post.
- Backoff recomendado:
  - tentativa inicial;
  - retry 1 em 5 minutos;
  - retry 2 em 30 minutos.
- Erros definitivos não entram em retry automático.
- Exemplos de erro definitivo:
  - token revogado;
  - falta de permissão;
  - payload rejeitado pela plataforma;
  - conexão inexistente ou inelegível.
- O serviço deve marcar claramente no registro operacional se a falha é transitória ou definitiva.
- Retry manual deve:
  - criar nova tentativa operacional;
  - preservar o mesmo `post`;
  - recusar execução quando a ação correta for reconectar conta, validar conexão ou ativar publicação.

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
