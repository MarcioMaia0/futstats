---
title: System Context
status: Draft
version: 0.9.0
owner: Product Architecture
last_update: 2026-07-06
related_documents:
[]
---

# System Context

## Objetivo

Descrever o FUTSTATS no contexto de seus usuários, sistemas externos e fluxos principais.

## Atores

- Usuário casual.
- Atleta.
- Diretor.
- Técnico/analista.
- Torcedor.
- Árbitro.
- Pesquisador.
- Administrador da plataforma.

## Sistemas externos

- Provedores de autenticação.
- Armazenamento de mídia.
- Serviços de mapas.
- Plataformas de compartilhamento social.
- Gateways de pagamento.
- Serviços de IA.
- Ferramentas de analytics.

## Fluxo macro

```text
Usuário registra jogo
      ↓
Sistema gera experiência social
      ↓
Dados mínimos alimentam histórico
      ↓
Usuários avançados adicionam profundidade
      ↓
Estatísticas e inteligência são geradas
```

## Decisão

O sistema deve aceitar baixa densidade de dados sem quebrar sua proposta de valor.
