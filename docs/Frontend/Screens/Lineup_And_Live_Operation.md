---
title: Screen: Lineup And Live Operation
status: Draft
version: 1.11.0
owner: Product Architecture
last_update: 2026-07-13
related_documents:
  - ../../Domain/Matches.md
  - ../../Implementation/Core_Flows/Advanced_Match_Implementation.md
  - ../../Implementation/Database/Table_Spec_matches.md
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

Regras:

- nao existe limite maximo de relacionados por quadro;
- todo relacionado nao titular vira reserva automaticamente;
- o banco pode ficar vazio quando o time tiver apenas o minimo necessario para jogar;
- nenhum atleta pode ser relacionado sem numero da camisa;
- a posicao inicial nao precisa ser obrigatoria para salvar, exceto para o goleiro titular.

### Reabertura de rascunho

Quando existir uma `partida (match)` em:

- `status = DRAFT`
- `operation_phase = READY_TO_START`

a tela deve reabrir usando o `GET /api/v1/matches/:match_id`.

Essa leitura deve devolver para a UI:

- jogadores ja relacionados;
- quem e titular;
- quem esta no banco;
- numero da camisa ja confirmado;
- goleiro ja definido, quando existir;
- posicoes iniciais ja salvas;
- jogadores ainda disponiveis para entrar;
- contexto do tecnico da partida.

Regra:

- a reabertura deve preservar visualmente o estado anterior da escalação, e não obrigar o técnico a remontar o quadro do zero.

### Editabilidade depois que o jogo começa

Quando o cronômetro começa:

- a escalação inicial de titulares fica congelada como saída oficial da partida;
- mas a lista de jogadores relacionados continua editável.

Casos que continuam permitidos durante o jogo:

- adicionar jogador atrasado;
- adicionar jogador avulso;
- corrigir número da camisa;
- outros ajustes do elenco realmente disponível para jogar.

Depois que a partida acaba:

- esses mesmos ajustes continuam possíveis em modo de revisão;
- especialmente quando houver revisão por vídeo.

### Ordem oficial de sugestão dos atletas na escalação

Quando a tela estiver montando um quadro específico, a lista de atletas deve aparecer sempre nesta ordem:

1. atletas do quadro atual com resposta `vou`
2. atletas do quadro atual com resposta `talvez`
3. atletas do quadro atual com resposta `vou mas não vou jogar`
4. atletas de outro quadro, mantendo a mesma ordem:
   - `vou`
   - `talvez`
   - `vou mas não vou jogar`
5. jogadores avulsos

Regras:

- a tela sempre prioriza primeiro o quadro que está sendo configurado;
- atletas do outro quadro aparecem como apoio operacional, nunca como grupo principal;
- jogadores avulsos aparecem por último;
- essa ordem é apenas de sugestão e visualização;
  - ela não define automaticamente titular;
  - ela não define automaticamente reserva;
  - ela não define automaticamente goleiro.

### Confirmacao do numero da camisa

Fluxo:

- quando o tecnico selecionar um jogador para relacionar:
  - se ele ja tiver numero pre-configurado:
    - a UI pergunta algo como:
      - `O numero do jogador (display_name) e 7?`
    - o proprio numero deve ser clicavel;
    - ao tocar no numero, abre teclado numerico para alterar;
  - se ele nao tiver numero pre-configurado:
    - a UI pergunta:
      - `Qual o numero do jogador (display_name)?`
    - o teclado numerico deve abrir imediatamente.

Regras:

- o jogador so entra oficialmente como relacionado depois de ter `shirt_number` confirmado;
- o numero confirmado vale para aquele quadro especifico;
- o numero pre-configurado serve apenas como sugestao inicial, nao como verdade obrigatoria.

### Correcao rapida de atleta relacionado

Em qualquer momento da partida:

- `toque longo (long press)` sobre um atleta:
  - em quadra; ou
  - no banco
- deve abrir menu de opcoes contextuais.

Esse menu deve permitir no minimo:

- editar numero da camisa;
- corrigir dados basicos do relacionado;
- retirar o jogador da partida quando ele tiver sido escalado por engano.

Regra:

- se a remocao deixar a escalação abaixo do minimo exigido, a UI deve sinalizar que a escalação ficou invalida.

### Definicao do goleiro

Fluxo dinamico:

- conforme o tecnico arrastar os titulares para a quadra:
  - se algum jogador tiver funcao ou historico principal de goleiro;
  - a UI abre modal perguntando:
    - `O jogador (display_name) e o goleiro da partida?`
- se responder `Sim`:
  - o goleiro da partida fica definido;
  - a posicao inicial obrigatoria do goleiro fica atendida;
- se responder `Nao`:
  - o modal fecha;
  - a escalação continua normalmente.

Fallback ao salvar:

- se o tecnico tentar salvar sem goleiro definido:
  - a UI deve bloquear o salvamento;
  - abrir modal informando que goleiro e obrigatorio;
  - mostrar os titulares atuais para escolha direta de um deles como goleiro;
  - se o tecnico cancelar, ele pode voltar e trocar atletas antes de salvar.

Regra:

- deve existir exatamente um goleiro titular configurado no momento do salvamento da escalação.

### Quem aparece nesta superficie

- jogadores elegiveis para a partida;
- tecnico da partida apenas para confirmacao contextual.

Nao aparecem aqui para escalacao:

- presidencia;
- diretoria;
- comissao;
- outros perfis nao esportivos.

### Confirmacao do tecnico da partida

O tecnico nao participa da lista de atletas da escalação.

Ele aparece em um bloco contextual proprio da tela.

Fluxo:

- se existir `tecnico padrao do time (team_staff_defaults)` para a modalidade da partida:
  - a UI mostra esse nome como sugestao;
- o responsavel pode:
  - confirmar o tecnico sugerido;
  - trocar por outra `person`;
  - remover a confirmacao e deixar a partida sem tecnico definido por enquanto.

Regras:

- confirmar o tecnico da partida nao escala esse tecnico como atleta;
- trocar o tecnico altera apenas o contexto daquela partida;
- remover a confirmacao nao apaga o tecnico padrao do time;
- esse bloco deve ficar disponivel tanto na criacao quanto na reabertura do rascunho.

### Regra de `Quantidade de titulares (starters_count)`

- `FUTSAL`
  - exige `5` titulares.
- `FIELD`
  - exige `11` titulares.
- `SOCIETY`
  - nasce com `6` titulares por padrao.
  - deve mostrar no topo esquerdo um select:
    - label `Quantidade de titulares`
    - valor inicial `6`

Regras:

- esse select aparece apenas quando a modalidade for `SOCIETY`;
- se o tecnico tentar escalar o `7º` titular com o select ainda em `6`:
  - a UI deve bloquear a acao;
  - mostrar modal explicando que a configuracao atual esta em `6`;
  - orientar a mudar o select se quiser jogar com `7`;
- se o tecnico mudar de `6` para `7`:
  - a escalação atual deve ser preservada;
  - o sistema apenas passa a aceitar mais um titular;
- se o tecnico reduzir o valor para menos do que ja existe escalado:
  - deve haver confirmacao explicita;
  - a UI deve avisar que a escalação ficara invalida ate remover excedentes;
- ao salvar:
  - a UI deve bloquear quando faltarem jogadores para atingir o minimo configurado;
  - o modal deve informar quantos ainda faltam;
- toda alteracao em `Quantidade de titulares (starters_count)` deve ser persistida:
  - na `match`;
  - e no agendamento vinculado, quando existir.

### Regra de ordem entre quadros

- quando o compromisso tiver dois quadros, o fluxo padrao do produto deve operar primeiro o `2º quadro`;
- o `1º quadro` normalmente e montado apenas depois do encerramento do `2º quadro`;
- ao terminar o `2º quadro`, a UI deve mostrar:
  - resumo breve da partida encerrada;
  - CTA principal `Montar 1º quadro`;
- ao tocar nesse CTA, a tela reabre o mesmo fluxo de escalacao, agora para o `1º quadro`.

### Operar jogo ao vivo

- manter titulares visiveis dentro da quadra ou campo;
- aceitar reposicionamento visual;
- abrir microfluxos contextuais para registrar eventos;
- aceitar operacao colaborativa com multiplos usuarios.

### Timeline de pressão do jogo

A versão vertical da tela de `Momento do jogo` deve usar a área inferior como leitura contextual da partida.

Componente:

- nome em português: `Timeline de pressão do jogo`
- nome técnico: `MatchMomentumTimeline`
- fonte de dados: `GET /api/v1/matches/:match_id/momentum`

Objetivo:

- mostrar se o próprio time está pressionando;
- mostrar se o adversário está pressionando;
- permitir leitura rápida dos últimos `5`, `10` ou `15` minutos;
- apoiar decisão do técnico durante o jogo;
- gerar material de resenha e comparação entre jogadores depois da partida.

Regras visuais:

- a timeline aparece abaixo da quadra na versão vertical;
- deve manter a identidade dark premium do FUTSTATS;
- não deve parecer dashboard corporativo;
- o lado favorável ao próprio time aparece acima da linha central;
- o lado favorável ao adversário aparece abaixo da linha central;
- dourado representa o próprio time;
- cinza ou vermelho discreto representa o adversário;
- a leitura deve ser visual e rápida, sem excesso de números.

Filtros obrigatórios:

- `Todos (ALL)`
- `Chutes (SHOTS)`
- `Gols (GOALS)`
- `Faltas (FOULS)`
- `Defesas (SAVES)`
- `Dribles (DRIBBLES)`
- `Jogador (PLAYER)`

Janelas obrigatórias:

- `5m`
- `10m`
- `15m`
- `Tempo todo (FULL)`, quando houver espaço ou em versão expandida.

Filtro por jogador:

- o chip `Jogador (PLAYER)` deve abrir um bottom sheet pequeno;
- o bottom sheet deve listar titulares e reservas;
- cada jogador deve aparecer com:
  - foto ou avatar;
  - número da camisa;
  - apelido ou nome curto, quando couber;
- ao selecionar um jogador:
  - o chip deve mudar para algo como `#11 Piolho`;
  - a timeline deve mostrar apenas eventos em que esse jogador participou;
  - deve existir ação simples para limpar o filtro.

Detalhe do evento:

- tocar em um ícone ou marcador da timeline deve abrir um popover curto;
- o popover deve mostrar no mínimo:
  - tempo do lance;
  - tipo do evento;
  - time/lado;
  - número e nome curto do jogador principal, quando existir;
  - participante secundário, quando existir;
- eventos agrupados em intervalo pequeno podem abrir lista compacta.

Relação com reservas:

- a aba `Reservas` continua presente na base da tela;
- ao abrir `Reservas`, a gaveta de banco sobe por cima da timeline;
- a timeline não deve impedir substituição ou adição de jogador atrasado.

Versão horizontal:

- a timeline não deve ficar fixa por padrão;
- deve existir um botão discreto, por exemplo `Pressão`;
- ao tocar, a timeline abre como overlay sobre a quadra;
- fechar o overlay devolve a tela para a operação principal.

Atualização:

- eventos confirmados chegam por realtime;
- eventos locais pendentes podem aparecer com estado visual discreto;
- o heartbeat do cronômetro alinha o tempo usado nos eventos, mas não é a fonte principal da timeline;
- a timeline deve ser recalculada quando eventos forem criados, corrigidos ou revisados.

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

## Fases oficiais do quadro

- `READY_TO_START`
- `FIRST_HALF_LIVE`
- `FIRST_HALF_PAUSED`
- `HALFTIME`
- `SECOND_HALF_LIVE`
- `SECOND_HALF_PAUSED`
- `COMPLETED`
- `CANCELLED`

Regra:

- a UI deve responder a essas fases oficiais;
- a visibilidade dos botoes do cronometro depende dessa fase;
- `Fim do 1º tempo` e `Terminar partida` sao transicoes de fase, nao pausas.

## Menu do cronometro

### Durante `FIRST_HALF_LIVE`

Acoes disponiveis:

- `Pausa tecnica`
- `Pausa`
- `Fim do 1º tempo`
- `Terminar partida`

### Durante `FIRST_HALF_PAUSED`

Acoes disponiveis:

- `Retomar 1º tempo`
- `Fim do 1º tempo`
- `Terminar partida`

### Durante `HALFTIME`

A unica acao principal do cronometro deve ser:

- `Comecar 2º tempo`

### Durante `SECOND_HALF_LIVE`

Acoes disponiveis:

- `Pausa tecnica`
- `Pausa`
- `Terminar partida`

### Durante `SECOND_HALF_PAUSED`

Acoes disponiveis:

- `Retomar 2º tempo`
- `Terminar partida`

## Confirmacoes obrigatorias

- `Fim do 1º tempo` deve exigir confirmacao explicita;
- `Terminar partida` deve exigir confirmacao explicita;
- a confirmacao existe para evitar encerramento acidental do periodo ou do quadro.

## Regra de efeito de cada acao do cronometro

- `Comecar 1º tempo`
  - inicia oficialmente o quadro;
  - muda a fase para `FIRST_HALF_LIVE`.
- `Pausa tecnica`
  - pausa o periodo atual;
  - registra pausa tecnica, nao encerramento de tempo.
- `Pausa`
  - pausa o periodo atual;
  - registra pausa generica, nao encerramento de tempo.
- `Retomar 1º tempo`
  - reativa o `FIRST_HALF_LIVE`.
- `Fim do 1º tempo`
  - encerra o primeiro tempo;
  - muda a fase para `HALFTIME`.
- `Comecar 2º tempo`
  - inicia o segundo tempo;
  - muda a fase para `SECOND_HALF_LIVE`.
- `Retomar 2º tempo`
  - reativa o `SECOND_HALF_LIVE`.
- `Terminar partida`
  - encerra oficialmente o quadro atual;
  - nao exige `PERIOD_END` separado do segundo tempo.

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
