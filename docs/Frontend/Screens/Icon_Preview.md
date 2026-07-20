---
title: Screen: Icon Preview
status: Review
version: 0.1.0
owner: Product Architecture
last_update: 2026-07-20
related_documents:
  - ../Design_System_Components.md
  - ../Design_System_Tokens.md
---

# Screen: Icon Preview

## Objetivo

Servir como referência visual dos ícones definidos para o app, ajudando a reduzir texto repetitivo nas telas e manter consistência entre fluxos.

Componente atual: `IconPreviewScreen`.

## Estado implementado

- Tela criada em `apps/mobile/src/features/design/screens`.
- Lista em ordem alfabética com ícone e label.
- Acesso temporário pelo botão Buscar no menu inferior da experiência do time.

## Ícones já catalogados

- Adicionar
- Agenda
- Atleta
- Buscar
- Comissão
- Compartilhar
- Configurações
- Confirmar presença
- Criar jogo
- Diretoria
- Editar
- Elenco
- Evento
- Gerenciar integrantes
- Identidade
- Início
- Notificações
- Perfil
- Pessoa
- Presidente
- Publicação
- Remover

## Regras

- Preferir ícones de bibliotecas já usadas no app antes de adicionar nova dependência.
- Quando um ícone não representar bem o conceito, registrar a troca nesta tela antes de espalhar em outras telas.
- Ícones devem respeitar tema e tokens de cor do app.
- A tela é referência de construção, não uma tela de usuário final.
