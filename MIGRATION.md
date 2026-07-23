# Migração do frontend — estado de produção e rollback

Documento vivo do corte faseado do frontend legado (HTML/CSS/JS na raiz) para o
app React em `web/`. Ver o plano completo e a governança em `CONTRIBUTING.md`.

## Arquitetura em produção (a partir da Fase 5 / v2.1.0)

O legado e o app React **coexistem no mesmo GitHub Pages da org**
(`https://cluchzone.github.io/cluchzone-frontend/`), publicado pelo
`.github/workflows/deploy.yml` a cada push em `main`. Não há host separado em
produção: o Vercel é só preview de PR (revisão visual sem auth).

Por que aqui e não no Vercel: o backend (`clutchzone-backend`, repositório e
deploy separados, no Render) libera **CORS** e faz o **redirect de callback do
Steam** apenas para a origem `https://cluchzone.github.io`. Essa é a única
origem que (a) controlamos e (b) o backend confia. Origens do Vercel
(`*.vercel.app`) recebem 403. Trocar isso exigiria alterar env do backend, que
está sob controle de outra pessoa — fora do nosso alcance nesta fase.

### Como os usuários reais caem no React

O `deploy.yml` monta o diretório `site/` assim:

1. Copia o legado (`*.html/*.css/*.js` da raiz + `images/`) — inalterado.
2. Cache-bust dos refs do legado.
3. Dobra o React: `web/dist/assets` → `site/assets`, `favicon.svg`, e
   `web/dist/index.html` → **`site/404.html`** (fallback SPA do Pages). Uma rota
   como `/cluchzone-frontend/pubg` não é arquivo → o Pages serve `404.html` →
   o React Router (com `basename=/cluchzone-frontend`) renderiza a página.
4. **Remove** do publish o `.html` de cada página cujo slug colide com a rota
   React (`pubg.html`, `brawlstars.html`, `marketplace.html`, `seller-erp.html`).
   Isso é essencial: o Pages resolve `/pubg` para o arquivo `pubg.html` se ele
   existir (pretty URL), o que ofuscaria a rota React e o fallback SPA. Sem o
   arquivo, tanto `/pubg` quanto `/pubg.html` caem no 404 → `404.html` (SPA). A
   navbar/links legados apontam para esses `.html`; esses caminhos agora caem
   no SPA, e o React Router redireciona `<slug>.html` → `/<slug>` (client-side).
   É isso que vira o usuário real para o React. Páginas cujo `.html` legado não
   colide com o slug da rota nova (ex.: `my-teams.html` → `/teams`) não
   precisam desse passo — o legado e o React convivem sem conflito de URL.

O `index.html` legado (home) **não** é tocado — continua sendo a home até a
Fase 10. Todas as demais páginas legadas (`csgo.html`, `teams.html`, etc.) são
servidas byte a byte iguais.

> Nota histórica: a v2.1.0 tentou o passo 4 com **stubs de redirect** (arquivos
> `pubg.html` que redirecionavam para `/pubg`). Isso causou loop infinito, porque
> o Pages servia o próprio stub em `/pubg` (pretty URL) e o stub reapontava para
> `/pubg`. Corrigido na v2.1.1 removendo os arquivos.

## Páginas já em produção no React

| Rota | Fase | Legado correspondente |
|---|---|---|
| `/brawlstars` | 3 | `brawlstars.html` (removido do publish; redireciona) |
| `/pubg` | 4 | `pubg.html` (removido do publish; redireciona) |
| `/teams`, `/teams/new` | 6 | `my-teams.html`, `team-create.html` (nomes não colidem com a rota — legado continua publicado, sem conflito de pretty URL) |
| `/marketplace` | 7 | `marketplace.html` (removido do publish; redireciona) |
| `/seller-erp` | 7 | `seller-erp.html` (removido do publish; redireciona) |

Todo o resto continua servido pelo legado.

## Rollback

O corte é só de frontend — **sessões e banco (no backend) não são tocados**, então
reverter é seguro e instantâneo:

- **Rollback total (volta a 100% legado):** reverter o commit que alterou o
  `.github/workflows/deploy.yml` (voltando à versão que só publica o legado).
  O próximo push em `main` republica o site sem o React e com todos os
  `.html` legados originais (`pubg.html`, `brawlstars.html`, `marketplace.html`,
  `seller-erp.html`).
- **Rollback parcial (mantém o React acessível, mas para de virar usuários):**
  remover só o passo 4 (o `rm` dos `.html`). Os `.html` legados voltam ao publish
  e a navbar legada volta a servi-los; as rotas React só ficam acessíveis por URL
  direta que não colida com um `.html` legado.

Como o legado nunca é removido do publish nesta fase, o rollback não depende de
restaurar arquivos apagados — só de reverter o workflow.

## Dependências de backend conhecidas (bloqueiam fases futuras)

- Auth/Steam/CORS aceitam apenas `https://cluchzone.github.io`. Qualquer mudança
  de domínio (custom domain, subdomínio de API para cookies `SameSite=Lax`
  first-party) exige coordenar env no `clutchzone-backend` (Render), controlado
  por outra pessoa.
- O `render.yaml` versionado no backend está **desatualizado** (aponta para
  `rick-pedrinha.github.io`); o deploy real no dashboard já usa a org.
