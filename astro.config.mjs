// @ts-check
import { defineConfig, fontProviders } from 'astro/config';

// Fontes self-hosted a partir dos pacotes @fontsource-variable instalados.
// Só o subset latin (cobre á, ã, ç, õ) e só o eixo de peso: o eixo de
// tamanho óptico do Newsreader dobraria o arquivo.
/** @param {string} pkg @param {string} file */
const fontsource = (pkg, file) => `./node_modules/@fontsource-variable/${pkg}/files/${file}`;

export default defineConfig({
  // TODO(Guilherme): confirmar o domínio final na etapa 6 (deploy).
  site: 'https://guilhermebondezan.vercel.app',
  fonts: [
    {
      name: 'Newsreader',
      cssVariable: '--font-newsreader',
      provider: fontProviders.local(),
      fallbacks: ['Georgia', 'serif'],
      options: {
        variants: [
          {
            weight: '200 800',
            style: 'normal',
            src: [fontsource('newsreader', 'newsreader-latin-wght-normal.woff2')],
          },
          {
            weight: '200 800',
            style: 'italic',
            src: [fontsource('newsreader', 'newsreader-latin-wght-italic.woff2')],
          },
        ],
      },
    },
    {
      name: 'Schibsted Grotesk',
      cssVariable: '--font-schibsted',
      provider: fontProviders.local(),
      fallbacks: ['Arial', 'sans-serif'],
      options: {
        variants: [
          {
            weight: '400 900',
            style: 'normal',
            src: [fontsource('schibsted-grotesk', 'schibsted-grotesk-latin-wght-normal.woff2')],
          },
          {
            weight: '400 900',
            style: 'italic',
            src: [fontsource('schibsted-grotesk', 'schibsted-grotesk-latin-wght-italic.woff2')],
          },
        ],
      },
    },
    {
      name: 'JetBrains Mono',
      cssVariable: '--font-jetbrains',
      provider: fontProviders.local(),
      fallbacks: ['ui-monospace', 'monospace'],
      options: {
        variants: [
          {
            weight: '100 800',
            style: 'normal',
            src: [fontsource('jetbrains-mono', 'jetbrains-mono-latin-wght-normal.woff2')],
          },
        ],
      },
    },
  ],
});
