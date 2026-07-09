---
title: Social Domain
status: Draft
version: 0.5.0
owner: Product Architecture
last_update: 2026-07-09
related_documents: []
---

# Social Domain

## Objetivo

Definir feed, compartilhamento, resenha e comunidade.

## Regras

1. Social é porta de entrada.
2. Resultado deve gerar card compartilhável.
3. Resenha é opcional e moderável.
4. Times controlam exposição.
5. Conteúdo pode ser reportado.
6. Compartilhamento é aquisição.
7. Eventos sociais automáticos podem ser usados para aquecer a comunidade quando tiverem alto valor de engajamento.
8. Eventos do time podem, no futuro, ser distribuídos simultaneamente em redes sociais externas conectadas.

## Casos de uso

- Compartilhar resultado.
- Curtir.
- Comentar.
- Seguir time.
- Seguir jogador.
- Publicar lance.
- Publicar evento social de time.
- Distribuir evento do time em canais sociais conectados.

## Evento social de time

### Objetivo

Permitir que o time publique eventos de alto valor comunitário no feed, inclusive eventos automáticos disparados por fluxos de domínio.

### Regras

- O contrato deve ser genérico o suficiente para suportar múltiplos tipos de evento.
- O contrato deve ser genérico o suficiente para suportar múltiplos tipos de evento e múltiplos destinos de publicação.
- `PLAYER_WELCOME` é o primeiro tipo oficial desse modelo.
- Outros tipos futuros podem incluir ações beneficentes, aniversário do time, confraternizações e ativações da comunidade.
- A publicação externa deve respeitar conexão válida da conta do time, preferência padrão do time e decisão final no momento do evento.
- O evento pode ser manual ou disparado a partir de outro fluxo de domínio, conforme regras do tipo.

## Distribution do evento

### Objetivo

Controlar em quais destinos externos um evento do time deve ser distribuído, sem confundir isso com a publicação principal no app.

### Regras

- O evento nasce primeiro no app.
- `distribution` controla apenas destinos externos.
- Modos iniciais:
  - `NONE`
  - `TEAM_DEFAULTS`
  - `SELECTED`
- `TEAM_DEFAULTS` usa:
  - preferência global do time;
  - conexões válidas;
  - plataformas com publicação habilitada.
- `SELECTED` permite que o fluxo do evento escolha explicitamente as plataformas.
- Falha em destino externo não deve apagar o evento no app nem desfazer a ação principal que o originou.
- Cada destino externo deve gerar registro operacional próprio de tentativa, sucesso, falha ou retry.
- Retry automático deve existir apenas para falhas transitórias.
- Erros definitivos devem encerrar a tentativa sem loop automático.

## Evento social: Player Welcome

### Objetivo

Transformar a entrada de um novo jogador-user em conteúdo social de alto valor para o time e para quem segue o time.

### Regras

- O evento é opcional no momento da aprovação da entrada no time.
- A decisão de publicar ou não pertence à pessoa que aprova.
- O evento só deve existir quando:
  - a aprovação incluir jogador; e
  - a pessoa aprovada for user real da plataforma.
- O evento pode usar banner ou template pré-configurado.
- O nome exibido pode usar `nickname` ou nome resolvido para o contexto do time.
- O evento deve aceitar comentários para iniciar a resenha.
- O evento pode gerar notificações para:
  - integrantes do time;
  - seguidores do time.

## Regra de visibilidade de falha externa

- público comum não precisa ver detalhes técnicos de falha em rede externa;
- pessoas com gestão podem ver status por plataforma, falha resumida e ação corretiva.

### Justificativa de produto

- dá sensação de chegada importante;
- ajuda a integrar o novo jogador na comunidade;
- cria conversa orgânica sem depender de post manual;
- transforma uma ação operacional em aquisição, retenção e engajamento.
