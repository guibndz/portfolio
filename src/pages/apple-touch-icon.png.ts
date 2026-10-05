import type { APIRoute } from 'astro';
import { renderIconPng } from '../lib/og';

// Sem cantos arredondados: o iOS aplica a própria máscara.
export const GET: APIRoute = async () => {
  const png = await renderIconPng(180, { rounded: false });
  return new Response(new Uint8Array(png), { headers: { 'Content-Type': 'image/png' } });
};
