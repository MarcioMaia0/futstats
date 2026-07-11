---
title: Matches Domain
status: Draft
version: 0.7.0
owner: Product Architecture
last_update: 2026-07-09
related_documents: []
---

# Matches Domain

## Objetivo

Definir partidas como evento central do FUTSTATS.

## Niveis

1. Casual: placar, gols e compartilhamento.
2. Organizado: elenco, quadra, adversario e arbitragem.
3. Avancado: scout, eventos, estatisticas.

## Regras

1. Partida pode ser criada com dados minimos.
2. Gol pode existir sem autor.
3. Scout nunca e obrigatorio.
4. Primeiro e segundo quadro sao partidas independentes.
5. Cancelamento permanece no historico.
6. Editar gols recalcula placar.
7. Atleta relacionado para a partida nao e o mesmo conceito de atleta oficial do time.
8. Confirmacao de presenca pertence a outra camada, diferente da escalacao.
9. Substituicoes detalhadas e eventos taticos finos podem evoluir sem bloquear o fluxo casual.
10. O tecnico efetivo da partida deve ser registrado separadamente do elenco.
11. Jogo agendado e partida operacional sao conceitos diferentes.
12. A quantidade de quadros do compromisso pode alterar a leitura de presenca.
13. Acompanhamento ao vivo por quadro pode existir como camada opcional, sem ser obrigatorio para toda partida.
14. O sistema deve aceitar o fluxo inverso: partida criada primeiro e compromisso de agenda derivado depois, para jogos de ultima hora.
15. Encerramento operacional da partida e fechamento analitico da partida sao estados diferentes.
16. Coleta ao vivo colaborativa deve tolerar internet instavel e preservar trilha de confianca do tempo dos eventos.
17. A mesma superficie operacional pode servir para escalacao, eventos ao vivo e revisao por video.
18. `Ataque (ATTACK)` e `Defesa (DEFENSE)` devem funcionar como pre-filtro semantico dos microfluxos.
19. Microfluxos de evento devem aceitar salvamento antecipado com persistencia parcial.

## Modalidades

1. Toda partida possui uma modalidade canonica: `FUTSAL`, `SOCIETY` ou `FIELD`.
2. A quantidade de titulares (`starters_count`) tem padrao derivado da modalidade (5/7/11) e pode ser ajustada por partida.
3. A modalidade do time e apenas contextual e nao limitadora.
4. A modalidade real do jogo pertence ao compromisso ou a propria partida.
5. Se houver agendamento, a modalidade nasce em `scheduled_matches`.
6. Se a partida nascer sem agendamento previo, a modalidade nasce em `matches`.
7. O cadastro do time pode servir como sugestao, atalho ou pre-preenchimento, mas nao define nem restringe a modalidade futura do jogo.
8. Estatisticas e rankings podem segmentar por modalidade.
9. Ver `ADR_011_Multi_Modality_Support.md`.

## Camadas de participacao na partida

- `match_players`
  - quem foi relacionado para o jogo por aquele time;
- `team_members`
  - quem pertence ao time como integrante base;
- `match_players_positions`
  - em quais posicoes aquele atleta pode atuar naquela partida;
- `team_staff_defaults`
  - staff padrao do time para facilitar criacao da partida;
- `match_staff`
  - tecnico efetivo registrado para aquela partida;
- `match_attendance_responses`
  - como o integrante respondeu ao compromisso agendado;
- `scheduled_matches`
  - compromisso futuro antes da partida operacional;
- `match_substitutions`
  - quem entrou no lugar de quem durante o jogo;
- `match_events`
  - lances e acontecimentos granulares da partida.

## Regra de superficie operacional

- a tela operacional da partida pode evoluir em camadas, sem trocar de paradigma visual:
  - selecionar relacionados;
  - definir titulares;
  - operar o jogo ao vivo;
  - revisar por video;
- atores interagiveis podem incluir:
  - atletas do proprio time;
  - atletas adversarios;
  - goleiro;
  - bola.
- reposicionamento visual do ator nao deve, sozinho, gerar evento.
- o evento nasce de intencao explicita do operador.

## Regra de microfluxo contextual

- cada `tipo de evento (event_type)` deve possuir microfluxo proprio;
- microfluxos podem ter profundidade diferente;
- o primeiro filtro do microfluxo deve ser:
  - `Ataque (ATTACK)`
  - `Defesa (DEFENSE)`
- o mesmo evento-base pode mudar de leitura conforme esse contexto;
- exemplo:
  - `Falta (FOUL)` em `Ataque (ATTACK)` pode significar `sofreu falta`;
  - `Falta (FOUL)` em `Defesa (DEFENSE)` pode significar `cometeu falta`.
- o microfluxo deve poder ser salvo antes do fim completo, desde que o nucleo minimo do evento tenha sido atendido.

## Regra de encerramento e analise

- `match.status` representa o que aconteceu com o jogo em campo.
- `match.analysis_status` representa o quanto a leitura analitica da partida ja foi consolidada.
- uma partida pode estar:
  - operacionalmente encerrada;
  - analiticamente ainda aberta;
- `COMPLETED` nao bloqueia enriquecimento posterior.
- a analise posterior pode incluir:
  - revisao por video;
  - inclusao de eventos que faltaram;
  - correcao de autoria;
  - fechamento de metricas mais finas.

## Regra de sincronizacao ao vivo

- a operacao ao vivo deve aceitar multiplos usuarios na mesma partida ao mesmo tempo;
- o cronometro oficial do quadro deve ter um aparelho mestre;
- os demais aparelhos devem operar com sincronizacao periodica e capacidade offline;
- eventos devem guardar contexto suficiente para recalculo posterior do tempo;
- janela cega deve ser tratada como conceito explicito do dominio;
- apos reconexao, o sistema deve:
  - recalcular eventos pendentes;
  - reclassificar confianca;
  - exigir revisao manual quando a divergencia estimada for relevante.

## Ideia futura: acompanhamento ao vivo por quadro

- cada quadro pode ter um estado operacional de andamento visivel para quem acompanha o jogo de longe;
- o time pode publicar pequenas atualizacoes textuais, como um lance a lance simplificado;
- isso depende de alguem operar manualmente no momento do jogo;
- nem toda partida precisa ter essa camada ativa;
- essa funcionalidade deve ser tratada como opcional e separada da existencia basica da partida.

## Regra de separacao

- Um atleta avulso pode existir globalmente como `player` sem virar `team_player`.
- Participacao na partida nao deve ser confundida com vinculo oficial com o time.
- Presenca no compromisso nao deve ser confundida com participacao esportiva real.
- Presenca no compromisso nao deve depender de `player`; ela pertence ao integrante do time.
- Confirmacao de presenca nao deve ser confundida com escalacao.
- Tecnico padrao do time nao substitui tecnico efetivo da partida.
- Pre-configuracao padrao de quadro do time nao substitui a escalacao real do jogo.

## Regra de quadros no agendamento

- o compromisso futuro pode declarar quantos quadros tera via `match_frame_count`.
- se houver dois quadros:
  - a leitura de presenca pode ser separada em:
    - segundo quadro
    - primeiro quadro
- essa separacao pode usar a pre-configuracao padrao do time apenas como referencia.
- a confirmacao de presenca continua sendo unica por integrante no compromisso.
- o quadro, nesse momento, ajuda na leitura logistica do elenco e nao cria multiplas respostas de presenca para a mesma pessoa.

## Regra de fluxo inverso para jogo de ultima hora

- o fluxo normal continua sendo:
  - agendar jogo;
  - liberar para o time;
  - confirmar presenca;
  - abrir partida operacional;
- o sistema tambem deve aceitar o fluxo inverso para jogo de ultima hora:
  - criar a partida operacional primeiro;
  - derivar um item de agenda vinculado depois;
- esse item derivado de agenda existe para:
  - manter a linha do tempo do time coerente;
  - permitir que o jogo apareca na agenda mesmo sem agendamento previo;
  - preservar a sensacao de continuidade entre agenda e partida;
- no fluxo inverso, o compromisso derivado nao representa planejamento antecipado;
- no fluxo inverso, a agenda representa que o jogo passou a existir operacionalmente e deve ficar visivel para o time;
- a vinculacao entre agenda e partida deve continuar explicita para impedir duplicidade e leitura ambigua.
