import InstacloneFeed from './InstacloneFeed.astro';

/** Diagramas que um case pode usar no campo "diagrama". */
export const diagramas = {
  'instaclone-feed': {
    component: InstacloneFeed,
    legenda: 'Como uma página do feed é montada: três consultas, fora a autenticação.',
  },
} as const;
