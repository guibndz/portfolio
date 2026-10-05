import { readFile } from 'node:fs/promises';
import { createRequire } from 'node:module';
import { Resvg } from '@resvg/resvg-js';
import satori from 'satori';

// Imagens geradas no build: OG (1200×630) e ícones. O Satori não lê woff2,
// então as fontes vêm dos pacotes @fontsource estáticos, em woff.
// Cores repetidas de tokens.css: o Satori não lê custom properties.
const color = {
  bg: '#0c0b10',
  line: '#2a2633',
  text: '#ece9f2',
  muted: '#a29db0',
  faint: '#8a8599',
  accent: '#7c3aed',
  accentText: '#a98bfa',
  onAccent: '#ffffff',
};

const require = createRequire(import.meta.url);
const fontFile = (pkg: string, file: string) => readFile(require.resolve(`${pkg}/files/${file}`));

const fonts = Promise.all([
  fontFile('@fontsource/newsreader', 'newsreader-latin-400-normal.woff'),
  fontFile('@fontsource/newsreader', 'newsreader-latin-400-italic.woff'),
  fontFile('@fontsource/jetbrains-mono', 'jetbrains-mono-latin-400-normal.woff'),
]).then(([serif, serifItalic, mono]) => [
  { name: 'Newsreader', data: serif, weight: 400 as const, style: 'normal' as const },
  { name: 'Newsreader', data: serifItalic, weight: 400 as const, style: 'italic' as const },
  { name: 'JetBrains Mono', data: mono, weight: 400 as const, style: 'normal' as const },
]);

type Style = Record<string, string | number>;
type Node = { type: string; props: { style?: Style; children?: Child | Child[] } };
type Child = Node | string;

const h = (type: string, style: Style, children?: Child | Child[]): Node => ({
  type,
  props: { style, children },
});

/** Trecho de texto; `em: true` vira itálico, como nos títulos do site. */
export type Run = { text: string; em?: boolean };

// O Satori não quebra linha entre spans de estilos diferentes. Cada palavra
// vira um item de um flex com wrap; a pontuação colada fica na mesma palavra.
function flow(runs: Run[], emStyle: Style): Node[] {
  const words: Node[][] = [[]];
  for (const run of runs) {
    for (const part of run.text.split(/(\s+)/)) {
      if (!part) continue;
      if (/^\s+$/.test(part)) {
        words.push([]);
        continue;
      }
      words.at(-1)!.push(h('span', run.em ? emStyle : {}, part));
    }
  }
  return words
    .filter((word) => word.length > 0)
    .map((word) => h('span', { display: 'flex', marginRight: '0.26em' }, word));
}

async function toPng(svg: string, width: number): Promise<Buffer> {
  return new Resvg(svg, { fitTo: { mode: 'width', value: width } }).render().asPng();
}

interface OgImage {
  /** Rótulo em mono no topo, como os rótulos de seção. */
  label: string;
  title: string;
  text: Run[];
  /** Rodapé: esquerda e direita. */
  footer: [string, string];
}

export async function renderOgImage({ label, title, text, footer }: OgImage): Promise<Buffer> {
  const mono: Style = {
    fontFamily: 'JetBrains Mono',
    fontSize: 22,
    letterSpacing: '0.08em',
    textTransform: 'uppercase',
    color: color.faint,
  };

  const tree = h(
    'div',
    {
      display: 'flex',
      flexDirection: 'column',
      width: '100%',
      height: '100%',
      padding: '72px 80px 64px',
      background: color.bg,
      fontFamily: 'Newsreader',
      color: color.text,
    },
    [
      h('div', { display: 'flex', alignItems: 'center', gap: 18, ...mono }, [
        h('span', {
          width: 12,
          height: 12,
          borderRadius: 6,
          background: color.accentText,
          boxShadow: `0 0 0 6px ${color.accent}40`,
        }),
        label,
      ]),
      h('div', { display: 'flex', flexDirection: 'column', flexGrow: 1, justifyContent: 'center', gap: 28 }, [
        h('div', { fontSize: 104, lineHeight: 1.02, letterSpacing: '-0.022em' }, title),
        h(
          'div',
          { display: 'flex', flexWrap: 'wrap', maxWidth: 940, fontSize: 42, lineHeight: 1.3, color: color.muted },
          flow(text, { fontStyle: 'italic', color: color.text }),
        ),
      ]),
      h(
        'div',
        {
          display: 'flex',
          justifyContent: 'space-between',
          paddingTop: 28,
          borderTop: `1px solid ${color.line}`,
          ...mono,
          fontSize: 20,
          letterSpacing: '0.04em',
          textTransform: 'none',
        },
        footer.map((part) => h('span', {}, part)),
      ),
    ],
  );

  const svg = await satori(tree, { width: 1200, height: 630, fonts: await fonts });
  return toPng(svg, 1200);
}

/**
 * Ícone do site: "g" em itálico sobre o roxo. `rounded: false` para o
 * apple-touch-icon, que o iOS recorta sozinho.
 */
export async function renderIconSvg({ rounded = true } = {}): Promise<string> {
  const tree = h(
    'div',
    {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      width: '100%',
      height: '100%',
      borderRadius: rounded ? 14 : 0,
      background: color.accent,
    },
    h(
      'span',
      { fontFamily: 'Newsreader', fontStyle: 'italic', fontSize: 64, lineHeight: 1, color: color.onAccent, marginTop: -14 },
      'g',
    ),
  );
  return satori(tree, { width: 64, height: 64, fonts: await fonts });
}

export async function renderIconPng(size: number, options?: { rounded?: boolean }): Promise<Buffer> {
  return toPng(await renderIconSvg(options), size);
}

/** favicon.ico com um único PNG dentro (formato aceito desde o Windows Vista). */
export function pngToIco(png: Buffer, size: number): Buffer {
  const header = Buffer.alloc(22);
  header.writeUInt16LE(0, 0); // reservado
  header.writeUInt16LE(1, 2); // tipo: ícone
  header.writeUInt16LE(1, 4); // uma imagem
  header.writeUInt8(size, 6);
  header.writeUInt8(size, 7);
  header.writeUInt8(0, 8); // sem paleta
  header.writeUInt8(0, 9);
  header.writeUInt16LE(1, 10); // planos
  header.writeUInt16LE(32, 12); // bits por pixel
  header.writeUInt32LE(png.length, 14);
  header.writeUInt32LE(header.length, 18); // a imagem começa logo após o cabeçalho
  return Buffer.concat([header, png]);
}
