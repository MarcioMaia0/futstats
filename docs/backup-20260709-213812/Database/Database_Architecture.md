---
title: Database Architecture
status: Approved
version: 1.1.0
owner: Product Architecture
last_update: 2026-07-09
related_documents:
  - Architecture/Architecture_Principles.md
  - Backend/Backend_Architecture.md
  - Architecture/Event_Driven_Strategy.md
---

# Database Architecture

## Objetivo

Definir a arquitetura de banco de dados do FUTSTATS.

O banco deve favorecer integridade, histórico, segurança, evolução e performance, sem concentrar regra de negócio complexa.

## Princípios

1. Nomenclatura técnica em inglês.
2. Explicação documental em português.
3. Dados canônicos separados de textos de interface.
4. Histórico preservado.
5. Recursos avançados opcionais.
6. Agregados recalculáveis.
7. Eventos de partida como base para estatísticas.
8. Banco protege dados, mas não é o núcleo das regras de negócio.
9. RLS protege acesso, mas não substitui Application Layer.
10. Triggers devem ser técnicas e locais, não orquestradores do produto.

## Papel do banco

O banco é responsável por:

- persistência;
- integridade referencial;
- constraints;
- índices;
- transações;
- RLS;
- auditoria;
- snapshots;
- views de leitura quando úteis;
- retenção histórica.

O banco não deve ser responsável por:

- orquestrar fluxos complexos de negócio;
- decidir regras contextuais de aplicação;
- substituir use cases;
- substituir domain events;
- executar lógica de UI;
- acoplar domínios por triggers complexas.

## Supabase

Supabase é a infraestrutura recomendada para banco, auth, storage, RLS e realtime.

Ele deve ser encapsulado pela camada de infraestrutura do backend.

Use cases não devem acessar Supabase diretamente.

## RLS

Row Level Security deve ser usado para proteção de dados.

Exemplos:

- usuário só pode editar dados de times onde possui papel permitido;
- jogador não reivindicado pode ter leitura pública controlada;
- posts privados respeitam visibilidade;
- dados administrativos exigem papel adequado.

RLS deve funcionar como barreira de segurança.

Regras de negócio contextuais devem continuar na aplicação.

Exemplo:

- RLS verifica se o usuário tem vínculo com o time.
- Application verifica se a partida pode ser editada de acordo com status, prazo e regras do produto.

## Triggers

Triggers podem ser usadas para:

- created_at;
- updated_at;
- audit logs;
- normalizações simples;
- criação de linha pública de user após `auth.users`;
- manutenção local de campos técnicos;
- outbox pattern futuro.

Triggers não devem ser usadas para:

- recalcular regras complexas de estatística como fluxo principal;
- gerar cards como regra central;
- disparar cadeia longa de efeitos colaterais;
- substituir eventos de domínio.

## Camadas de dados

### Identity

Contas, usuários, papéis e permissões.

Tabelas relacionadas:

- `auth.users` como camada de conta
- `persons`
- `users`
- `roles`
- `user_team_roles`
- `user_preferences`

### Sports Core

Times, jogadores, partidas, quadras e adversários.

Tabelas relacionadas:

- `teams`
- `team_players`
- `players`
- `matches`
- `venues`
- `local_opponents`

### Events

Eventos registrados nas partidas.

Tabelas relacionadas:

- `match_events`
- `match_goals`
- `match_players`
- `match_players_positions`
- `match_staff`
- `match_attendance_responses`
- `match_substitutions`
- `match_referees`

### Statistics

Agregações, rankings, snapshots e métricas.

Tabelas relacionadas:

- `statistics_snapshots`
- `metric_definitions`
- `player_match_statistics`
- `player_statistics_summary`
- `player_statistics_by_modality`
- `player_statistics_by_team_modality`
- `player_performance_series`
- `player_style_inference`

### Player Profile Read Models

Leituras otimizadas do perfil rico do atleta.

Tabelas relacionadas:

- `player_profile_summary`
- `player_timeline_items`
- `player_gallery_items`
- `player_gallery_group_counters`

### Experience

Temas, linguagem e preferências.

Tabelas relacionadas:

- `themes`
- `ui_vocabulary`
- `user_preferences`
- `team_settings`

### Social

Posts, comentários, reações, mídia e compartilhamentos.

Tabelas relacionadas:

- `posts`
- `comments`
- `reactions`
- `follows`
- `media_assets`
- `notifications`

### Governance

Auditoria, logs, relatórios, moderação e segurança.

Tabelas relacionadas:

- `audit_logs`
- `referee_reviews`

## Offline-first

O banco deve suportar sincronização offline.

Recomendações:

- usar UUIDs canônicos;
- aceitar IDs gerados pelo cliente quando seguro;
- usar `idempotency_key` em comandos sensíveis;
- armazenar `created_at_client` quando relevante;
- considerar `device_id` para rastreabilidade;
- usar versionamento para resolução de conflitos;
- preservar histórico de alterações críticas.

## Tabela recomendada: offline_commands

Quando necessário, considerar uma tabela para comandos offline.

```text
id uuid primary key
user_id uuid
team_id uuid
command_type text not null
payload jsonb not null
idempotency_key text not null unique
client_created_at timestamptz
server_received_at timestamptz not null
status text not null
processed_at timestamptz
last_error text
```

## Tabela recomendada: domain_events

Para rastreabilidade e futura evolução para outbox.

```text
id uuid primary key
event_type text not null
aggregate_type text
aggregate_id uuid
payload jsonb not null
occurred_at timestamptz not null
published_at timestamptz
status text not null
```

## Tabela recomendada: background_jobs

Para jobs assíncronos quando necessário.

```text
id uuid primary key
type text not null
status text not null
payload jsonb not null
attempts integer not null default 0
max_attempts integer not null default 3
scheduled_at timestamptz
started_at timestamptz
completed_at timestamptz
failed_at timestamptz
last_error text
idempotency_key text
created_at timestamptz not null
updated_at timestamptz not null
```

## Views e snapshots

Views e snapshots podem ser usados para leitura eficiente.

Recomendado para:

- rankings;
- dashboards;
- estatísticas de jogador;
- estatísticas de time;
- histórico consolidado;
- feed otimizado.

Snapshots devem ser recalculáveis a partir de eventos e registros históricos.

## Dados canônicos e linguagem

O banco deve armazenar dados canônicos em inglês técnico.

A experiência exibida ao usuário pode variar por tema, tom e linguagem no frontend.

Exemplo:

```text
goalkeeper_mistake
```

Pode ser exibido como:

```text
Erro do goleiro
Frango
Falha defensiva
```

A escolha de texto pertence à camada de experiência, não ao dado canônico.

## Decisão

O banco deve favorecer integridade e evolução.

A primeira versão pode ser relacional com Supabase/PostgreSQL, mas o design deve permitir cache, snapshots, filas e evolução futura sem prender regras de negócio ao banco.
