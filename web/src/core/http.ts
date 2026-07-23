import { BACKEND_URL } from './config'

/** Erro HTTP com status, para distinguir 401 (anônimo) de indisponibilidade (rede/5xx). */
export class HttpError extends Error {
  status: number
  constructor(status: number, message: string) {
    super(message)
    this.name = 'HttpError'
    this.status = status
  }
}

/**
 * Cliente HTTP único para o backend. Sempre com cookies de sessão
 * (`credentials: 'include'`), respeitando o contrato do backend:
 * respostas de erro no formato `{ error: { message } }`, 204 sem corpo.
 * A sessão é um cookie HttpOnly do backend — nunca tocamos nela no browser.
 */
export async function apiFetch<T>(path: string, options: RequestInit = {}): Promise<T> {
  if (!BACKEND_URL) throw new HttpError(0, 'Backend não configurado (defina VITE_BACKEND_URL).')

  const response = await fetch(`${BACKEND_URL}${path}`, {
    ...options,
    credentials: 'include',
    headers: { accept: 'application/json', ...options.headers },
  })

  if (response.status === 204) return null as T

  const payload: unknown = await response.json().catch(() => null)
  if (!response.ok) {
    const message =
      (payload as { error?: { message?: string } } | null)?.error?.message ?? 'Erro na requisição.'
    throw new HttpError(response.status, message)
  }
  return payload as T
}
