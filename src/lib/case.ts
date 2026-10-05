import type { MarkdownHeading } from 'astro';

/** Seções de todo case, nesta ordem. */
export const CASE_SECTIONS = [
  'Contexto',
  'Problema',
  'Decisões',
  'Limite',
  'Estado atual',
  'O que eu faria diferente',
] as const;

const DISCARDED_MARKER = '> **Alternativa descartada:**';

/**
 * Falha o build se o case fugir da estrutura fixa: os seis H2 na ordem
 * certa e, em "Decisões", cada H3 com a sua alternativa descartada.
 * Avisa, sem falhar, quando ainda há TODOs para o Guilherme.
 */
export function assertCaseStructure(id: string, headings: MarkdownHeading[], body = ''): void {
  const found = headings.filter((heading) => heading.depth === 2).map((heading) => heading.text);
  const expected: string[] = [...CASE_SECTIONS];

  if (found.join('|') !== expected.join('|')) {
    throw new Error(
      `[case ${id}] As seções precisam ser, nesta ordem: ${expected.join(' → ')}.\n` +
        `Encontrei: ${found.join(' → ') || 'nenhuma'}.`,
    );
  }

  const decisions = body.split(/^## /m).find((section) => section.startsWith('Decisões'));
  const blocks = (decisions ?? '').split(/^### /m).slice(1);

  if (blocks.length === 0) {
    throw new Error(`[case ${id}] "Decisões" precisa de pelo menos uma decisão em H3 (### ...).`);
  }

  for (const block of blocks) {
    if (!block.includes(DISCARDED_MARKER)) {
      const title = block.split('\n')[0].trim();
      throw new Error(`[case ${id}] A decisão "${title}" precisa de uma linha "${DISCARDED_MARKER} ...".`);
    }
  }

  const todos = body.match(/TODO\(Guilherme\):[^\n]*/g) ?? [];
  for (const todo of todos) {
    console.warn(`[case ${id}] ${todo.replace(/\s*-->\s*$/, '')}`);
  }
}
