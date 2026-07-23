# Contribuindo com a CLUTCHZONE (frontend)

Este documento define o fluxo de trabalho adotado a partir da versão `2.0.0`:
**SemVer** para versionamento, **GitFlow** para branches e **Conventional
Commits** para mensagens (base do changelog automático via git-cliff).

> Regras de segurança inegociáveis (auth/sessão/Steam/roles pertencem ao backend;
> nunca confiar em ID do browser como autorização; nunca guardar identidade em
> `localStorage`) estão em `CLAUDE.md`, `AGENTS.md` e `SECURITY.md`. Elas valem
> para todo código deste repositório, incluindo o novo app em `web/`.

## Estrutura do repositório

- **Raiz (`*.html`/`*.css`/`*.js`, `server.js`)** — frontend legado, ainda em
  produção (GitHub Pages). Congelado exceto por correções; não recebe features novas.
- **`web/`** — novo frontend (React + Vite + TS). Alvo da migração faseada.
- **`clutchzone-app/`** — tentativa anterior de evolução, **congelada** (não editar).
  Será removida na Fase 5.

## Versionamento — SemVer

A versão do produto é a de `package.json` na raiz (`MAJOR.MINOR.PATCH`).

- **MAJOR** — reservado ao corte final da migração (remoção do legado).
- **MINOR** — cada fase da migração que chega a produção real.
- **PATCH** — correções.

`web/package.json` tem versão interna própria (`0.x`) enquanto o app não é a
produção canônica.

## Branches — GitFlow

| Branch | Papel |
|---|---|
| `main` | Produção. Protegida — sem push direto; só recebe merge de `release/*` e `hotfix/*`. |
| `develop` | Integração. Base das features. |
| `feature/<escopo>-<descrição>` | Trabalho novo; sai de `develop` e volta pra `develop`. |
| `release/x.y.0` | Estabilização de um MINOR; sai de `develop`, faz merge em `main` **e** `develop`, e recebe a tag `vX.Y.0`. |
| `hotfix/x.y.z` | Correção urgente de produção; sai de `main`, volta pra `main` **e** `develop`. |

Exemplo de fluxo de feature:

```bash
git checkout develop
git checkout -b feature/design-system-modal
# ... commits ...
# abrir PR feature/design-system-modal -> develop
```

## Mensagens de commit — Conventional Commits

Formato: `tipo(escopo): descrição no imperativo`

```
feat(navbar): migra navbar principal para React com Radix DropdownMenu
fix(auth): corrige envio de cookies em fetch cross-origin
docs(governança): adiciona guia de contribuição
```

### Tipos aceitos

`feat`, `fix`, `refactor`, `perf`, `style`, `test`, `docs`, `chore`, `ci`,
`build`, `revert`.

### Escopos aceitos

`design-system`, `auth`, `navbar`, `games`, `brawlstars`, `pubg`, `csgo`,
`teams`, `tournaments`, `marketplace`, `seller-erp`, `passport`, `chat`,
`inventory`, `routing`, `deploy`, `governança`, `legacy`, `server`.

### Breaking changes

Só no corte final da migração. Use `!` após o tipo/escopo **e** um rodapé
`BREAKING CHANGE:` explicando o que quebrou.

## Changelog

Gerado pelo [git-cliff](https://git-cliff.org) a partir dos commits (config em
`cliff.toml`). Ao fechar um release:

```bash
git cliff --unreleased --prepend CHANGELOG.md --tag vX.Y.Z
```

Não edite o histórico já publicado do `CHANGELOG.md` à mão — corrija ajustando os
commits/config e regenerando a seção não lançada.

## Antes de abrir um PR (no `web/`)

```bash
cd web
npm run type-check   # tipos
npm run lint         # oxlint (falha em qualquer warning)
npm run build        # build de produção
```

Cada PR de fase deve passar esses três gates e gerar um preview (Vercel) que
permita a comparação visual/funcional 1:1 com a página legada antes do merge.
