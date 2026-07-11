---
title: Documentation Index
status: Approved
document_type: Normative
version: 2.4.0
owner: Product Architecture
last_update: 2026-07-10
related_documents:
  - docs/README.md
  - docs/Architecture/Architecture_Principles.md
  - docs/AI/AI_Development_Guidelines.md
  - docs/Release_1_0/Handoff_Guide.md
  - docs/Release_1_0/Source_of_Truth_Map.md
---

# Documentation Index

## Objetivo

O `Documentation_Index.md` é o ponto de entrada principal e o portal de governança da documentação do **FUTSTATS**.

Seu objetivo é orientar desenvolvedores, arquitetos, product owners, QAs e assistentes de Inteligência Artificial sobre:

- onde cada assunto deve ser lido;
- qual documento prevalece em caso de conflito;
- como distinguir fonte canônica, apoio contextual e material histórico.

> [!NOTE]
> Este arquivo atua como direcionador de referências. Ele não duplica regras específicas de arquitetura, backend, banco de dados ou IA, que possuem seus próprios documentos canônicos dentro de [docs](/D:/xampp/htdocs/futstats-app/docs).

## Princípios da Documentação

1. **Uma fonte de verdade por assunto**: cada decisão deve ter um documento principal.
2. **Menos duplicação, mais referência cruzada**: quando um assunto já estiver fechado em outro arquivo, a documentação deve apontar para ele em vez de reescrevê-lo.
3. **Conteúdo único não pode ser apagado por rótulo**: se um arquivo com origem em MVP ainda for a única fonte de uma regra, fluxo ou contrato, ele deve ser preservado até que o conteúdo seja migrado.
4. **Código e documentação evoluem juntos**: mudanças significativas nas regras de domínio ou infraestrutura exigem atualização da documentação correspondente.
5. **Foco no domínio**: a explicação do negócio antecede a documentação de infraestrutura tecnológica.

## Hierarquia Documental

Em caso de divergência ou conflito conceitual entre os documentos do projeto, a seguinte ordem de prevalência deve ser respeitada:

1. `Project_Constitution.md` quando existir.
2. [Architecture_Principles.md](/D:/xampp/htdocs/futstats-app/docs/Architecture/Architecture_Principles.md).
3. `Documentation_Index.md`.
4. [Source_of_Truth_Map.md](/D:/xampp/htdocs/futstats-app/docs/Release_1_0/Source_of_Truth_Map.md).
5. Documentos normativos da área afetada.
6. Documentos de domínio.
7. Especificações técnicas de implementação, UX e operação.
8. Documentos históricos, recortes de fase e materiais de apoio.

## Classificação de Documentos

Cada documento deve ser entendido em uma destas funções:

- **Canônico**: fonte principal do assunto. Em caso de dúvida, prevalece.
- **Complementar**: aprofunda UX, implementação, exemplos ou operação sem substituir a fonte canônica.
- **Histórico**: registra um recorte anterior, uma fase de lançamento, uma decisão passada ou uma fotografia de escopo.
- **Redundante**: repete conteúdo já absorvido em fonte melhor organizada e pode ser removido depois de validação.

## Regra para documentos com origem em MVP

Nem todo documento com `MVP` no nome ou no texto deve ser removido.

Critério obrigatório:

- se ele for a única fonte escrita de certo contrato, fluxo, regra de negócio ou exceção, ele deve ser mantido;
- nesse caso, ele pode ser reclassificado como complementar ou histórico, mas não apagado até que o conteúdo seja absorvido por uma fonte canônica mais rica;
- só pode ser removido quando o conteúdo já estiver migrado e validado em outro lugar.

## Ordem Recomendada de Leitura

Para compreender o projeto de forma holística:

1. [README.md](/D:/xampp/htdocs/futstats-app/docs/README.md)
2. `Documentation_Index.md`
3. [Product/Product_Overview.md](/D:/xampp/htdocs/futstats-app/docs/Product/Product_Overview.md)
4. [Product/Product_Vision.md](/D:/xampp/htdocs/futstats-app/docs/Product/Product_Vision.md)
5. [Product/Product_Principles.md](/D:/xampp/htdocs/futstats-app/docs/Product/Product_Principles.md)
6. [Release_1_0/Source_of_Truth_Map.md](/D:/xampp/htdocs/futstats-app/docs/Release_1_0/Source_of_Truth_Map.md)
7. [Domain/README.md](/D:/xampp/htdocs/futstats-app/docs/Domain/README.md)
8. [Architecture/Architecture_Principles.md](/D:/xampp/htdocs/futstats-app/docs/Architecture/Architecture_Principles.md)
9. [Release_1_0/Handoff_Guide.md](/D:/xampp/htdocs/futstats-app/docs/Release_1_0/Handoff_Guide.md)

## Guia das Áreas e Pastas

- [Product/](/D:/xampp/htdocs/futstats-app/docs/Product): visão, princípios, roadmap, personas e recortes estratégicos.
- [Domain/](/D:/xampp/htdocs/futstats-app/docs/Domain): definições lógicas das áreas de negócio.
- [Architecture/](/D:/xampp/htdocs/futstats-app/docs/Architecture): princípios estruturais, eventos e estratégias transversais.
- [Backend/](/D:/xampp/htdocs/futstats-app/docs/Backend): arquitetura de serviços, casos de uso, jobs e filas.
- [Database/](/D:/xampp/htdocs/futstats-app/docs/Database): esquema físico, relações, RLS e convenções.
- [Implementation/Database/](/D:/xampp/htdocs/futstats-app/docs/Implementation/Database): especificações detalhadas de tabelas, colunas, enums, constraints e regras semânticas.
- [Frontend/](/D:/xampp/htdocs/futstats-app/docs/Frontend): telas, arquitetura de interface e elementos reutilizáveis.
- [API/](/D:/xampp/htdocs/futstats-app/docs/API): contratos, endpoints e convenções.
- [UX/](/D:/xampp/htdocs/futstats-app/docs/UX): fluxos, estados e princípios de experiência.
- [AI/](/D:/xampp/htdocs/futstats-app/docs/AI): diretrizes para uso de IA no projeto.
- [ADR/](/D:/xampp/htdocs/futstats-app/docs/ADR): decisões arquiteturais registradas.
- [Implementation/](/D:/xampp/htdocs/futstats-app/docs/Implementation): detalhamento técnico para construção.
- [Release_1_0/](/D:/xampp/htdocs/futstats-app/docs/Release_1_0): handoff, checklists e materiais de transição.
- [Future_Ideas/](/D:/xampp/htdocs/futstats-app/docs/Future_Ideas): ideias futuras já separadas do contrato atual para evitar conflito com a fonte canônica vigente.

## Fluxos de Trabalho Recomendados

### Para agentes de IA

Antes de realizar qualquer alteração estrutural ou gerar código:

1. consultar [AI_Development_Framework.md](/D:/xampp/htdocs/futstats-app/docs/AI/AI_Development_Framework.md);
2. seguir [AI_Development_Guidelines.md](/D:/xampp/htdocs/futstats-app/docs/AI/AI_Development_Guidelines.md);
3. identificar a fonte canônica do assunto em [Source_of_Truth_Map.md](/D:/xampp/htdocs/futstats-app/docs/Release_1_0/Source_of_Truth_Map.md);
4. validar se o conteúdo necessário está em documento canônico, complementar ou histórico;
5. evitar apagar material histórico útil antes de migrar o conteúdo único.

### Para mudança funcional

1. identificar o domínio correspondente;
2. localizar a tabela, API, tela e fluxo técnico associados;
3. confirmar a fonte canônica do assunto;
4. só depois editar ou consolidar documentação.

### Para mudanças de banco

1. começar por [Database/Tables.md](/D:/xampp/htdocs/futstats-app/docs/Database/Tables.md), [Database/Relationships.md](/D:/xampp/htdocs/futstats-app/docs/Database/Relationships.md) e [Database/Entity_Relationships.md](/D:/xampp/htdocs/futstats-app/docs/Database/Entity_Relationships.md) para mapa de alto nível;
2. validar em seguida a `Table_Spec_*` correspondente dentro de [Implementation/Database/](/D:/xampp/htdocs/futstats-app/docs/Implementation/Database);
3. só então ajustar APIs, serviços, telas e projeções derivadas relacionadas.

## Diretrizes de Governança Documental

### Tipos de documentos aceitos

- **Normative**: define regras oficiais que devem ser seguidas pelo código.
- **Reference**: explica negócio, modelo de dados ou estrutura.
- **Guide**: instruções passo a passo.
- **Operational**: rotinas de infraestrutura, operação ou suporte.
- **Historical**: registra recortes passados, materiais de transição ou decisões antigas que ainda precisam ser preservadas.

### Processo para novo documento ou atualização

- **Frontmatter obrigatório**: cada arquivo técnico deve declarar `title`, `status`, `version` e `related_documents`.
- **Idioma canônico**:
  - regras de negócio e explicações conceituais em português;
  - tabelas, APIs, enums, eventos e identificadores técnicos em inglês.

## Checklist de consolidação segura

Antes de remover ou fundir qualquer documento:

- [ ] Existe uma fonte canônica clara para o assunto.
- [ ] O conteúdo único foi migrado integralmente.
- [ ] O documento novo cobre regras, exceções e exemplos relevantes.
- [ ] As referências cruzadas foram atualizadas.
- [ ] Foi feita revisão comparando o conteúdo antigo e o novo.
- [ ] Nenhum fluxo ou contrato foi quebrado no meio do caminho.
