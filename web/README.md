# CLUTCHZONE web

Novo frontend da CLUTCHZONE — **React + Vite + TypeScript**, sendo construído
para substituir gradualmente o frontend legado em HTML/CSS/JS puro (na raiz do
repositório) por uma migração faseada, revisável fase a fase.

> **Status:** Fase 0 (scaffold). Ainda **não** serve produção — o legado da raiz
> continua sendo publicado no GitHub Pages até o corte da Fase 5. Este app é
> publicado apenas em preview (Vercel) até lá.

## Stack

- **React** + **React Router** (SPA de entrada única)
- **Vite** (dev server e build)
- **TypeScript** estrito
- **Radix UI Primitives** (componentes headless) + **CSS Modules** (CSS puro, sem
  Tailwind, sem CSS-in-JS)
- **oxlint** para lint

## Comandos

```bash
npm install
npm run dev          # servidor de desenvolvimento Vite
npm run build        # tsc -b && vite build
npm run preview      # serve o build localmente
npm run type-check   # checagem de tipos sem emitir
npm run lint         # oxlint (falha em qualquer warning)
```

## Estrutura

```
src/
  design-system/   componentes de UI reutilizáveis (Radix + CSS Modules)
  core/            infra transversal sem UI (api, auth, config)
  features/        código por domínio (auth, teams, tournaments, ...)
  pages/           componentes de página (entradas de rota)
  shared/          utilitários genéricos sem domínio nem UI
  router.tsx       definição de rotas
```

Cada pasta tem um `README.md` explicando seu escopo. Regras de segurança
(auth/sessão/roles pertencem ao backend) valem aqui igual à raiz — ver
`CLAUDE.md` e `SECURITY.md` na raiz do repositório.
