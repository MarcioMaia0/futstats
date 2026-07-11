---
title: PRD Launch Scope Snapshot
status: Review
document_type: Historical
version: 1.1.0
owner: Product Architecture
last_update: 2026-07-09
related_documents:
  - Product_Overview.md
  - Product_Principles.md
---

# PRD: Recorte Inicial de Lançamento

## Objetivo

Registrar o recorte inicial pensado para o lançamento do FUTSTATS com foco em adoção casual e social.

> [!IMPORTANT]
> Este documento é uma fotografia histórica de escopo inicial. Ele não substitui os contratos atuais de domínio, API, frontend, banco ou implementação. Se houver conflito com fontes canônicas mais novas, prevalecem as fontes canônicas.

## Problema

Times e grupos de futebol amador organizam jogos por WhatsApp e registram resultados de forma dispersa. O histórico se perde e a resenha fica fragmentada.

## Público inicial

- Jogadores casuais
- Diretores que organizam jogos
- Amigos e torcedores próximos
- Times que querem compartilhar resultados

## Proposta de valor do recorte inicial

Registrar jogo, placar e autores dos gols de forma rápida, gerando um card compartilhável e um histórico básico.

## Funcionalidades centrais do recorte inicial

### Must have

- Criar conta
- Criar time
- Criar partida rápida
- Registrar placar
- Registrar autores dos gols
- Gerar card do resultado
- Compartilhar card
- Perfil simples de time
- Perfil simples de jogador
- Histórico básico de partidas

### Should have

- Tema com cores do time
- Linguagem Várzea/Resenha
- Ranking simples de artilharia
- Convite de jogadores

### Could have

- Agenda
- Quadras
- Adversários locais
- Arbitragem simples

### Fora desse recorte inicial

- Scout avançado
- Plus/Minus
- IA
- Ligas completas
- Marketplace
- Upload pesado de vídeo

## Critérios de sucesso do recorte inicial

- Registrar uma partida em menos de 60 segundos
- Gerar card em menos de 10 segundos após finalizar o placar
- Permitir que a pessoa casual entenda o app sem tutorial longo
- Fazer o primeiro compartilhamento acontecer no primeiro uso

## Riscos do recorte inicial

- O primeiro uso ficar complexo demais
- Foco excessivo em estatísticas antes de tração social
- Cadastro inicial muito longo
