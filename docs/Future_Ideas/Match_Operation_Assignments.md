---
title: Future Idea - Match Operation Assignments
status: Idea
version: 1.0.0
owner: Product Architecture
last_update: 2026-07-10
related_documents:
  - ../Domain/Matches.md
  - ../Frontend/Screens/Lineup_And_Live_Operation.md
  - ../Implementation/API/Endpoint_Detail_Matches.md
  - ../Implementation/Services/Match_Service_Spec.md
  - ../Implementation/Database/Table_Spec_match_operator_assignments.md
---

# Future Idea: Match Operation Assignments

## Objetivo

Preservar a direcao futura da tela e do fluxo de designacao de operadores da partida, sem transformar isso ainda em contrato canonico.

## Contexto

Ja ficou claro que o produto precisa de uma camada para definir quem opera a partida ao vivo e quais responsabilidades cada pessoa assume.

Tambem ficou claro que ainda nao existe seguranca suficiente para fechar esse fluxo sem antes amadurecer melhor os layouts e os pontos de entrada da UI.

## Perguntas em aberto

As decisoes abaixo continuam em aberto e precisam ser respondidas juntas:

1. Quem vai indicar ou designar as pessoas participantes da operacao?
2. Onde essa pessoa vai acessar a tela para fazer isso?
3. Como vai ser a tela para designar pessoas e funcoes?
4. Como as pessoas designadas vao acessar a superficie operacional correta?

## Motivo do adiamento

Neste momento, a duvida principal nao esta no dominio tecnico de permissoes, e sim na descoberta do melhor fluxo de interface.

O desenho atual ainda nao permite afirmar com seguranca:

- qual e o melhor ponto de entrada para a tela;
- se a designacao acontece antes da escalacao, dentro da partida ou em ambos;
- como a pessoa designada encontra sua superficie sem gerar confusao;
- qual formato de layout comunica melhor pessoas, funcoes e responsabilidades.

Por isso, fechar contrato tecnico agora criaria alto risco de retrabalho.

## O que ja esta entendido

Mesmo sem fechar a tela, algumas direcoes ja ficaram claras:

- existe valor real em designar operadores por responsabilidade;
- nem toda pessoa conectada na partida deve editar tudo;
- o modo de revisao posterior pode ser mais flexivel que o modo ao vivo;
- a resposta definitiva depende do amadurecimento visual e estrutural das telas da partida.

## Quando retomar

Esta ideia deve voltar para a fonte canonica quando pelo menos uma destas condicoes acontecer:

- o layout da partida ao vivo estiver mais desenvolvido;
- o ponto de entrada da tela de operacao estiver mais claro;
- a UX de descoberta para pessoas designadas puder ser prototipada com mais seguranca.

## Status

Ideia valida e importante, mas ainda dependente de evolucao do layout para virar regra oficial de produto, API, banco ou frontend.
