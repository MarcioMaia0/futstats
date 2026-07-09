---
title: Table Spec media_assets
status: Draft
version: 1.1.0
owner: Product Architecture
last_update: 2026-07-09
related_documents:
  - ../../Architecture/Media_Storage_Strategy.md
  - ../../Implementation/Services/Media_Service.md
  - ../../API/Teams_API.md
---

# Table Spec media_assets

## Objetivo

Especificar tabela `media_assets` — mídias (fotos, vídeos, thumbnails, cards), incluindo uploads temporários e ativos finais.

## Campos sugeridos

- `id` (uuid, PK)
- `owner_user_id` (uuid, FK -> `users.id`, nullable) — dono lógico do upload ou da mídia
- `domain` (text) — domínio consumidor, ex.: `TEAMS`, `IDENTITY`, `MATCHES`
- `purpose` (text) — propósito canônico, ex.: `TEAM_CREST`, `USER_AVATAR`
- `storage_bucket` (text)
- `storage_path` (text)
- `mime_type` (text)
- `file_size_bytes` (integer)
- `status` (text) — `PENDING_UPLOAD`, `UPLOADED_TEMP`, `PROMOTED`, `FAILED`, `DELETED`
- `is_temporary` (boolean)
- `upload_token` (text, unique, nullable)
- `expires_at` (timestamptz, nullable)
- `consumed_at` (timestamptz, nullable)
- `consumed_by_domain` (text, nullable)
- `consumed_by_entity_id` (uuid, nullable)
- `metadata` (jsonb, nullable)
- `created_at` (timestamptz)
- `updated_at` (timestamptz)

## Regras

- `upload_token` só existe para uploads temporários.
- `upload_token` deve ser único e opaco.
- mídia temporária deve expirar se não for promovida.
- mídia promovida não pode continuar disponível como token reutilizável.
- `purpose` restringe onde a mídia pode ser consumida.
- o domínio final não deve apontar para arquivo temporário.
- a promoção deve registrar quando e por qual domínio a mídia foi consumida.
- fluxos como `Create Team Wizard` podem manter um `upload_token` temporário no rascunho local até a conclusão do caso de uso principal.
- trocar a imagem no frontend não exige apagar imediatamente a linha temporária anterior, mas o fluxo deve considerar apenas o token mais recente como válido para envio.
