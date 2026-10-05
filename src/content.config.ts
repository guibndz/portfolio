import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { z } from 'astro/zod';

const projetos = defineCollection({
  // Arquivos que começam com "_" (como _modelo.md) ficam fora da coleção.
  loader: glob({ base: './src/content/projetos', pattern: '[^_]*.md' }),
  schema: z
    .object({
      titulo: z.string(),
      subtitulo: z.string(),
      tipo: z.enum(['Projeto final', 'Em equipe', 'Estudo', 'Disciplina']),
      /** Onde o projeto foi feito: curso, programa, equipe. */
      contexto: z.string().optional(),
      /** O problema em uma frase. Aparece no card. */
      problema: z.string().max(200),
      /** Uma ou duas frases extras para o card. */
      detalhe: z.string().optional(),
      /** Obrigatório em projeto de equipe: o que foi meu. */
      minhaParte: z.array(z.string()).optional(),
      /** Decisão em destaque no card. */
      decisao: z.string().optional(),
      stack: z.array(z.string()).min(1),
      periodo: z.string(),
      repo: z.url(),
      pr: z.object({ numero: z.number().int().positive(), url: z.url() }).optional(),
      deploy: z.url().optional(),
      /** Posição na lista de projetos. */
      ordem: z.number().int(),
      /** Tem página de case em /projetos/[slug]. */
      temCase: z.boolean().default(false),
      /** Diagrama SVG do topo do case (ver src/components/diagrams). */
      diagrama: z.enum(['instaclone-feed']).optional(),
      /** Rascunho: não aparece no site. */
      draft: z.boolean().default(false),
    })
    .refine((projeto) => projeto.tipo !== 'Em equipe' || (projeto.minhaParte?.length ?? 0) > 0, {
      message: 'Projeto em equipe precisa de "minhaParte": o card deixa explícito o que foi meu.',
      path: ['minhaParte'],
    })
    .refine((projeto) => !projeto.temCase || projeto.diagrama !== undefined, {
      message: 'Todo case precisa de um diagrama: defina "diagrama".',
      path: ['diagrama'],
    }),
});

export const collections = { projetos };
