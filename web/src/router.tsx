import { createBrowserRouter, type RouteObject } from 'react-router-dom'
import { HomePage } from '@/pages/HomePage'
import { GalleryPage } from '@/pages/dev/GalleryPage'

/**
 * Roteador único da SPA. Cada fase da migração adiciona rotas aqui conforme as
 * páginas legadas são portadas (ex.: /brawlstars, /pubg, /teams, /tournaments/:id).
 * Ver o plano de migração faseada.
 */
const routes: RouteObject[] = [
  { path: '/', element: <HomePage /> },
  // Só registrada em dev (import.meta.env.DEV é `false` em build de produção,
  // o que permite ao bundler eliminar este branch e a página junto).
  ...(import.meta.env.DEV ? [{ path: '/dev/gallery', element: <GalleryPage /> }] : []),
]

export const router = createBrowserRouter(routes)
