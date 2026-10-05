# Portfólio · Guilherme Bondezan

Meu portfólio: uma página com sobre, projetos, habilidades, trajetória e contato,
mais uma página de case para cada projeto que tem decisões para mostrar.

Cada case segue a mesma ordem: contexto, problema, decisões (cada uma com a
alternativa que descartei), limite, estado atual e o que eu faria diferente.

## Stack

- [Astro 7](https://astro.build), com saída 100% estática e TypeScript estrito.
- Cases em Markdown, numa content collection com schema validado (Zod).
- CSS próprio com custom properties e cascade layers. Sem framework de CSS.
- Nenhum JavaScript no navegador.
- Fontes self-hosted via Fontsource: Newsreader, Schibsted Grotesk e JetBrains Mono.
- Imagens de compartilhamento e ícones gerados no build com
  [Satori](https://github.com/vercel/satori) e [resvg](https://github.com/thx/resvg-js).
- Sitemap com `@astrojs/sitemap`. Deploy na Vercel.

## Como rodar

Precisa de Node 22.12 ou mais novo.

```sh
npm install
npm run dev      # servidor local em http://localhost:4321
npm run build    # astro check + build estático em dist/
npm run preview  # serve o dist/ localmente
```

O `build` roda o `astro check` antes. Erro de tipo ou de schema derruba o build.

## Estrutura

```text
src/
  content/projetos/   um .md por projeto; _modelo.md é o modelo de case
  content.config.ts   schema da coleção de projetos
  data/               textos fixos: links, habilidades, trajetória
  sections/           seções da página principal
  components/         componentes e diagramas SVG (components/diagrams)
  layouts/            BaseLayout (head, SEO) e CaseLayout (página de case)
  lib/                validação dos cases, JSON destacado, geração de imagens
  pages/              rotas, incluindo og/, favicon, robots.txt
  styles/             tokens, reset, estilos globais e do texto dos cases
```

## Como adicionar um projeto

1. Copie `src/content/projetos/_modelo.md` para `src/content/projetos/<slug>.md`.
   O nome do arquivo vira a URL do case: `/projetos/<slug>`.
2. Preencha o frontmatter. O schema em `src/content.config.ts` diz o que é obrigatório:
   - `tipo: Em equipe` exige `minhaParte`;
   - `problema` tem no máximo 200 caracteres, porque aparece no card e na imagem de compartilhamento;
   - `ordem` define a posição na lista.
3. Sem case, deixe `temCase: false`. O projeto aparece só como card.
4. Enquanto estiver escrevendo, deixe `draft: true`. Rascunhos não entram no site.

## Como adicionar um case

Com `temCase: true`, o projeto ganha a página `/projetos/<slug>`. O build confere a estrutura:

- os títulos `##` precisam ser exatamente, nesta ordem: `Contexto`, `Problema`,
  `Decisões`, `Limite`, `Estado atual` e `O que eu faria diferente`;
- cada decisão é um `###` dentro de `Decisões` e precisa ter um bloco
  `> **Alternativa descartada:** ...`;
- linhas com `TODO(Guilherme):` aparecem como aviso no terminal durante o build.

Todo case precisa de um diagrama SVG:

1. Crie o componente em `src/components/diagrams/`, com `role="img"`, `<title>` e `<desc>`.
   Use classes e as variáveis de `src/styles/tokens.css`, nunca cores fixas.
   Inclua um bloco `@media (forced-colors: active)`, como nos diagramas que já existem.
2. Registre o componente e a legenda em `src/components/diagrams/index.ts`.
3. Acrescente a mesma chave no `z.enum` de `diagrama` em `src/content.config.ts`.
4. Use a chave no campo `diagrama` do frontmatter.

A imagem de compartilhamento do case (`/og/projetos/<slug>.png`) sai do título,
do tipo e do `problema`. Não precisa fazer nada.

## SEO e imagens

- Título, descrição, URL canônica e Open Graph saem do `BaseLayout`. Cada página passa os seus.
- As imagens de compartilhamento (1200×630) e os ícones (`favicon.svg`,
  `favicon.ico`, `apple-touch-icon.png`) são gerados no build, a partir de
  `src/lib/og.ts`. Para mudar o visual, edite esse arquivo.
- O domínio fica em `site`, no `astro.config.mjs`. Ele alimenta a URL canônica,
  as imagens de compartilhamento, o sitemap e o `robots.txt`.
- As URLs não têm barra no fim (`/projetos/instaclone-api`). O build gera um `.html`
  por página, e o `vercel.json` (`cleanUrls`) faz a Vercel servir sem a extensão.

## Deploy

O site está em <https://guilhermebondezan.vercel.app>, no projeto `guilhermebondezan` da Vercel.
As configurações de build ficam em `vercel.json`.

Para publicar uma nova versão:

```sh
npx vercel deploy --prod
```

Com o repositório conectado à Vercel (`npx vercel git connect`), todo push na `main` publica sozinho.
