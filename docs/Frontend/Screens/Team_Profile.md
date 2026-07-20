---
title: Screen: Team Profile
status: Draft
version: 1.1.0
owner: Product Architecture
last_update: 2026-07-20
related_documents:
  - ../../Implementation/Core_Flows/Team_Profile_Implementation.md
  - Team_Settings.md
---

# Screen: Team Profile

## Objetivo

Perfil público ou privado do time.

## Elementos

- escudo;
- cores do time;
- cabeçalho recolhível;
- menu de ações rápidas sticky;
- últimos jogos;
- próximos jogos;
- elenco;
- rankings;
- feed;
- estatísticas;
- histórico.

## Campos

Tela de leitura predominante. Campos editáveis ficam em fluxos ou telas auxiliares de gestão.

## Visibilidade pública do perfil

Por padrão, o perfil público do time pode exibir:

- nome do time;
- escudo;
- cores principais;
- modalidade principal, quando existir;
- localidade macro:
  - estado;
  - cidade;
  - região ou zona, quando fizer sentido;
- descrição ou bio curta, quando existir;
- links públicos de redes sociais do time, quando cadastrados;
- feed público do time.
- composição pública do time:
  - jogadores do elenco;
  - comissão;
  - diretoria;
  - presidência.

Por padrão, o perfil público do time não deve exibir:

- status técnico de conexão com redes sociais;
- preferência operacional de publicação;
- dados internos de gestão;
- controles administrativos;
- solicitações de entrada no time;
- notificações operacionais;
- histórico interno de decisão sobre solicitações.

## Visibilidade pública de integrantes

Por padrão, o perfil do time pode exibir integrantes vinculados ao time em categorias públicas, incluindo:

- jogadores;
- comissão;
- diretoria;
- presidência.

Quando disponível, a UI pode mostrar:

- nome ou apelido;
- avatar;
- função principal no time;
- posição ou modalidade, no caso de atleta.

## Regras de UX

- Priorizar clareza e simplicidade.
- Exibir apenas campos essenciais inicialmente.
- Mostrar ações primárias com destaque.
- Permitir avançar para detalhes.
- Respeitar tema e modo de linguagem.
- Aplicar tema do time quando disponível.
- O menu de ações rápidas deve permanecer acessível durante a rolagem.
- Ao rolar, apenas o primeiro cabeçalho deve recolher; o conteúdo abaixo rola abaixo do menu de ações.
- Evitar sobreposição visual agressiva entre backgrounds translúcidos; quando necessário, usar máscara/overlay ou ajuste de composição sem perder o efeito sticky.
- Respeitar privacidade do time e visibilidade de conteúdo.
- Time deve poder existir e ser exibido com dados mínimos.
- Histórico do time não pertence a um único usuário.

## Evento social com distribuição externa

Quando o perfil ou feed do time exibir um `TEAM_EVENT`, pessoas com gestão podem visualizar o estado de distribuição externa desse evento.

### Visibilidade pública do feed

Por padrão, o perfil do time pode exibir publicamente:

- posts normais do feed do time;
- `TEAM_EVENT`;
- comentários de conteúdos públicos;
- reações de conteúdos públicos.

O conteúdo principal do post ou evento continua público mesmo quando existir bastidor operacional de distribuição externa.

### Visão para público comum

- ver apenas o post/evento normalmente;
- não ver detalhes técnicos de distribuição em redes externas.

### Visão para gestão

- ver status discreto por plataforma, quando houver distribuição configurada;
- exemplos:
  - `Instagram • publicado`
  - `TikTok • em envio`
  - `YouTube • falhou`
- se houver falha, mostrar mensagem curta e oferecer ação adequada, quando cabível.

### Ações para gestão

- `Tentar novamente`
- `Reconectar conta`
- `Validar conexão`
- `Ver configurações`

### Regra de decisão da ação

- `Tentar novamente`
  - usar quando a falha permitir retry manual operacional;
- `Reconectar conta`
  - usar quando a credencial estiver inválida, expirada ou revogada;
- `Validar conexão`
  - usar quando o estado da conta precisar de rechecagem antes de nova tentativa;
- `Ver configurações`
  - usar quando a pessoa precisar corrigir publicação desativada ou revisar a conexão da plataforma.

### Regra de UX

- o status da rede social deve ser complementar, não protagonista;
- o evento social do app continua sendo a referência principal;
- a falha de uma rede não deve parecer falha do post no app.
- o bastidor operacional da distribuição não deve poluir a leitura pública do feed.

## Estados

- loading;
- empty;
- error;
- success;
- offline quando aplicável.

## Eventos

- abrir timeline do time;
- navegar para elenco, rankings, feed e histórico;
- acionar edição apenas para usuários com permissão adequada.
