import { useCallback, useEffect, useRef, useState, type ReactNode } from 'react'
import { BACKEND_URL } from '@/core/config'
import { apiFetch, HttpError } from '@/core/http'
import { AuthContext } from './AuthContext'
import type { AuthRole, AuthState, AuthUser, BackendMeResponse } from './types'

function normalizeRole(value: string): AuthRole {
  const role = value.toLowerCase()
  return role === 'admin' || role === 'organizer' ? role : 'player'
}

function normalizeUser(user: BackendMeResponse['user']): AuthUser {
  return {
    id: user.id,
    displayName: user.displayName,
    avatarUrl: user.avatarUrl,
    profileUrl: user.profileUrl,
    role: normalizeRole(user.role),
    steamId64: user.steamId64,
    steamLevel: user.steamLevel,
    visibilityState: user.visibilityState,
    personaState: user.personaState,
    countryCode: user.countryCode,
    stateCode: user.stateCode,
    steamCreatedAt: user.steamCreatedAt,
    lastLogoffAt: user.lastLogoffAt,
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null)
  const [state, setState] = useState<AuthState>('loading')
  const loadingRef = useRef(false)

  const loadSession = useCallback(async () => {
    if (loadingRef.current) return
    loadingRef.current = true
    try {
      const payload = await apiFetch<BackendMeResponse>('/auth/me')
      setUser(normalizeUser(payload.user))
      setState('authenticated')
    } catch (error) {
      // 401 é resposta legítima: não há sessão. Qualquer outra coisa (rede,
      // 5xx, backend não configurado) é indisponibilidade, não "anônimo".
      if (error instanceof HttpError && error.status === 401) {
        setUser(null)
        setState('anonymous')
      } else {
        setUser(null)
        setState('unavailable')
      }
    } finally {
      loadingRef.current = false
    }
  }, [])

  useEffect(() => {
    void loadSession()
  }, [loadSession])

  const login = useCallback((returnTo?: string) => {
    if (!BACKEND_URL) {
      setState('unavailable')
      return
    }
    const target = returnTo ?? `${window.location.pathname}${window.location.search}`
    // O browser apenas navega para o backend — quem fala com a Steam (OpenID)
    // é o backend. Nunca processamos o retorno OpenID aqui.
    window.location.assign(`${BACKEND_URL}/auth/steam?returnTo=${encodeURIComponent(target)}`)
  }, [])

  const logout = useCallback(async () => {
    try {
      await apiFetch('/auth/logout', { method: 'POST' })
    } catch {
      // Mesmo se a chamada falhar, limpamos o estado local; o cookie de sessão
      // é do backend e será invalidado no servidor.
    }
    setUser(null)
    setState('anonymous')
  }, [])

  return (
    <AuthContext.Provider value={{ user, state, login, logout, refresh: loadSession }}>
      {children}
    </AuthContext.Provider>
  )
}
