import type { APIRoute } from 'astro';
import { pngToIco, renderIconPng } from '../lib/og';

// Para navegadores e leitores que pedem /favicon.ico direto.
export const GET: APIRoute = async () => {
  const ico = pngToIco(await renderIconPng(32), 32);
  return new Response(new Uint8Array(ico), { headers: { 'Content-Type': 'image/x-icon' } });
};
