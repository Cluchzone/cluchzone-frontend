import { apiFetch } from '@/core/http'
import type { MatchView, ServerCommandType, ServerCommandView, ServerRoomView } from './types'

const BASE = '/api/matches'

/**
 * Idempotency-Key exigida por provision/actions. Regex do backend:
 * `^[A-Za-z0-9._:-]+$`, 8-128 chars — `prefixo:uuid` cabe.
 */
function idempotencyKey(prefix: string): string {
  return `${prefix}:${crypto.randomUUID()}`
}

/**
 * Wrappers finos sobre `/api/matches` (endurecido: requireAuth, autorização por
 * recurso, idempotência). Só os endpoints usáveis a partir do browser com um id
 * de partida existente — criar partida (`POST /`) exige `participants[].userId`
 * e não há lookup de usuário por id no backend, então não é portável (mesma
 * parede de identidade da Fase 8).
 */
export const matchesService = {
  getMatch(id: string): Promise<MatchView> {
    return apiFetch<{ ok: boolean; match: MatchView }>(`${BASE}/${encodeURIComponent(id)}`).then(
      (res) => res.match,
    )
  },
  getRoom(id: string): Promise<ServerRoomView> {
    return apiFetch<{ ok: boolean; room: ServerRoomView }>(
      `${BASE}/${encodeURIComponent(id)}/room`,
    ).then((res) => res.room)
  },
  checkIn(id: string): Promise<MatchView> {
    return apiFetch<{ ok: boolean; match: MatchView }>(`${BASE}/${encodeURIComponent(id)}/check-in`, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: '{}',
    }).then((res) => res.match)
  },
  provision(id: string): Promise<MatchView> {
    return apiFetch<{ ok: boolean; match: MatchView }>(
      `${BASE}/${encodeURIComponent(id)}/provision`,
      {
        method: 'POST',
        headers: { 'content-type': 'application/json', 'Idempotency-Key': idempotencyKey('provision') },
        body: '{}',
      },
    ).then((res) => res.match)
  },
  serverAction(id: string, type: ServerCommandType): Promise<ServerCommandView> {
    return apiFetch<{ ok: boolean; command: ServerCommandView }>(
      `${BASE}/${encodeURIComponent(id)}/server/actions`,
      {
        method: 'POST',
        headers: {
          'content-type': 'application/json',
          'Idempotency-Key': idempotencyKey(type.toLowerCase()),
        },
        body: JSON.stringify({ type }),
      },
    ).then((res) => res.command)
  },
}
