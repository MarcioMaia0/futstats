---
title: Product Principles
status: Draft
version: 0.5.0
owner: Product Architecture
last_update: 2026-07-06
related_documents: [Product_Overview.md, Product_Vision.md]
---

# Product Principles

## Objetivo

Definir os princípios permanentes que devem orientar toda decisão de produto, design, arquitetura e priorização do FUTSTATS.

## P-001: Entregar valor desde o primeiro jogo

O usuário precisa sentir utilidade no primeiro contato. Isso significa que registrar uma partida, marcar o placar, indicar quem fez os gols e compartilhar o resultado deve ser rápido, claro e divertido.

### Implicações

- O MVP deve priorizar fluxos curtos.
- Campos avançados devem ser opcionais.
- O primeiro resultado compartilhável é mais importante que relatórios complexos.
- O usuário não deve precisar entender scout para usar o app.

## P-002: Nunca exigir comportamento analítico para entregar valor

O FUTSTATS deve atender tanto o usuário casual quanto o analítico. O usuário casual pode querer apenas resenha, placar e compartilhamento. Isso é uso legítimo e valioso.

### Implicações

- Scout avançado nunca deve bloquear finalização de uma partida.
- Relatórios avançados não devem poluir o fluxo casual.
- Dados incompletos devem ser aceitos.
- Métricas devem ser progressivas.

## P-003: O social é porta de entrada

A adoção inicial provavelmente virá pelo compartilhamento, pela resenha, pelos cards, pelos perfis e pela vontade de aparecer.

### Implicações

- Resultado deve gerar conteúdo compartilhável.
- Perfil do atleta deve ter apelo visual.
- A linguagem deve poder ser descontraída.
- O feed e os cards devem ser tratados como recursos centrais, não periféricos.

## P-004: Inteligência é evolução progressiva

O FUTSTATS deve permitir que times avancem para estatísticas, scout, quadras, arbitragem e análise de performance conforme ganham maturidade.

### Implicações

- A arquitetura deve nascer preparada para dados avançados.
- A UX deve revelar profundidade aos poucos.
- O banco pode ter campos opcionais desde o início.
- Relatórios devem explicar claramente quais dados foram usados.

## P-005: Legado é consequência do uso

Guardar a história do futebol amador é importante, mas esse valor ganha força com o tempo. No começo, o usuário compra a utilidade imediata.

### Implicações

- O discurso inicial deve focar em uso prático e social.
- O histórico deve ser construído automaticamente.
- Recordes, linha do tempo e memória devem surgir naturalmente.
- O produto não deve depender de uma promessa de valor futura para convencer o usuário.

## P-006: Profissionalizar sem descaracterizar

O FUTSTATS deve dar ferramentas profissionais à várzea sem transformar a cultura local em um sistema frio, engessado e burocrático.

### Implicações

- A resenha deve coexistir com estatística.
- Apelidos são importantes.
- Linguagem configurável é essencial.
- Design deve ser moderno, mas com identidade esportiva e popular.

## P-007: Dados canônicos, apresentação flexível

O banco, APIs e código usam inglês técnico. A interface apresenta os termos conforme modo de linguagem.

### Exemplo

`LINE_BREAK_PASS` pode aparecer como:

- Passe de ruptura
- Rompedor
- Bruxaria

## P-008: Recursos avançados devem gerar benefício claro

Se uma funcionalidade exige mais trabalho do usuário, ela precisa devolver valor proporcional.

## Checklist para novas funcionalidades

Toda nova funcionalidade deve responder:

1. Ela entrega valor para o usuário casual, analítico ou ambos?
2. Ela aumenta complexidade do primeiro uso?
3. Ela pode ser opcional?
4. Ela gera conteúdo social?
5. Ela gera dado útil?
6. Ela respeita a cultura da várzea?
7. Ela se encaixa em Organização, Experiência, Inteligência ou Legado?
