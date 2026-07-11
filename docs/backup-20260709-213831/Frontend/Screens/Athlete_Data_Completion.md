---
title: Screen: Athlete Data Completion
status: Draft
version: 1.0.0
owner: Product Architecture
last_update: 2026-07-09
related_documents:
  - ../../Domain/Players.md
  - ../../API/Players_API.md
  - Player_Profile.md
  - Join_Team_Search.md
---

# Screen: Athlete Data Completion

## Objetivo

Servir como fluxo canônico de manutenção do perfil esportivo declarado do atleta.

O mesmo núcleo de tela deve atender dois contextos:

- `Completar perfil`
- `Editar perfil de atleta`

Componente sugerido:

- `AthleteProfileFormScreen`

## Regra central

Esta tela edita somente o perfil esportivo declarado.

Ela não edita:

- histórico factual de partidas;
- estatísticas calculadas;
- vínculo oficial com times;
- papéis de gestão;
- dados mínimos de autenticação.

## Quando aparece

### Modo `complete`

- depois que a pessoa passa a ter contexto esportivo real;
- após aprovação de entrada em time, quando o perfil esportivo ainda estiver incompleto;
- por retomada do sistema;
- por solicitação do diretor do time, quando essa mecânica existir.

### Modo `edit`

- ao tocar em `Editar perfil de atleta` dentro de `Player Profile`;
- quando a pessoa quiser revisar ou enriquecer seus dados esportivos declarados.

## Quando não aparece

- como etapa obrigatória do onboarding mínimo de autenticação;
- para alterar dados históricos de partidas;
- para alterar função da pessoa em um time.

## Estrutura geral da tela

### Bloco superior

- título principal;
- subtítulo contextual;
- indicador opcional de progresso apenas no modo `complete`;
- CTA de fechar ou voltar.

### Bloco principal

Formulário em blocos:

1. identidade esportiva;
2. modalidades;
3. posições por modalidade;
4. preferências esportivas;
5. dados complementares.

### Bloco inferior

- botão principal `Salvar`;
- botão secundário:
  - `Deixar para depois`, no modo `complete`;
  - `Cancelar`, no modo `edit`.

## Conteúdo por modo

### Modo `complete`

Título sugerido:

`Complete seus dados de atleta`

Subtítulo sugerido:

`Essas informações ajudam seu time em jogos, campeonatos e organização esportiva.`

### Modo `edit`

Título sugerido:

`Editar perfil de atleta`

Subtítulo sugerido:

`Atualize as informações que você quer mostrar como atleta no FUTSTATS.`

## Seções e campos

### Seção 1: identidade esportiva

Campos:

- `full_name`
- `nickname`
- `avatar_upload_token` ou avatar atual

Regras:

- `nickname` é obrigatório na persistência final;
- se a pessoa apagar `full_name`, o perfil continua válido;
- avatar é opcional;
- nome, apelido e avatar pertencem a `persons`, mesmo estando dentro do fluxo de atleta.

### Seção 2: modalidades

Campos:

- multisseleção de modalidades:
  - `FUTSAL`
  - `FIELD`
  - `SOCIETY`

Regras:

- a pessoa pode marcar mais de uma modalidade;
- a seleção de modalidade controla as posições disponíveis na seção seguinte;
- pelo menos uma modalidade é necessária para `BASIC_COMPLETE`.

### Seção 3: posições por modalidade

Campos:

- multisseleção de posições por modalidade escolhida.

Regras:

- as posições devem vir do catálogo `modality_positions`;
- a pessoa pode marcar mais de uma posição na mesma modalidade;
- a UI deve organizar as posições agrupadas por modalidade;
- pelo menos uma posição válida associada a modalidade escolhida é necessária para `BASIC_COMPLETE`.

### Seção 4: preferências esportivas

Campos:

- `dominant_foot`

Regras:

- opcional;
- usar linguagem simples;
- persistir em `players.dominant_foot`.

### Seção 5: dados complementares

Campos:

- `birth_date`
- `height_cm`
- `weight_kg`

Regras:

- opcionais;
- não bloqueiam o uso do app;
- ajudam a enriquecer o perfil;
- contribuem para `ENRICHED`, não para o mínimo esportivo.

## Regras de completude

- `INCOMPLETE`
  - ainda não possui combinação mínima de modalidade + posição válida.
- `BASIC_COMPLETE`
  - possui ao menos uma modalidade e ao menos uma posição válida.
- `ENRICHED`
  - além do básico, já possui parte relevante dos dados complementares.

## Ações principais

### Salvar

- atualiza `persons` e `players`;
- sincroniza `player_modalities`;
- sincroniza `player_positions`;
- recalcula `profile_completeness_status`;
- permite edição futura.

### Deixar para depois

- disponível apenas no modo `complete`;
- não bloqueia a pessoa;
- fecha o fluxo e permite seguir no app.

### Cancelar

- disponível no modo `edit`;
- abandona alterações não salvas.

## Persistência conceitual

### Atualiza

- `persons.full_name`
- `persons.nickname`
- `persons.avatar_media_id`
- `players.dominant_foot`
- `players.birth_date`
- `players.height_cm`
- `players.weight_kg`
- `players.profile_completeness_status`
- `player_modalities`
- `player_positions`

### Não atualiza

- `team_players`
- `match_players`
- `match_players_positions`
- `user_team_roles`
- `user_preferences`

## Contrato de API esperado

### Carregamento

- `GET /api/v1/players/:playerId`

### Salvamento

- `PATCH /api/v1/players/:playerId`

Payload conceitual:

```json
{
  "person": {
    "full_name": "Marcio Silva",
    "nickname": "Marcio",
    "avatar_upload_token": "temp_token_optional"
  },
  "player": {
    "dominant_foot": "RIGHT",
    "birth_date": "1990-01-01",
    "height_cm": 180,
    "weight_kg": 82.5
  },
  "declared_profile": {
    "modalities": [
      {
        "modality": "FUTSAL",
        "positions": ["FIXO", "ALA_ESQUERDO"]
      }
    ]
  }
}
```

## Regras de UX

- o formulário deve parecer útil, não burocrático;
- a pessoa deve entender que está definindo o que ela declara jogar;
- histórico real não deve ser editável aqui;
- o modo `edit` deve vir pré-preenchido com os dados atuais;
- o modo `complete` pode destacar de forma leve o que ainda falta;
- `Deixar para depois` deve ser visível no contexto de complementação;
- a seleção de modalidades deve abrir progressivamente as posições válidas;
- mobile first, com blocos bem claros e sem poluição.

## Estados da tela

- `loading`
- `ready`
- `validation_error`
- `save_error`
- `success`

## Dependências reutilizáveis

- `ImagePreviewCard`
- `ImageAcquisitionFlow`
- `useTemporaryUpload`

Consumidores relacionados:

- `Player_Profile`
- futuros pedidos de complementação disparados por sistema ou por time
