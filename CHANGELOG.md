# Changelog

Todas as mudanças relevantes deste projeto são documentadas aqui.
O formato segue [Keep a Changelog](https://keepachangelog.com/pt-BR/1.1.0/)
e o versionamento segue [SemVer](https://semver.org/lang/pt-BR/).

As entradas a partir da versão 2.0.0 passam a ser geradas automaticamente pelo
[git-cliff](https://git-cliff.org) a partir de [Conventional Commits](https://www.conventionalcommits.org/pt-br/).

## [Não lançado]

### 📦 Build
- **web:** scaffold do novo frontend em `web/` (React + Vite + TypeScript + React
  Router + Radix UI + CSS Modules, lint via oxlint). Não serve produção ainda —
  publicado apenas em preview até o corte da Fase 5.

### 📝 Documentação
- **governança:** adoção de SemVer, GitFlow e Conventional Commits; `CONTRIBUTING.md`
  e este `CHANGELOG.md` (git-cliff via `cliff.toml`).

## [2.0.0] — 2026-07-21

Marco de governança. A partir daqui o repositório adota **SemVer** (substituindo o
esquema de data anterior, `2026.7.14-3`), **GitFlow** e **Conventional Commits**,
e inicia a migração faseada do frontend legado (HTML/CSS/JS puro na raiz) para o
novo app em `web/`.

O frontend legado da raiz permanece o runtime de produção (publicado no GitHub
Pages) até o corte da Fase 5 — nenhum comportamento de produção muda nesta versão.
