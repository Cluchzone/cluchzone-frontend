import { createBrowserRouter } from 'react-router-dom'
import { HomePage } from '@/pages/HomePage'

/**
 * Roteador único da SPA. Cada fase da migração adiciona rotas aqui conforme as
 * páginas legadas são portadas (ex.: /brawlstars, /pubg, /teams, /tournaments/:id).
 * Ver o plano de migração faseada.
 */
export const router = createBrowserRouter([
  {
    path: '/',
    element: <HomePage />,
  },
])
