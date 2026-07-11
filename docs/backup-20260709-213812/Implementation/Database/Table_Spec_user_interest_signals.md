---
title: Table Spec user_interest_signals
status: Draft
version: 1.0.0
owner: Product Architecture
last_update: 2026-07-08
related_documents:
  - ../../Frontend/Screens/Start_Path_Selection.md
  - ../../Frontend/Screens/Join_Team_Search.md
  - ../../Analytics/Event_Tracking_Spec.md
---

# Table Spec user_interest_signals

## Objetivo

Especificar `user_interest_signals`: sinais leves de interesse implícito da pessoa dentro do produto.

## Finalidade

Sustentar recomendações e personalização leve sem confundir isso com follow explícito.

## Campos sugeridos

- `id` (uuid, PK)
- `user_id` (uuid, FK -> `users.id`)
- `signal_type` (enum `interest_signal_type`)
- `target_type` (enum `interest_target_type`, nullable)
- `target_id` (uuid, nullable)
- `modality` (enum `modality`, nullable)
- `region_state` (text, nullable)
- `region_city` (text, nullable)
- `region_zone` (text, nullable)
- `source_screen` (text, nullable)
- `weight` (numeric/int, default 1)
- `metadata` (jsonb, nullable)
- `occurred_at` (timestamptz)
- `created_at`

## Enums

- `interest_signal_type`: `SEARCH | VIEW | OPEN_NEWS | OPEN_PROFILE | OPEN_TEAM | OPEN_PLAYER | ENGAGEMENT`
- `interest_target_type`: `TEAM | PLAYER | NEWS | MODALITY | REGION`

## Regras

- Esta tabela registra interesse implícito; não cria follow automático.
- `target_type` e `target_id` podem ser nulos quando o sinal for mais agregado, por exemplo interesse por modalidade ou região.
- `weight` permite dar mais relevância a certos eventos sem mudar o modelo.
- O objetivo inicial é leitura simples para sugestão de times, atletas e conteúdo.
- Não substitui analytics externos; ela existe porque o produto quer usar esses sinais em comportamento funcional.
