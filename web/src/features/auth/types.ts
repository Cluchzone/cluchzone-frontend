/**
 * Papel do usuário, apenas para exibição/adaptação de UI. Autorização real
 * é sempre decidida no backend por recurso (ver SECURITY.md) — nunca confie
 * neste valor para liberar ações no cliente.
 */
export type AuthRole = 'player' | 'organizer' | 'admin'

/** Subconjunto de /auth/me que a UI consome hoje. O backend retorna mais campos. */
export type AuthUser = {
  id: string
  displayName: string
  avatarUrl: string | null
  profileUrl: string | null
  role: AuthRole
}

/**
 * - loading: primeira verificação de sessão em andamento
 * - authenticated: /auth/me retornou usuário
 * - anonymous: /auth/me retornou 401 (sem sessão)
 * - unavailable: backend inalcançável / erro transiente
 */
export type AuthState = 'loading' | 'authenticated' | 'anonymous' | 'unavailable'

/** Formato bruto de /auth/me: `{ ok, user }` (ver clutchzone-backend auth.router.ts). */
export type BackendMeResponse = {
  ok: boolean
  user: {
    id: string
    displayName: string
    avatarUrl: string | null
    profileUrl: string | null
    role: string
    status: string
  }
}
