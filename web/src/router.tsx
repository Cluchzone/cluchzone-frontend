import { createBrowserRouter, Navigate, type RouteObject } from 'react-router-dom'
import { BrawlStarsPage } from '@/pages/BrawlStarsPage'
import { CsgoPage } from '@/pages/CsgoPage'
import { HomePage } from '@/pages/HomePage'
import { MarketplacePage } from '@/pages/MarketplacePage'
import { MyTeamsPage } from '@/pages/MyTeamsPage'
import { NotFoundPage } from '@/pages/NotFoundPage'
import { PubgPage } from '@/pages/PubgPage'
import { RootLayout } from '@/pages/RootLayout'
import { SellerErpPage } from '@/pages/SellerErpPage'
import { TeamCreatePage } from '@/pages/TeamCreatePage'
import { TournamentsPage } from '@/pages/TournamentsPage'
import { GalleryPage } from '@/pages/dev/GalleryPage'

/**
 * Roteador único da SPA. Todas as rotas ficam sob o RootLayout (navbar fixa).
 * Cada fase da migração adiciona rotas aqui conforme as páginas legadas são
 * portadas (ex.: /brawlstars, /pubg, /teams, /tournaments/:id).
 */
const routes: RouteObject[] = [
  {
    path: '/',
    element: <RootLayout />,
    children: [
      { index: true, element: <HomePage /> },
      { path: 'brawlstars', element: <BrawlStarsPage /> },
      { path: 'pubg', element: <PubgPage /> },
      { path: 'csgo', element: <CsgoPage /> },
      { path: 'teams', element: <MyTeamsPage /> },
      { path: 'teams/new', element: <TeamCreatePage /> },
      { path: 'tournaments', element: <TournamentsPage /> },
      { path: 'marketplace', element: <MarketplacePage /> },
      { path: 'seller-erp', element: <SellerErpPage /> },
      {
        path: 'passport',
        // Chart.js (~250KB) só é pago por quem visita /passport, não pelo bundle
        // inteiro — lazy nativo do React Router, sem precisar de Suspense manual.
        lazy: () => import('@/pages/PassportPage').then((m) => ({ Component: m.PassportPage })),
      },
      // A navbar/links de TODAS as páginas legadas linkam para os .html
      // originais. No GitHub Pages esses caminhos caem no 404 → 404.html
      // (SPA), pois os arquivos .html não são publicados (ver deploy.yml).
      // Aqui redirecionamos para a URL limpa da rota React (client-side,
      // sem round-trip no Pages).
      { path: 'pubg.html', element: <Navigate to="/pubg" replace /> },
      { path: 'csgo.html', element: <Navigate to="/csgo" replace /> },
      { path: 'brawlstars.html', element: <Navigate to="/brawlstars" replace /> },
      { path: 'marketplace.html', element: <Navigate to="/marketplace" replace /> },
      { path: 'seller-erp.html', element: <Navigate to="/seller-erp" replace /> },
      { path: 'passport.html', element: <Navigate to="/passport" replace /> },
      { path: 'index.html', element: <Navigate to="/" replace /> },
      // Galeria só em dev (import.meta.env.DEV é false em produção → tree-shaken).
      ...(import.meta.env.DEV ? [{ path: 'dev/gallery', element: <GalleryPage /> }] : []),
      // Rotas ainda não migradas caem no placeholder "Em migração".
      { path: '*', element: <NotFoundPage /> },
    ],
  },
]

/**
 * O basename vem do `base` do Vite (import.meta.env.BASE_URL), fonte única:
 * - dev/Vercel (preview): base '/'  → basename '/'
 * - GitHub Pages da org:  base '/cluchzone-frontend/' (via `vite build --base=…`
 *   no deploy.yml) → basename '/cluchzone-frontend'
 * Assim as rotas React casam com o subpath do project Pages sem hardcode.
 */
const basename = import.meta.env.BASE_URL.replace(/\/$/, '') || '/'

export const router = createBrowserRouter(routes, { basename })
