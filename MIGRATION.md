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
4. Sobrescreve `pubg.html` e `brawlstars.html` por **stubs de redirect** para
   `/cluchzone-frontend/pubg` e `/brawlstars` — porque a navbar de todas as
   páginas legadas aponta para esses `.html`. É isso que vira o usuário real
   para o React.

O `index.html` legado (home) **não** é tocado — continua sendo a home até a
Fase 10. Todas as demais páginas legadas (`csgo.html`, `teams.html`, etc.) são
servidas byte a byte iguais.

## Páginas já em produção no React

| Rota | Fase | Legado correspondente |
|---|---|---|
| `/brawlstars` | 3 | `brawlstars.html` (agora stub de redirect) |
| `/pubg` | 4 | `pubg.html` (agora stub de redirect) |

Todo o resto continua servido pelo legado.

## Rollback

O corte é só de frontend — **sessões e banco (no backend) não são tocados**, então
reverter é seguro e instantâneo:

- **Rollback total (volta a 100% legado):** reverter o commit que alterou o
  `.github/workflows/deploy.yml` (voltando à versão que só publica o legado).
  O próximo push em `main` republica o site sem o React e com os
  `pubg.html`/`brawlstars.html` legados originais.
- **Rollback parcial (mantém o React acessível, mas para de virar usuários):**
  remover só o passo 4 (stubs). As rotas React seguem acessíveis por URL direta,
  mas a navbar legada volta a servir os `.html` legados.

Como o legado nunca é removido do publish nesta fase, o rollback não depende de
restaurar arquivos apagados — só de reverter o workflow.

## Dependências de backend conhecidas (bloqueiam fases futuras)

- Auth/Steam/CORS aceitam apenas `https://cluchzone.github.io`. Qualquer mudança
  de domínio (custom domain, subdomínio de API para cookies `SameSite=Lax`
  first-party) exige coordenar env no `clutchzone-backend` (Render), controlado
  por outra pessoa.
- O `render.yaml` versionado no backend está **desatualizado** (aponta para
  `rick-pedrinha.github.io`); o deploy real no dashboard já usa a org.
