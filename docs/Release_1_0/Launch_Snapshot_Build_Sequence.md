---
title: Launch Snapshot Build Sequence
status: Approved
document_type: Historical
version: 1.2.0
owner: Product Architecture
last_update: 2026-07-20
related_documents:
  - ./Current_Project_Status.md
  - ./Open_Issues.md
---

# Launch Snapshot Build Sequence

## Objetivo

Definir uma sequência prática para construção do recorte inicial de lançamento.

## Estado em 2026-07-20

Este documento continua sendo a sequência de referência, mas o desenvolvimento já avançou além do recorte mínimo inicial em identidade, criação/configuração de time, elenco e solicitações.

| Etapa | Status atual |
| --- | --- |
| 1. Identity mínimo | Parcialmente implementado com Supabase Auth, Google OAuth, login por identificador, telefone de contato e avatar social. |
| 2. Team mínimo | Implementado e expandido com wizard, tema, modalidades, quadras, settings e múltiplas quadras. |
| 3. Player mínimo | Implementado parcialmente com criação rápida, vínculo ao time e leitura no elenco. |
| 4. Match rápido | Pendente. |
| 5. Compartilhamento | Pendente para cards reais. |
| 6. Social mínimo | Parcial, com solicitações/notificações e conexões sociais de time iniciadas. |
| 7. Estatísticas simples | Parcial em cards visuais; ainda depende de jogos reais. |
| 8. Camadas avançadas opcionais | Algumas partes de elenco, quadras, notificações e tema avançaram antes de match rápido. |

## Sequência recomendada

### 1. Identity mínimo

- Criar conta.
- Criar usuário.
- Preferências básicas.

### 2. Team mínimo

- Criar time com nome.
- Definir escudo opcional.
- Definir cores opcionais.

### 3. Player mínimo

- Criar jogador rápido por apelido.
- Vincular jogador ao time.
- Permitir perfil incompleto.

### 4. Match rápido

- Criar partida.
- Informar adversário simples.
- Registrar placar.
- Registrar gols.

### 5. Compartilhamento

- Gerar card de resultado.
- Compartilhar card.
- Exibir histórico simples.

### 6. Social mínimo

- Feed de resultados.
- Reações.
- Comentários simples.

### 7. Estatísticas simples

- Jogos.
- Vitórias.
- Gols pró/contra.
- Artilharia.

### 8. Camadas avançadas opcionais

- Agenda.
- Elenco completo.
- Quadras.
- Arbitragem.
- Scout.
- Plus/Minus.

## Regra

Só avançar para recursos profundos quando o fluxo de partida rápida estiver simples, estável e compartilhável.
