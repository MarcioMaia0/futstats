---
title: Notification Strategy
status: Draft
version: 1.0.0
owner: Product Architecture
last_update: 2026-07-09
---

# Notification Strategy


## Objetivo

Definir a estratégia de notificações do FUTSTATS.

## Tipos de notificação

- convite para time;
- jogo agendado;
- resultado publicado;
- comentário recebido;
- avaliação liberada;
- card gerado;
- scout pendente;
- alerta de adversário com histórico ruim;
- lembrete de jogo.

## Regras

1. Notificações sociais podem aumentar retenção.
2. Notificações operacionais devem ajudar o jogo a acontecer.
3. Usuário deve controlar preferências.
4. Notificação não deve parecer spam.
5. Times podem configurar lembretes padrão.

## Canais

- Push.
- E-mail.
- WhatsApp futuramente.
- Notificações internas.

## Observação futura: cobrança de presença por WhatsApp

- O fluxo principal de confirmação de presença deve acontecer dentro do app.
- No futuro, a gestão do time pode ganhar uma ação opcional de cobrança de presença por WhatsApp.
- A ideia é disparar mensagem individual, e não depender inicialmente de grupo do WhatsApp.
- Essa mensagem pode conter:
  - arte/card do jogo, quando existir;
  - link profundo para abrir o app diretamente na tela de confirmação de presença.
- O uso desse canal deve ser tratado como recurso opcional e potencialmente pago, por depender de fornecedor externo e custo por mensagem.
- O estado atual do produto não deve depender desse canal para que o fluxo de presença funcione.
