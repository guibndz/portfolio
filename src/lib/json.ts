export type Json = string | number | boolean | null | Json[] | { [key: string]: Json };

type Line = { depth: number; html: string };

const escapeHtml = (text: string) =>
  text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

const span = (kind: string, text: string) => `<span class="json-${kind}">${escapeHtml(text)}</span>`;

function scalar(value: string | number | boolean | null): string {
  if (typeof value === 'string') return span('string', JSON.stringify(value));
  return span('literal', String(value));
}

function collect(value: Json, depth: number, prefix: string, suffix: string, lines: Line[]): void {
  if (value !== null && typeof value === 'object') {
    const entries: [string | null, Json][] = Array.isArray(value)
      ? value.map((item) => [null, item])
      : Object.entries(value);
    const [open, close] = Array.isArray(value) ? ['[', ']'] : ['{', '}'];

    if (entries.length === 0) {
      lines.push({ depth, html: prefix + span('punct', open + close) + suffix });
      return;
    }

    lines.push({ depth, html: prefix + span('punct', open) });
    entries.forEach(([key, item], index) => {
      const keyHtml = key === null ? '' : `${span('key', JSON.stringify(key))}${span('punct', ':')} `;
      const comma = index < entries.length - 1 ? span('punct', ',') : '';
      collect(item, depth + 1, keyHtml, comma, lines);
    });
    lines.push({ depth, html: span('punct', close) + suffix });
    return;
  }

  lines.push({ depth, html: prefix + scalar(value) + suffix });
}

/**
 * Serializa um valor como JSON colorido, sem JavaScript no navegador.
 * Cada linha vira um <span class="json-line"> com a profundidade em
 * --depth: o CSS faz o recuo e, se a linha quebrar no mobile, a
 * continuação fica alinhada abaixo do valor em vez de voltar à margem.
 */
export function highlightJson(value: Json): string {
  const lines: Line[] = [];
  collect(value, 0, '', '', lines);
  return lines.map((line) => `<span class="json-line" style="--depth: ${line.depth}">${line.html}</span>`).join('');
}
