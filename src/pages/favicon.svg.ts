import type { APIRoute } from 'astro';
import { renderIconSvg } from '../lib/og';

export const GET: APIRoute = async () =>
  new Response(await renderIconSvg(), { headers: { 'Content-Type': 'image/svg+xml' } });
