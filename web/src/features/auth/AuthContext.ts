import { createContext } from 'react'
import type { AuthState, AuthUser } from './types'

export type AuthContextValue = {
  user: AuthUser | null
  state: AuthState
  /** Inicia o login Steam: redireciona o browser para o backend (`/auth/steam`). */
  login: (returnTo?: string) => void
  logout: () => Promise<void>
  /** Reconsulta /auth/me (ex.: ao voltar de um bfcache ou reconectar). */
  refresh: () => Promise<void>
}

export const AuthContext = createContext<AuthContextValue>({
  user: null,
  state: 'loading',
  login: () => {},
  logout: async () => {},
  refresh: async () => {},
})
