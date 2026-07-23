# Changelog

Todas as mudanças relevantes deste projeto são documentadas aqui.
O formato segue [Keep a Changelog](https://keepachangelog.com/pt-BR/1.1.0/)
e o versionamento segue [SemVer](https://semver.org/lang/pt-BR/).

As entradas a partir da versão 2.0.0 passam a ser geradas automaticamente pelo
[git-cliff](https://git-cliff.org) a partir de [Conventional Commits](https://www.conventionalcommits.org/pt-br/).

## [2.1.1] — 2026-07-23

Corrige um loop infinito de redirecionamento em `/pubg` e `/brawlstars`
introduzido no corte da v2.1.0. Os stubs `pubg.html`/`brawlstars.html` eram
servidos pelo próprio Pages em `/pubg` (pretty URL) e reapontavam para `/pubg`,
ofuscando a rota React. Agora esses `.html` são removidos do publish (caem no
fallback SPA) e o Router redireciona `pubg.html` → `/pubg`.

### 🐛 Correções
- **deploy:** remove pubg.html/brawlstars.html do publish para não ofuscar as
  rotas React no GitHub Pages (pretty URL)
- **routing:** redireciona pubg.html/brawlstars.html → rota limpa no React Router

## [2.1.0] — 2026-07-23

Primeiro corte de produção da migração para React. As páginas `/brawlstars`
(Fase 3) e `/pubg` (Fase 4) passam a ser servidas pelo novo app em `web/` aos
usuários reais, sobre o design system (Fase 1) e a navbar + autenticação Steam
(Fase 2). O legado continua servindo todas as demais páginas no mesmo GitHub
Pages, sem regressão — ver `MIGRATION.md` para a arquitetura e o rollback.

### 🚀 Funcionalidades
- **design-system:** porta design tokens 1:1 de style.css
- **design-system:** Button usa variantes reais do legado (primary/ghost)
- **design-system:** adiciona Modal (Radix Dialog)
- **design-system:** adiciona Toast (Radix Toast) + useToast
- **auth:** cliente HTTP e resolução da URL do backend
- **auth:** AuthProvider + useAuth contra o backend real
- **navbar:** navbar com Radix DropdownMenu para usuário autenticado
- **routing:** RootLayout com navbar fixa + placeholder de páginas não migradas
- **games:** adiciona GameSignatureKit (porte de game-personality.js)
- **brawlstars:** porta brawlstars.html para /brawlstars
- **games:** adiciona entrada pubg ao GameSignatureKit
- **pubg:** adiciona AirplaneLobby (seleção de assento, timer, tooltip)
- **pubg:** porta pubg.html para /pubg
- **routing:** deriva basename do BASE_URL para hospedagem em subpath

### 📝 Documentação
- **governança:** adiciona escopos games/brawlstars/pubg/csgo aos commits
- **deploy:** documenta arquitetura de produção e rollback (MIGRATION.md)

### 🧪 Testes
- **design-system:** galeria dev-only para comparação visual da Fase 1

### 📦 Build
- **web:** adiciona @radix-ui/react-dialog e @radix-ui/react-toast
- **web:** adiciona @radix-ui/react-dropdown-menu

### 👷 CI
- **deploy:** publica app React junto do legado no GitHub Pages

### 🧹 Removido
- **clutchzone-app/:** removida a tentativa anterior de migração (congelada na
  Fase 0), substituída por `web/`.

## [2.0.0] — 2026-07-21

Marco de governança. A partir daqui o repositório adota **SemVer** (substituindo o
esquema de data anterior, `2026.7.14-3`), **GitFlow** e **Conventional Commits**,
e inicia a migração faseada do frontend legado (HTML/CSS/JS puro na raiz) para o
novo app em `web/`.

O frontend legado da raiz permanece o runtime de produção (publicado no GitHub
Pages) até o corte da Fase 5 — nenhum comportamento de produção muda nesta versão.

### 📦 Build
- **web:** scaffold do novo frontend em `web/` (React + Vite + TypeScript + React
  Router + Radix UI + CSS Modules, lint via oxlint). Não serve produção ainda —
  publicado apenas em preview até o corte da Fase 5.

### 📝 Documentação
- **governança:** adoção de SemVer, GitFlow e Conventional Commits; `CONTRIBUTING.md`
  e este `CHANGELOG.md` (git-cliff via `cliff.toml`).
- **legacy:** `clutchzone-app/` congelado — não recebe mais features; candidato à
  remoção na Fase 5.
