import type { APIRoute, GetStaticPaths } from 'astro';
import { getCollection } from 'astro:content';
import { renderOgImage, type Run } from '../../lib/og';
import { site } from '../../data/site';

// Uma imagem de compartilhamento por página: /og/inicio.png para a home e o
// 404, /og/projetos/<slug>.png para cada case.
const host = new URL(import.meta.env.SITE).host;

type Props = {
  label: string;
  title: string;
  text: Run[];
  footer: [string, string];
};

type Path = { params: { rota: string }; props: Props };

export const getStaticPaths = (async () => {
  const cases = await getCollection('projetos', ({ data }) => data.temCase && !data.draft);

  const inicio: Path = {
    params: { rota: 'inicio' },
    props: {
      label: `${site.availability[0]} · ${site.availability[1]}`,
      title: site.name,
      text: [
        { text: 'Backend em formação. Cada projeto mostra o problema, a decisão e onde ela ' },
        { text: 'deixa de funcionar', em: true },
        { text: '.' },
      ],
      footer: [host, site.links.github.replace('https://', '')],
    },
  };

  return [
    inicio,
    ...cases.map(({ id, data }): Path => ({
      params: { rota: `projetos/${id}` },
      props: {
        label: `Case · ${data.tipo}`,
        title: data.titulo,
        text: [{ text: data.problema }],
        footer: [site.name, host],
      },
    })),
  ];
}) satisfies GetStaticPaths;

export const GET: APIRoute<Props> = async ({ props }) => {
  const png = await renderOgImage(props);
  return new Response(new Uint8Array(png), { headers: { 'Content-Type': 'image/png' } });
};
