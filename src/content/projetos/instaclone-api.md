---
titulo: InstaClone API
subtitulo: Backend de rede social
tipo: Projeto final
contexto: Code Academy · Instituto 3C
problema: Servir um feed paginado dos perfis seguidos sem uma consulta extra por post e sem curtidas duplicadas.
detalhe: Autenticação por token, perfil, seguir, posts com imagem, feed, curtidas, comentários e notificações.
stack:
  - Laravel 13
  - PHP 8.3+
  - MySQL
  - Sanctum
  - OpenAPI · L5 Swagger
  - Docker Compose
  - FrankenPHP
periodo: abr–mai/2026
repo: https://github.com/guibndz/instaclone-api
ordem: 1
temCase: true
diagrama: instaclone-feed
---

<!--
  Os links de código apontam para o commit e954c74 (13/05/2026), para as linhas não mudarem
  de lugar se o repositório for alterado. Ao atualizar o case, troque o hash nas URLs do fim.
-->

## Contexto

O InstaClone API foi o projeto final do Code Academy, do Instituto 3C, entre abril e maio de 2026. É o backend de uma rede social de fotos: cadastro e login, perfil, seguir e deixar de seguir, posts com imagem, feed, curtidas, comentários e notificações.

Usei Laravel 13 com PHP 8.3+, MySQL e Sanctum para autenticação por token bearer. A documentação sai em OpenAPI 3, gerada pelo L5 Swagger. O ambiente sobe com Docker Compose em dois serviços: `app`, que roda o Laravel no FrankenPHP, e `mysql` ([`compose.yaml`][compose]).

## Problema

O feed é onde as partes difíceis se encontram. Ele junta posts de vários autores, pagina enquanto posts novos chegam e mostra, em cada post, o autor e as contagens de curtidas e comentários.

Feito do jeito mais direto, ele falha de três formas:

- a paginação por offset repete posts quando alguém publica entre uma página e outra;
- buscar o autor e as contagens post a post faz consultas extras para cada item;
- curtir ou seguir duas vezes grava duas linhas, e as contagens ficam erradas.

O resto da API precisa de duas garantias: só o autor mexe no próprio conteúdo, e ninguém é notificado da própria ação.

## Decisões

<!-- TODO(Guilherme): confira se as alternativas descartadas são as que você de fato considerou. Elas foram escritas a partir do código e do histórico de commits. -->

### Feed por cursor, não por offset

O feed usa `cursorPaginate(10)` ([`FeedService.php` L19][feed-cursor]). Em vez de pular N linhas, a página seguinte começa depois do último post recebido, com uma condição em `created_at`.

> **Alternativa descartada:** `paginate()`, por offset. Se alguém publica enquanto o usuário rola, todos os posts descem uma posição e a página seguinte repete o último da anterior. O cursor não tem esse problema, mas não deixa pular direto para a página 5. Num feed de rolagem infinita, isso não faz falta.

### Índice em `(user_id, created_at)`

A tabela `posts` tem um índice composto nas duas colunas que filtram e ordenam posts por autor ([migration, L17][posts-index]). Ele entrou no commit de 13 de maio, junto com um índice em `follows.following_id`.

A página de perfil (`WHERE user_id = ? ORDER BY created_at DESC`) sai do índice já na ordem certa, sem ordenação extra. No feed, quando são poucos seguidos, ele limita a leitura aos posts desses autores e, da segunda página em diante, aos anteriores ao cursor.

> **Alternativa descartada:** ficar só com o índice da chave estrangeira em `user_id`, que era o que existia antes. Ele acha os posts de um autor, mas fora de ordem, e o MySQL teria que ordenar o resultado em toda consulta de perfil.

### Curtida e follow únicos no banco

`likes` tem `unique(user_id, post_id)` e `follows` tem `unique(follower_id, following_id)` ([likes, L17][likes-unique]; [follows, L17][follows-unique]). No código, a curtida usa `firstOrCreate` ([`LikeService.php` L14–16][like-first]) e o follow usa `syncWithoutDetaching` ([`FollowService.php` L23][follow-sync]). Curtir ou seguir de novo responde 200 e não cria linha nova.

> **Alternativa descartada:** garantir isso só no código, consultando antes de inserir. Duas requisições ao mesmo tempo passam pela consulta e gravam duas linhas. Com a constraint, o banco recusa a segunda.

### Notificação só para os outros

`NotificationService::send` não grava nada quando o destinatário é quem fez a ação ([`NotificationService.php` L12–14][notify-self]). Curtir ou comentar o próprio post não gera notificação. Seguir a si mesmo nem chega lá: responde 422 ([`FollowService.php` L15–19][follow-self]).

> **Alternativa descartada:** repetir essa checagem em cada lugar que notifica. Curtida, comentário e follow chamam o mesmo service; com a regra nele, ela existe uma vez só.

### Autor e contagens junto com a página

O feed usa `with('user:id,name,username,avatar_url')` e `withCount(['likes', 'comments'])` ([`FeedService.php` L16–17][feed-eager]). As contagens viram subconsultas dentro do mesmo `SELECT` dos posts, e os autores da página vêm em uma consulta só. Montar uma página do feed custa três consultas, fora a autenticação, não importa quantos posts venham nela. Do autor saem só os campos públicos; o e-mail fica de fora.

> **Alternativa descartada:** ler `$post->user` e contar curtidas e comentários dentro do loop. Cada post faria uma consulta para o autor e duas para as contagens: o problema N+1.

### Só o autor edita ou apaga (403)

Antes de editar ou apagar um post ou comentário, o service compara o dono com o usuário autenticado e responde 403 se forem diferentes ([`PostService.php` L43–45][post-403]; [`CommentService.php` L42–44][comment-403]).

> **Alternativa descartada:** responder 404, para esconder que o recurso existe. Aqui isso não protege nada: qualquer usuário logado já vê o post em `GET /posts/{id}`. No [SR-UTFPR][sr-pr], onde a área de admin não deve aparecer para quem não tem acesso, a escolha foi a oposta.

### Regra de negócio em services

Os controllers recebem a requisição e devolvem JSON. A regra fica em `app/Services`, um service por recurso ([`app/Services`][services]). O `NotificationService`, por exemplo, é usado pelos services de curtida, comentário e follow.

> **Alternativa descartada:** deixar a regra nos controllers. Validação, consulta, autorização e notificação ficariam misturadas em cada método, e a mesma regra teria que ser repetida onde fosse preciso.

A separação não é completa: os services recebem o `Request` e validam dentro deles ([`PostService.php` L15–18][post-validate]). Eles ainda dependem de HTTP.

## Limite

### O feed carrega todos os IDs seguidos

A cada página, o feed busca os IDs de todos os perfis que o usuário segue ([`FeedService.php` L13][feed-pluck]) e manda a lista inteira de volta ao banco num `whereIn`. Funciona com poucos seguidos. Com milhares, exigiria outra estratégia:

- a lista vai do MySQL para o PHP e volta como um `IN (...)` com um item por perfil seguido, em toda página;
- para devolver 10 posts, o MySQL junta os posts de todos os autores seguidos e ordena antes do `LIMIT`. O índice não evita essa ordenação.

Num banco de teste com 1.500 perfis seguidos, o `EXPLAIN` do MySQL 8.4 mostra que ele deixa o índice de lado e lê a tabela de posts inteira.

<!-- TODO(Guilherme): o EXPLAIN e o teste do cursor abaixo foram rodados na preparação do site, num MySQL 8.4 com dados gerados (arquivo PortfolioMeasureTest.php da etapa 4). Rode de novo antes de publicar, para poder falar deles com segurança. -->

### Curtir de novo duplica a notificação

A curtida não duplica, mas a notificação sim. `LikeService` chama `send()` mesmo quando `firstOrCreate` devolve uma curtida que já existia ([`LikeService.php` L18–21][like-notify]). O follow faz o mesmo ([`FollowService.php` L25–27][follow-notify]). Duas curtidas seguidas no mesmo post geram duas notificações para o autor.

### Posts no mesmo segundo podem sumir do feed

O feed ordena só por `created_at` (`latest()`), e o cursor guarda esse valor. A [documentação do Laravel][laravel-cursor] pede que a ordenação do cursor use uma coluna única, e `created_at` não é: tem precisão de segundo. Se mais de um post tem o mesmo `created_at` na virada de uma página, a página seguinte pula os que sobraram. Num teste com 12 posts no mesmo segundo, a primeira página trouxe 10 e a segunda, nenhum.

## Estado atual

- O último commit é de 13 de maio de 2026.
- Sobe com `docker compose up`. O seeder cria usuários de exemplo, sem posts.
- A documentação OpenAPI cobre autenticação, usuários, posts, comentários e feed. Curtidas, follows e notificações ainda não estão nela.
- Não há testes automatizados além dos exemplos que o Laravel cria ([`tests/`][tests]). Nada do que está nesta página é coberto por teste.
- O upload de avatar responde 500: `UserService` usa `request->` sem o `$` ([L36][avatar-36]; [L42][avatar-42]).

<!-- TODO(Guilherme): corrigir o avatar no repositório (são dois caracteres) e tirar o item acima, ou manter como está. -->

## O que eu faria diferente

<!-- TODO(Guilherme): escrever esta seção. -->

[compose]: https://github.com/guibndz/instaclone-api/blob/e954c74f24c83f49aea41b6634bf60dc7b1346e6/compose.yaml
[feed-pluck]: https://github.com/guibndz/instaclone-api/blob/e954c74f24c83f49aea41b6634bf60dc7b1346e6/app/Services/FeedService.php#L13
[feed-eager]: https://github.com/guibndz/instaclone-api/blob/e954c74f24c83f49aea41b6634bf60dc7b1346e6/app/Services/FeedService.php#L16-L17
[feed-cursor]: https://github.com/guibndz/instaclone-api/blob/e954c74f24c83f49aea41b6634bf60dc7b1346e6/app/Services/FeedService.php#L19
[posts-index]: https://github.com/guibndz/instaclone-api/blob/e954c74f24c83f49aea41b6634bf60dc7b1346e6/database/migrations/2026_04_24_172918_create_posts_table.php#L17
[likes-unique]: https://github.com/guibndz/instaclone-api/blob/e954c74f24c83f49aea41b6634bf60dc7b1346e6/database/migrations/2026_04_24_175858_create_likes_table.php#L17
[follows-unique]: https://github.com/guibndz/instaclone-api/blob/e954c74f24c83f49aea41b6634bf60dc7b1346e6/database/migrations/2026_04_24_171442_create_follows_table.php#L17
[like-first]: https://github.com/guibndz/instaclone-api/blob/e954c74f24c83f49aea41b6634bf60dc7b1346e6/app/Services/LikeService.php#L14-L16
[like-notify]: https://github.com/guibndz/instaclone-api/blob/e954c74f24c83f49aea41b6634bf60dc7b1346e6/app/Services/LikeService.php#L18-L21
[follow-self]: https://github.com/guibndz/instaclone-api/blob/e954c74f24c83f49aea41b6634bf60dc7b1346e6/app/Services/FollowService.php#L15-L19
[follow-sync]: https://github.com/guibndz/instaclone-api/blob/e954c74f24c83f49aea41b6634bf60dc7b1346e6/app/Services/FollowService.php#L23
[follow-notify]: https://github.com/guibndz/instaclone-api/blob/e954c74f24c83f49aea41b6634bf60dc7b1346e6/app/Services/FollowService.php#L25-L27
[notify-self]: https://github.com/guibndz/instaclone-api/blob/e954c74f24c83f49aea41b6634bf60dc7b1346e6/app/Services/NotificationService.php#L12-L14
[post-validate]: https://github.com/guibndz/instaclone-api/blob/e954c74f24c83f49aea41b6634bf60dc7b1346e6/app/Services/PostService.php#L15-L18
[post-403]: https://github.com/guibndz/instaclone-api/blob/e954c74f24c83f49aea41b6634bf60dc7b1346e6/app/Services/PostService.php#L43-L45
[comment-403]: https://github.com/guibndz/instaclone-api/blob/e954c74f24c83f49aea41b6634bf60dc7b1346e6/app/Services/CommentService.php#L42-L44
[services]: https://github.com/guibndz/instaclone-api/tree/e954c74f24c83f49aea41b6634bf60dc7b1346e6/app/Services
[tests]: https://github.com/guibndz/instaclone-api/tree/e954c74f24c83f49aea41b6634bf60dc7b1346e6/tests
[avatar-36]: https://github.com/guibndz/instaclone-api/blob/e954c74f24c83f49aea41b6634bf60dc7b1346e6/app/Services/UserService.php#L36
[avatar-42]: https://github.com/guibndz/instaclone-api/blob/e954c74f24c83f49aea41b6634bf60dc7b1346e6/app/Services/UserService.php#L42
[sr-pr]: https://github.com/si-utfpr-gp/space-res/pull/45
[laravel-cursor]: https://laravel.com/docs/13.x/pagination#cursor-vs-offset-pagination
