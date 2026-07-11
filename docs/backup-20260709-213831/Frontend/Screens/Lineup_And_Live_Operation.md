---
title: Screen: Lineup And Live Operation
status: Draft
version: 1.2.0
owner: Product Architecture
last_update: 2026-07-09
related_documents:
  - ../../Domain/Matches.md
  - ../../Implementation/Core_Flows/Advanced_Match_Implementation.md
  - ../../Implementation/Database/Table_Spec_match_events.md
---

# Screen: Lineup And Live Operation

## Objetivo

Servir como superficie operacional unica para:

- escalar o time;
- posicionar atletas em quadra ou campo;
- operar eventos ao vivo;
- revisar eventos por video depois da partida.

## Conceito visual

- fundo com quadra ou campo em leve isometria;
- leitura inspirada em prancheta magnetica;
- atletas fora da quadra representados por cards em grid;
- atletas em quadra representados por avatar circular com numero da camisa;
- rolagem vertical no container externo quando a quantidade de cards exigir;
- estrutura pensada para celular e tablet, sem impedir uso em desktop.

## Modos principais

### Escalar time

- selecionar relacionados do quadro;
- definir quem comeca jogando;
- arrastar titulares para dentro da quadra ou campo;
- salvar a escalacao do quadro;
- so nesse momento nasce a `match` operacional do quadro.

### Operar jogo ao vivo

- manter titulares visiveis dentro da quadra ou campo;
- aceitar reposicionamento visual;
- abrir microfluxos contextuais para registrar eventos;
- aceitar operacao colaborativa com multiplos usuarios.

### Operar jogo ao vivo em modo casual

- reutilizar a mesma base da tela;
- destacar no topo:
  - escudo do proprio time;
  - placar da partida;
  - escudo do adversario;
  - cronometro;
- permitir registrar gol sem entrar no fluxo hardcore de scout.

### Revisar por video

- reutilizar a mesma base visual da operacao ao vivo;
- liberar correcao e enriquecimento de eventos apos `match.status = COMPLETED`;
- remover restricoes de responsabilidade operacional, mantendo permissao de acesso.

## Entidades interagiveis

- atleta do proprio time;
- atleta adversario;
- goleiro;
- bola.

## Container superior no modo casual

- escudo do proprio time;
- placar da partida;
- escudo do adversario;
- cronometro.

## Fluxo casual de gol

### Gol do proprio time

- tocar no escudo do proprio time;
- somar gol no placar;
- abrir selecao rapida de quem fez o gol entre os atletas em quadra;
- ao escolher o atleta, registrar:
  - time do gol;
  - autor do gol;
  - tempo do cronometro;
  - quadro.

### Gol do adversario

- tocar no escudo do adversario;
- somar gol no placar do adversario;
- registrar o tempo do cronometro;
- se existirem jogadores adversarios locais cadastrados:
  - permitir identificar o autor pelo numero da camisa;
- se nao existirem jogadores adversarios locais:
  - salvar como gol do adversario sem autor identificado.

### Gol contra

- pode ser marcado por edicao imediata ou posterior;
- o fluxo casual nao precisa obrigar essa decisao no primeiro toque.

## Representacao visual na selecao rapida de autor

- prioridade de representacao:
  - foto ou avatar;
  - numero da camisa;
  - nome curto;
- se o atleta nao tiver foto:
  - mostrar circulo com numero da camisa;
- a mesma regra vale para:
  - jogadores do proprio time;
  - jogadores adversarios locais.

## Edicao rapida de gol

- no mobile:
  - `long press` sobre o escudo do time ou do adversario;
- na web:
  - botao `Editar` ao lado do escudo correspondente;
- o modal de edicao deve permitir no minimo:
  - remover gol;
  - trocar autor do gol;
  - corrigir classificacao para gol contra quando aplicavel.

## Gestos base

### Clique ou toque simples (`click/tap`)

- seleciona o ator em foco;
- abre menu radial contextual quando o ator ja estiver posicionado em quadra ou campo;
- nao deve registrar evento sozinho.

### Toque longo (`long press`)

- prepara arraste com mais seguranca no mobile;
- reduz disparo acidental.

### Arrastar para dentro da quadra ou campo (`drag into field`)

- em escalacao:
  - coloca atleta entre os titulares;
  - define posicao inicial visual;
- em operacao ao vivo:
  - reposiciona o ator em quadra ou campo.

### Arrastar dentro da quadra ou campo (`drag within field`)

- move o ator para outra regiao visual;
- nao abre microfluxo automaticamente ao soltar.

### Arrastar para fora da quadra ou campo (`drag out of field`)

- inicia `Substituicao (SUBSTITUTION)`;
- o ator arrastado e interpretado como quem saiu;
- ao soltar fora da area jogavel, a tela mostra o banco para escolher quem entrou.

### Arrastar a bola em subfluxos (`drag ball target`)

- usado apenas em eventos que exigem destino da bola;
- exemplo:
  - `Chute (SHOT)`;
  - outros fluxos que venham a exigir alvo espacial.

## Regra de seguranca

- soltar um ator nao deve abrir evento contextual automaticamente;
- o microfluxo nasce apenas de selecao intencional por `click/tap`;
- a tela deve oferecer `desfazer (undo)` e `cancelar`.

## Regra semantica de microfluxo

- todo microfluxo comeca por um pre-filtro:
  - `Ataque (ATTACK)`
  - `Defesa (DEFENSE)`
- esse pre-filtro reduz opcoes e muda a leitura semantica do mesmo evento.

### Exemplo

- em `Ataque (ATTACK)`:
  - `Falta (FOUL)` significa `sofreu falta (FOUL_SUFFERED)`;
- em `Defesa (DEFENSE)`:
  - `Falta (FOUL)` significa `cometeu falta (FOUL_COMMITTED)`.

## Regra geral dos microfluxos

- cada `tipo de evento (event_type)` possui seu proprio microfluxo;
- a profundidade do microfluxo varia conforme a riqueza necessaria do evento;
- o fluxo deve pedir apenas o minimo necessario para aquele caso;
- fluxos espaciais mais ricos podem capturar:
  - origem do lance;
  - contexto de ataque ou defesa;
  - tipo de acao;
  - destino da bola;
  - parte do corpo;
  - defesa do goleiro;
  - falha de marcacao;
  - outros detalhes do scout.

## Regra de salvamento antecipado (`early save`)

- todo microfluxo deve permitir `Salvar` antes de chegar ao fim do fluxo completo;
- ao salvar antes do fim, o sistema persiste apenas os dados ja informados;
- o restante do evento continua vazio sem bloquear o registro;
- essa regra permite um meio-termo entre:
  - fluxo casual;
  - fluxo intermediario;
  - fluxo hardcore.

### Exemplo

- `Lucas`
- origem do lance registrada;
- acao `Chute (SHOT)` escolhida;
- operador clica em `Salvar`;
- o sistema registra:
  - ator;
  - origem;
  - tipo de evento;
  - tempo;
- e nao exige ainda:
  - destino da bola;
  - parte do corpo;
  - defesa;
  - falha de marcacao.

## Exemplo de microfluxo rico

### `Chute (SHOT)`

1. selecionar o ator em quadra ou campo;
2. escolher `Ataque (ATTACK)` ou `Defesa (DEFENSE)`;
3. escolher `Chute (SHOT)` ou outra acao compativel;
4. abrir visao frontal do gol;
5. arrastar a bola para o destino;
6. escolher parte do corpo:
   - perna direita;
   - perna esquerda;
   - cabeca;
7. se a bola entrar na area do gol sem ser gol:
   - considerar `Defesa (SAVE)` do goleiro;
   - pedir nivel de dificuldade da defesa;
8. se o contexto exigir:
   - permitir apontar falha de marcacao.

## Exemplo de microfluxo curto

### `Sofreu falta (FOUL_SUFFERED)`

1. selecionar o ator;
2. escolher `Ataque (ATTACK)`;
3. escolher `Falta (FOUL)`;
4. encerrar fluxo.

## Adversarios em quadra

- atletas adversarios tambem devem poder ser posicionados;
- eventos do adversario usam a mesma estrutura de contexto e microfluxo;
- isso permite registrar, por exemplo:
  - chute do adversario;
  - gol sofrido;
  - defesa do goleiro;
  - falha de marcacao de alguem do proprio time.

## Substituicao

- o fluxo nasce por `drag out of field`;
- ao escolher o substituto no banco, o sistema registra:
  - quem saiu;
  - quem entrou;
  - tempo do jogo;
  - quadro.

## Regras de UX

- a tela deve parecer uma unica superficie operacional, nao varias telas desconectadas;
- o fluxo hardcore nao pode bloquear evolucao de um fluxo casual mais simples;
- o fluxo casual deve conseguir registrar apenas gols com o menor atrito possivel;
- o fluxo intermediario deve conseguir salvar evento parcial sem preencher todos os detalhes do microfluxo;
- gestos devem ser tolerantes a diferencas de tamanho de tela;
- desktop e mobile devem compartilhar a mesma logica mental, com adaptacao de input;
- o operador deve conseguir brincar com posicionamento sem criar evento sem querer.
