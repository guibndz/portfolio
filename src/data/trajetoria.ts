type Repo = { nome: string; url: string };

export type Marco = {
  periodo: string;
  /** Hash do primeiro commit (no SR-UTFPR, o primeiro da minha branch). */
  commit: string;
  repos: Repo[];
  texto: string;
};

const gh = (nome: string): Repo => ({ nome, url: `https://github.com/guibndz/${nome}` });

/** Do mais recente ao primeiro, como no git log. Datas conferidas no histórico de cada repositório. */
export const trajetoria: Marco[] = [
  {
    periodo: 'set/2026',
    commit: 'd4302c5',
    repos: [{ nome: 'SR-UTFPR', url: 'https://github.com/si-utfpr-gp/space-res/pull/45' }],
    texto: 'Primeira contribuição em projeto de equipe, com CI e testes.',
  },
  {
    periodo: 'abr–mai/2026',
    commit: '704c2a3',
    repos: [gh('instaclone-api')],
    texto: 'Laravel com Sanctum, Docker e Swagger.',
  },
  {
    periodo: 'mar–jun/2026',
    commit: 'ae677a4',
    repos: [gh('spend-wise')],
    texto: 'Front-end com Sass, Bootstrap e consumo de APIs.',
  },
  {
    periodo: 'mar–abr/2026',
    commit: 'a6a547a',
    repos: [gh('taskflow-api'), gh('bookshelf')],
    texto: 'Primeiros projetos com Laravel.',
  },
  {
    periodo: 'mar/2026',
    commit: '78114f2',
    repos: [gh('userflow-api')],
    texto: 'Primeira API REST, em PHP puro.',
  },
  {
    periodo: 'mar/2026',
    commit: '6a0c0fe',
    repos: [gh('bndz-tasks-api'), gh('bndz-rpg')],
    texto: 'POO no terminal. RPG por turnos com herança e efeitos que duram vários turnos.',
  },
  {
    periodo: 'mar/2026',
    commit: 'ce81bbd',
    repos: [gh('projeto_tasks_arr')],
    texto: 'CRUD procedural com arrays, busca e estatísticas.',
  },
  {
    periodo: 'set/2025',
    commit: '96ffbdf',
    repos: [gh('landing-page')],
    texto: 'HTML e CSS, trabalho do curso. Onde começou.',
  },
];
