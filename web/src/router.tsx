import { createBrowserRouter, Navigate, type RouteObject } from 'react-router-dom'
import { BrawlStarsPage } from '@/pages/BrawlStarsPage'
import { HomePage } from '@/pages/HomePage'
import { NotFoundPage } from '@/pages/NotFoundPage'
import { PubgPage } from '@/pages/PubgPage'
import { RootLayout } from '@/pages/RootLayout'
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
      // A navbar de TODAS as páginas legadas linka para pubg.html/brawlstars.html.
      // No GitHub Pages esses caminhos caem no 404 → 404.html (SPA), pois os
      // arquivos .html não são publicados (ver deploy.yml). Aqui redirecionamos
      // para a URL limpa da rota React (client-side, sem round-trip no Pages).
      { path: 'pubg.html', element: <Navigate to="/pubg" replace /> },
      { path: 'brawlstars.html', element: <Navigate to="/brawlstars" replace /> },
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
