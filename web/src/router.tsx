import { createBrowserRouter, type RouteObject } from 'react-router-dom'
import { HomePage } from '@/pages/HomePage'
import { NotFoundPage } from '@/pages/NotFoundPage'
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
      // Galeria só em dev (import.meta.env.DEV é false em produção → tree-shaken).
      ...(import.meta.env.DEV ? [{ path: 'dev/gallery', element: <GalleryPage /> }] : []),
      // Rotas ainda não migradas caem no placeholder "Em migração".
      { path: '*', element: <NotFoundPage /> },
    ],
  },
]

export const router = createBrowserRouter(routes)
