---
title: Table: referees
status: Draft
version: 0.9.0
owner: Product Architecture
last_update: 2026-07-06
---

# Table: referees

## Objetivo

Árbitros cadastrados ou verificados.

## Convenção

Nome técnico em inglês e snake_case.

## Regras

1. Deve possuir chave primária estável.
2. Deve preservar integridade histórica quando fizer parte de partidas.
3. Deve possuir timestamps quando aplicável.
4. Deve evitar armazenar textos de UI como fonte da verdade.
5. Deve documentar relações e índices antes da implementação.

## Campos sugeridos

A definição final dos campos deve ser validada no documento `Database_Architecture.md` e nas migrations.

## Relacionamentos

Relacionamentos devem preservar o princípio de uso progressivo: dados avançados podem ser nulos quando o usuário estiver em modo casual.
