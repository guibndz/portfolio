---
titulo: SR-UTFPR
subtitulo: Reserva de espaços da UTFPR Guarapuava
tipo: Em equipe
contexto: Sistemas para Internet · UTFPR Guarapuava
problema: Reservar espaços do campus. O sistema é da equipe do curso; a área administrativa foi a minha parte.
minhaParte:
  - Flag super_admin nos usuários
  - Área /admin restrita a super admins
  - Link na sidebar visível só para super admins
  - Rake task para conceder o acesso
  - Testes para cada uma dessas partes
decisao: Usuário comum que acessa /admin recebe 404, não 403, para a área não revelar que existe. Os testes cobrem os três casos. Sem login, vai para o login. Usuário comum recebe 404. Super admin acessa.
stack:
  - Rails 8.1
  - Minitest
  - FactoryBot
  - "CI: testes, RuboCop, erb_lint e Brakeman"
periodo: set/2026
repo: https://github.com/si-utfpr-gp/space-res
pr:
  numero: 45
  url: https://github.com/si-utfpr-gp/space-res/pull/45
ordem: 2
---
