---
title: Stitch Conversion Guide
status: Draft
version: 1.0.0
owner: Product Architecture
last_update: 2026-07-07
related_documents:
  - Naming_Conventions.md
  - Design_System_Tokens.md
  - Component_Guidelines.md
  - ../ADR/ADR_005_UI_Language_Modes.md
---

# Stitch Conversion Guide

## Objetivo

Definir as regras de conversão de layouts exportados do Stitch (HTML + Tailwind) para React Native com NativeWind, garantindo que toda tela convertida respeite as convenções, o sistema de temas e a arquitetura de linguagem do FUTSTATS.

Este documento é a fonte de verdade das regras de conversão. O agente `stitch-to-rn` deve segui-lo; quando encontrar estrutura sem regra definida, deve reportar a lacuna (ver "Protocolo de lacunas") para que a regra seja criada aqui.

## Premissas

- React Native + TypeScript + NativeWind (Tailwind via `className`).
- O HTML do Stitch é um mock estático: a conversão entrega o scaffold visual, não a tela final.
- Identificadores em inglês; textos de UI via i18n (nunca hardcoded).

## 1. Mapeamento de tags

| HTML | React Native | Observação |
|---|---|---|
| `div`, `section`, `header`, `footer`, `nav`, `main`, `article`, `form` | `View` | |
| `p`, `span`, `h1`–`h6`, `label`, `strong`, `em`, `small` | `Text` | Hierarquia de heading vira classe de tamanho/peso, não tag |
| `img` | `Image` (`expo-image`) | Exige dimensões explícitas ou classes `w-*`/`h-*`/`aspect-*` |
| `button`, `a` (ação) | `Pressable` | Conteúdo textual interno sempre em `Text` |
| `a` (navegação) | `Pressable` + navegação | Marcar destino com `// STITCH-TODO: wire navigation` |
| `input[type=text|email|number]` | `TextInput` | `placeholder` via i18n |
| `input[type=checkbox]`, `input[type=radio]`, `select` | componente do design system | Se não existir, reportar lacuna |
| `textarea` | `TextInput` com `multiline` | |
| `ul`/`ol` + `li` | `FlatList` (lista de dados) ou `View` (estática curta) | Lista que renderiza dados dinâmicos é sempre `FlatList` |
| `svg` inline | `react-native-svg` | Ícones: preferir set de ícones do projeto; reportar ícone novo |
| `video` | `expo-av` `Video` | |
| `table` | — | Sem equivalente direto: reportar lacuna com proposta de layout |
| `iframe`, `script`, `canvas` | — | Reportar lacuna |

## 2. Regras de classes Tailwind

### Mantidas como estão

`flex`, `flex-1`, `flex-row`, `flex-col`, `items-*`, `justify-*`, `gap-*`, `p-*`, `m-*`, `w-*`, `h-*`, `min-*`, `max-*`, `rounded-*`, `border*`, `text-{size|weight|align}`, `bg-*` (via token), `opacity-*`, `overflow-hidden`, `absolute`, `relative`, `inset-*`, `z-*`, `aspect-*`, `self-*`, `flex-wrap`.

### Convertidas

| Origem (web) | Destino (RN) | Regra |
|---|---|---|
| `grid`, `grid-cols-*` | `flex flex-row flex-wrap` + largura por item (`w-1/2`, `w-1/3`) | Grid CSS não existe no RN |
| `space-x-*`, `space-y-*` | `gap-*` | |
| `hover:*`, `focus:*` | `active:*` ou estado de press no `Pressable` | Não existe hover em touch |
| `fixed` | `absolute` (dentro da tela) | Elemento fixo global vira parte do layout da tela |
| `sticky` | — | Reportar lacuna (avaliar header animado) |
| `overflow-auto`, `overflow-scroll`, `overflow-y-*` | envolver em `ScrollView` | Rolagem é componente, não estilo |
| `truncate`, `line-clamp-*` | `numberOfLines` no `Text` | |
| `transition-*`, `animate-*`, `duration-*` | remover + `// STITCH-TODO: animation (Reanimated)` | Animação é etapa posterior |
| `cursor-*`, `select-*`, `pointer-events-*` | remover | Sem equivalente touch |
| `divide-*` | borda nos itens ou `ItemSeparatorComponent` | |
| `vh`/`vw`/`%` de viewport | `flex-1` ou `useWindowDimensions()` | |
| `sm:`/`md:`/`lg:` (breakpoints) | manter apenas o layout mobile | O app é mobile-first; variantes desktop são descartadas |

## 3. Divergências semânticas obrigatórias

1. **`flexDirection` padrão**: na web é `row`, no RN é `column`. Todo container do Stitch que dependia do padrão web deve receber `flex-row` explícito.
2. **Texto sempre dentro de `Text`**: string solta em `View` crasha no RN.
3. **Sem herança de estilo**: `text-*`/cor definidos num container web não descem para o texto; aplicar as classes de texto diretamente em cada `Text`.
4. **Imagens exigem dimensão**: `Image` sem `w-*`/`h-*`/`aspect-*` não renderiza.
5. **Unidades**: manter a escala do Tailwind (`p-4`, não `padding: 16px`). Valores px arbitrários viram classe arbitrária `p-[Npx]` apenas se não houver equivalente na escala.

## 4. Tokens de tema (obrigatório)

O FUTSTATS tem temas dinâmicos por time (`primary_color`, `secondary_color`, `accent_color`). Cores fixas do Stitch devem ser mapeadas para tokens semânticos do design system:

| Stitch (exemplo) | Token |
|---|---|
| `bg-blue-500`, cor de destaque principal | `bg-primary` |
| `bg-blue-100`, fundos suaves da cor principal | `bg-primary-muted` |
| cor secundária de marca | `bg-secondary` |
| `text-white` sobre cor primária | `text-on-primary` |
| `bg-white`/`bg-gray-50` (superfícies) | `bg-surface` |
| `text-gray-900` (texto principal) | `text-foreground` |
| `text-gray-500` (texto secundário) | `text-muted` |
| `border-gray-200` | `border-border` |
| verde/vermelho de estado (vitória/derrota, sucesso/erro) | `bg-success` / `bg-danger` |

Regras:

- Nunca deixar hex ou cor de paleta Tailwind hardcoded em tela de domínio.
- Cores que não se encaixam nos tokens existentes: reportar lacuna propondo token novo.
- Suporte a modo claro/escuro vem do token, nunca de classe `dark:` espalhada na tela.

## 5. Extração de textos (i18n)

Todo texto visível vira chave de tradução, respeitando os modos de linguagem (Technical, Varzea, Resenha):

- Padrão de chave: `<domain>.<screen_or_component>.<element>` em inglês, snake_case: `match.quick_creation.add_goal`, `team.profile.share_result`.
- O texto original em português do mock vai para o arquivo de tradução, nunca para o JSX.
- Placeholders, labels de botão e mensagens de estado também são extraídos.
- Valores canônicos (enums, status) nunca são traduzidos no código; a tradução é resolvida pela camada de linguagem.

## 6. Nomenclatura e estrutura de saída

Aplicar `Frontend/Naming_Conventions.md`:

- Tela: `PascalCase` + sufixo `Screen`, arquivo `QuickMatchScreen.tsx` em `features/<domain>/screens/`.
- Blocos repetidos ou reutilizáveis extraídos como componentes `PascalCase` em `features/<domain>/components/` (ou `components/` global se genérico).
- Props tipadas com `type`/`interface` em `PascalCase`; dados dinâmicos identificados no mock viram props, não constantes.
- Adicionar `accessibilityRole` básico em `Pressable`, `Image` com `alt` relevante e headings.

## 7. Fora do escopo da conversão

O agente não implementa (mas deixa marcadores `// STITCH-TODO:` onde couber):

- Estados de tela (loading, empty, error, offline) definidos nas specs de tela;
- Wiring de dados (hooks, Supabase, React Query);
- Navegação entre telas;
- Animações;
- Validação de formulários.

## 8. Protocolo de lacunas

Quando o agente encontrar estrutura, classe, componente ou padrão **sem regra neste guia**:

1. **Não inventar conversão silenciosamente.** Aplicar a aproximação mais segura e conservadora possível.
2. Marcar o ponto exato no código com `// STITCH-GAP: <descrição do que não tem regra>`.
3. Listar no final da conversão uma seção **"Lacunas de conversão"** com, para cada lacuna:
   - o trecho HTML original;
   - onde ficou no código gerado;
   - a aproximação aplicada;
   - uma **proposta de regra** para ser avaliada e adicionada a este guia.
4. Regras aprovadas devem ser incorporadas a este documento (novas linhas nas tabelas ou novas seções), mantendo-o como fonte única de verdade.
