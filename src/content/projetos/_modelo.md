---
# Modelo de case. Arquivos que começam com "_" ficam fora do site.
# Copie para src/content/projetos/<slug>.md; o nome do arquivo vira a URL /projetos/<slug>.
titulo: Nome do projeto
subtitulo: O que ele é, em poucas palavras
tipo: Estudo # Projeto final | Em equipe | Estudo | Disciplina
contexto: Onde foi feito # opcional
problema: O problema em uma frase. Aparece no card e no topo do case.
detalhe: Uma ou duas frases a mais para o card. # opcional
# minhaParte: [obrigatório se tipo for "Em equipe"]
#   - O que foi meu
# decisao: Decisão em destaque no card. # opcional
stack:
  - Tecnologia
periodo: mmm/aaaa
repo: https://github.com/guibndz/repo
# pr: { numero: 1, url: https://github.com/... } # opcional
# deploy: https://... # opcional
ordem: 99
temCase: true
diagrama: instaclone-feed # registre o diagrama novo em src/components/diagrams e no schema
draft: true
---

## Contexto

Onde, quando e com quais ferramentas.

## Problema

O que precisava funcionar e o que quebraria no jeito mais direto.

## Decisões

### Nome da decisão

O que fiz, com link para o arquivo e as linhas no GitHub.

> **Alternativa descartada:** o que não fiz, e por quê.

## Limite

Onde a decisão deixa de funcionar. Sem rodeios.

## Estado atual

O que existe hoje: o que funciona, o que falta, se tem testes.

## O que eu faria diferente

<!-- TODO(Guilherme): escrever. -->
