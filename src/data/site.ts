export const site = {
  name: 'Guilherme Bondezan',
  title: 'Guilherme Bondezan · Backend em formação',
  description:
    'Estudante de Sistemas para Internet na UTFPR Guarapuava, buscando estágio em backend ou full stack. Cada projeto mostra o problema, a decisão e onde ela deixa de funcionar.',
  availability: ['Disponível para estágio', 'backend / full stack', 'remoto ou Guarapuava e região'],
  links: {
    email: 'gui.gastaldo@gmail.com',
    linkedin: 'https://www.linkedin.com/in/guilhermebondezan',
    github: 'https://github.com/guibndz',
    source: 'https://github.com/guibndz/portfolio',
  },
} as const;

/** Seções da página principal, na ordem em que aparecem. */
export const sections = [
  { id: 'sobre', label: 'Sobre' },
  { id: 'projetos', label: 'Projetos' },
  { id: 'habilidades', label: 'Habilidades' },
  { id: 'trajetoria', label: 'Trajetória' },
  { id: 'contato', label: 'Contato' },
] as const;

export type SectionId = (typeof sections)[number]['id'];

/** Número do rótulo da seção: "01", "02"... */
export function sectionIndex(id: SectionId): string {
  const position = sections.findIndex((section) => section.id === id) + 1;
  return String(position).padStart(2, '0');
}
