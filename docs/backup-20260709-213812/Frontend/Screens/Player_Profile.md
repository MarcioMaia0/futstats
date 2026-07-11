---
title: Screen: Player Profile
status: Draft
version: 1.0.0
owner: Product Architecture
last_update: 2026-07-09
related_documents:
  - ../../Implementation/Core_Flows/Player_Profile_Implementation.md
  - ../../API/Players_API.md
  - ../../Domain/Players.md
---

# Screen: Player Profile

## Objetivo

Exibir a identidade esportiva do atleta de forma simples no topo e progressiva no restante da navegação, separando com clareza:

- quem a pessoa diz que é como atleta;
- o que o histórico real do app já registrou sobre ela.

## Estrutura da tela

## Bloco 1: cabeçalho do atleta

Elementos obrigatórios:

- avatar;
- apelido em destaque visual principal;
- nome completo em linha secundária, quando existir e quando a regra de exibição permitir;
- selo simples de perfil do atleta;
- CTA de edição apenas para o próprio dono do perfil;
- CTA de completar perfil apenas para o próprio dono do perfil quando `profile_completeness_status = INCOMPLETE`.

## Bloco 2: resumo esportivo

Elementos do resumo:

- modalidades declaradas do atleta;
- posições declaradas por modalidade;
- perna dominante, quando existir;
- quantidade de times atuais;
- métricas-resumo disponíveis no MVP, como jogos e gols, quando já houver leitura consolidada.
- leitura interpretativa do perfil esportivo quando houver base suficiente.

## Bloco 3: times atuais

Elementos:

- lista de times em que o atleta possui vínculo ativo em `team_players`;
- escudo do time;
- nome do time;
- papel esportivo contextual, quando útil na UI.

## Bloco 4: histórico real no app

Elementos:

- últimas partidas relacionadas;
- posições em que efetivamente atuou no histórico;
- estatísticas esportivas consolidadas disponíveis;
- gráfico temporal de desempenho;
- cards/posts/eventos futuros quando o produto evoluir.

Regra central:

- posição declarada no perfil e posição histórica de partida não podem ser misturadas visualmente como se fossem a mesma coisa.
- perfil ofensivo/defensivo interpretado pelo sistema não pode ser tratado como verdade absoluta do atleta.

## Bloco 5: dados complementares

Elementos opcionais:

- data de nascimento;
- altura;
- peso.

Regra de MVP:

- estes dados podem existir na edição do atleta, mas não precisam compor o card público principal do MVP;
- quando exibidos, devem ficar em bloco secundário e nunca competir com apelido, modalidades e histórico.

## Campos

### Leitura principal

- `person.avatar_media_id`
- `person.nickname`
- `person.full_name`
- `player.dominant_foot`
- `player.birth_date`
- `player.height_cm`
- `player.weight_kg`
- `player.profile_completeness_status`
- `player_modalities[]`
- `player_positions[]`
- `active_teams[]`
- `statistics_overview`
- `performance_timeline`
- `inferred_play_style`
- `recent_matches[]`
- `historical_positions_by_modality[]`

### Edição

Esta é uma tela de leitura predominante.

Os dados editáveis ficam em fluxo próprio de edição/complementação do perfil do atleta.

## Regras de UX

- Priorizar clareza e simplicidade.
- Apelido deve ser o elemento visual principal.
- O topo da tela deve responder rapidamente:
  - quem é o atleta;
  - em quais modalidades atua;
  - do que joga.
- O perfil deve funcionar para `player` com ou sem `user` vinculado.
- O histórico não pode ser perdido na reivindicação do perfil.
- Estatística avançada deve ficar em aba separada ou bloco progressivo.
- O perfil do atleta deve diferenciar explicitamente:
  - `declarado pelo atleta`;
  - `registrado pelo app`.
- Quando houver inferência de perfil esportivo:
  - ela deve ser mostrada como tendência contextual;
  - nunca como rótulo fixo e imutável.
- Se o atleta ainda não tiver modalidades e posições suficientes:
  - mostrar CTA leve para completar o perfil;
  - nunca bloquear a visualização do perfil.
- Se o viewer não for o dono:
  - não exibir CTAs de edição;
  - não expor estados operacionais internos do fluxo de completude.

## Regras de visibilidade

- O perfil pode existir e ser visualizado mesmo sem conta vinculada.
- Quando houver `user` vinculado, regras de privacidade da conta podem limitar acesso ao perfil conforme `user_preferences.profile_visibility`.
- No MVP, o núcleo público do perfil é:
  - avatar;
  - apelido;
  - modalidades declaradas;
  - posições declaradas;
  - times atuais;
  - histórico factual e estatísticas permitidas.
- Dados físicos e de nascimento não precisam aparecer por padrão no perfil público do MVP.

## Variações de contexto

### Dono do perfil

- vê CTA `Editar perfil de atleta`;
- vê CTA `Completar perfil` quando aplicável;
- pode visualizar dados complementares com mais profundidade.

### Visitante

- vê perfil em modo leitura;
- pode navegar para time atual, histórico e estatísticas.

### Atleta sem conta

- perfil continua existindo;
- não há CTA de edição autenticada;
- histórico e identidade esportiva continuam consultáveis.

## Estados

- `loading`
- `error`
- `success`
- `not_found`
- `private_profile`
- `offline`, quando aplicável

## Estado de vazio

Quando o atleta ainda tiver pouquíssimos dados, a tela deve continuar útil com:

- avatar ou placeholder;
- apelido;
- mensagem curta de perfil em construção;
- CTA de completar perfil, se o viewer for o dono.

## Eventos

- abrir histórico do atleta;
- abrir estatísticas detalhadas;
- abrir time atual;
- iniciar reivindicação do player quando aplicável;
- iniciar complementação do perfil quando aplicável.

## Regra para gráficos adaptativos

- a tela pode adaptar o destaque visual de métricas conforme o perfil esportivo inferido do atleta;
- a inferência deve combinar:
  - posições preferidas declaradas;
  - posições historicamente exercidas;
  - assinatura estatística disponível;
- exemplos:
  - atleta com tendência ofensiva:
    - gols;
    - finalizações;
    - assistências registradas;
  - atleta com tendência defensiva:
    - desarmes;
    - interceptações;
    - bloqueios;
  - goleiro:
    - defesas;
    - gols sofridos;
    - jogos sem sofrer gol.

## Regra de contexto

- a inferência deve ser contextual, nunca universal;
- o sistema pode chegar a conclusões diferentes por:
  - visão geral;
  - modalidade;
  - time.
