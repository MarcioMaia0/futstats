---
title: Table Spec post_distribution_attempts
status: Draft
version: 1.0.0
owner: Product Architecture
last_update: 2026-07-09
related_documents:
  - Table_Spec_posts.md
  - Table_Spec_team_social_connections.md
  - ../../API/Teams_API.md
  - ../../Domain/Social.md
---

# Table Spec post_distribution_attempts

## Objetivo

Especificar `post_distribution_attempts`: tentativas operacionais de distribuição externa de posts do app.

## Finalidade

Registrar, por plataforma:

- fila de publicação;
- sucesso;
- falha;
- motivo da falha;
- retries;
- vínculo com a conexão social do time usada na tentativa.

## Campos sugeridos

- `id` (uuid, PK)
- `post_id` (uuid, FK -> `posts.id`)
- `team_id` (uuid, FK -> `teams.id`)
- `social_connection_id` (uuid, FK -> `team_social_connections.id`, nullable)
- `platform` (enum `social_platform`)
- `status` (enum `distribution_attempt_status`)
- `attempt_number` (integer, default `1`)
- `requested_by_user_id` (uuid, FK -> `users.id`, nullable)
- `trigger_source` (enum `distribution_trigger_source`)
- `payload_snapshot` (jsonb, nullable)
- `provider_publication_id` (text, nullable)
- `provider_response` (jsonb, nullable)
- `error_code` (text, nullable)
- `error_message` (text, nullable)
- `queued_at` (timestamptz, nullable)
- `sent_at` (timestamptz, nullable)
- `completed_at` (timestamptz, nullable)
- `next_retry_at` (timestamptz, nullable)
- `created_at`
- `updated_at`

## Enums

- `social_platform`: `YOUTUBE | INSTAGRAM | TIKTOK`
- `distribution_attempt_status`: `QUEUED | IN_PROGRESS | PUBLISHED | SKIPPED | FAILED | CANCELLED`
- `distribution_trigger_source`: `TEAM_EVENT_APPROVAL | MANUAL_RETRY | MANUAL_PUBLISH | SYSTEM_RETRY`

## Regras

- Cada linha representa uma tentativa operacional, não o evento social em si.
- O post no app continua sendo a publicação primária.
- Uma falha nesta tabela nunca deve apagar ou invalidar o `post`.
- `social_connection_id` pode ser nulo quando a tentativa for barrada antes de escolher conexão válida, mas o ideal é registrar a conexão usada sempre que ela existir.
- `attempt_number` deve crescer a cada retry da mesma plataforma para o mesmo `post`.
- `SKIPPED` deve ser usado quando a plataforma foi considerada, mas não era elegível para envio.
- `FAILED` deve ser usado quando houve tentativa real de entrega e ela não concluiu com sucesso.
- `PUBLISHED` deve registrar `provider_publication_id` quando a plataforma devolver esse identificador.

## Política de retry

- Retry só deve acontecer para falhas transitórias.
- Exemplos típicos de falha transitória:
  - timeout;
  - indisponibilidade momentânea do provedor;
  - rate limit temporário;
  - erro de rede;
  - erro 5xx do provedor.
- Exemplos típicos de falha não transitória:
  - credencial inválida ou revogada;
  - permissão insuficiente;
  - payload inválido;
  - plataforma não conectada;
  - conta do time inelegível para publicar.
- No estado atual do produto, cada plataforma deve ter no máximo 3 tentativas totais por `post`.
- Backoff recomendado:
  - tentativa 1 -> imediata ou fila inicial;
  - tentativa 2 -> +5 minutos;
  - tentativa 3 -> +30 minutos.
- Depois da última falha transitória sem sucesso, a tentativa final deve permanecer como `FAILED`.
- Erros não transitórios não devem gerar retry automático.
- `next_retry_at` só deve ser preenchido quando houver retry agendado.

## Retry manual

- Retry manual é diferente de retry automático.
- Retry manual deve criar nova linha operacional com:
  - `trigger_source = MANUAL_RETRY`
  - novo `attempt_number`
- Retry manual só deve existir para pessoas com gestão do time.
- Retry manual não deve recriar o `post` do app.
- Retry manual deve ser recusado quando a causa exigir ação corretiva anterior, como:
  - reconectar conta;
  - validar conexão;
  - ativar publicação.
- O sistema deve evitar múltiplos retries manuais concorrentes para o mesmo `post` e plataforma.
