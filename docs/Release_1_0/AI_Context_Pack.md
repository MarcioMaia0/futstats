---
title: AI Context Pack
status: Approved
version: 1.0.0
owner: Product Architecture
last_update: 2026-07-06
related_documents: []
---

# AI Context Pack

## Objetivo

Fornecer um contexto compacto para ferramentas de IA que venham a auxiliar na implementação do FUTSTATS.

## Contexto essencial

O FUTSTATS é uma plataforma para futebol amador e várzea. O produto deve entregar valor imediato para usuários casuais através de placar, gols, cards e resenha, enquanto permite evolução progressiva para gestão, scout, estatísticas e inteligência esportiva.

## Princípios que a IA deve respeitar

1. Não tornar recursos avançados obrigatórios.
2. Não transformar o MVP em ferramenta pesada de análise.
3. Priorizar fluxos rápidos e sociais.
4. Manter código, banco, APIs e enums em inglês.
5. Manter explicações e conteúdo de documentação em português.
6. Separar dados canônicos de textos de interface.
7. Preservar arquitetura modular.
8. Usar DDD como referência.
9. Tratar social como domínio central.
10. Tratar estatística como camada progressiva.

## Prompt base sugerido

```text
Você está trabalhando no projeto FUTSTATS. Antes de implementar, leia a documentação relevante em FUTSTATS_Docs. Respeite o princípio central: o sistema nunca deve exigir comportamento analítico para entregar valor. Use inglês para código, banco, APIs e enums. Use português para explicações. Priorize MVP casual-first, com camadas avançadas opcionais.
```

## Restrições

A IA não deve inventar regras incompatíveis com a documentação. Quando houver dúvida, deve preferir simplicidade, progressividade e experiência casual.
