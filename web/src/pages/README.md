# pages/

Componentes de página — os pontos de entrada de cada rota do React Router
(ver `src/router.tsx`). Uma página compõe features e componentes do
design-system; ela não deve conter lógica de domínio pesada (isso vive em
`features/`).

Mapeamento querystring → rota, decidido página a página na migração:
- identificador (`?id=`) vira param de rota: `/tournaments/:id`;
- filtro (`?game=`) continua como querystring via `useSearchParams`.
