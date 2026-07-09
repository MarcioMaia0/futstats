---
title: Error Messages
status: Draft
version: 1.0.0
owner: Product Architecture
last_update: 2026-07-09
---

# Error Messages

## Objetivo

Definir filosofia de erros.

## Regras

- Mensagem clara.
- Sem culpa no usuário.
- Explicar próximo passo.
- Adaptar linguagem ao modo.
- Preservar dados preenchidos.

## Exemplo

Technical: "Não foi possível salvar a partida."
Resenha: "Ih, não deu pra salvar esse jogo agora. Tenta de novo."

## Falhas de distribuição externa

### Princípio

- Falha de rede social não deve parecer falha do evento principal no app.
- A mensagem principal continua positiva quando o evento já foi criado com sucesso no app.
- O problema externo entra como status complementar ou ação corretiva para quem gerencia o time.

### Mensagens conceituais

#### Falha temporária

- `Publicado no app. Vamos tentar enviar para a rede novamente.`

#### Retry esgotado

- `Publicado no app. Não conseguimos enviar para esta rede.`
- ação sugerida: `Tentar novamente`

#### Conexão expirada

- `Publicado no app. A conexão desta rede expirou.`
- ação sugerida: `Reconectar conta`

#### Permissão insuficiente

- `Publicado no app. Esta conta não tem permissão para publicar.`
- ação sugerida: `Revisar conexão`

#### Publicação desativada

- `Esta rede está conectada, mas a publicação de eventos está desativada.`
- ação sugerida: `Ativar publicação`

### Regra de audiência

- Usuário comum não precisa ver erro técnico de rede social do time.
- Gestão do time pode ver status resumido, motivo da falha e próximo passo acionável.

## Critérios de qualidade

- O fluxo deve funcionar para usuário casual sem exigir cadastro excessivo.
- Recursos avançados devem ser progressivos e opcionais.
- O comportamento deve preservar consistência entre frontend, backend, API e banco.
- Todas as entidades técnicas, payloads, enums e nomes internos devem usar inglês.
- Textos exibidos ao usuário devem passar por camada de linguagem/configuração.

## Regras para IA

Ao usar este documento como contexto para implementação, a IA deve:
1. preservar o princípio de uso casual simples;
2. não criar campos obrigatórios que bloqueiem o MVP;
3. respeitar separação entre dado canônico e texto de interface;
4. manter compatibilidade com evolução futura;
5. sugerir migrations, testes e endpoints quando alterar domínio.
