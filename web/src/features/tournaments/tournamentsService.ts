import { apiFetch } from '@/core/http'
import type {
  CreateTournamentInput,
  TournamentStatus,
  TournamentView,
  UpdateTournamentInput,
} from './types'

const BASE = '/api/tournaments'

/**
 * Cliente fino sobre /api/tournaments. A Fase 8a expõe só o ciclo de vida do
 * torneio: criar (organizer/admin), listar, editar e transicionar status. O
 * backend decide autorização por recurso (ownerId/role) — este cliente não
 * finge nenhuma permissão; só chama e propaga o erro do servidor.
 *
 * Inscrições (register/decide/withdraw) e chaveamento (bracket) existem na API
 * mas entram nas Fases 8b/8c — não adicionar aqui antes.
 */
export const tournamentsService = {
  list(): Promise<TournamentView[]> {
    return apiFetch<{ ok: boolean; tournaments: TournamentView[] }>(BASE).then((res) => res.tournaments)
  },

  create(input: CreateTournamentInput): Promise<TournamentView> {
    return apiFetch<{ ok: boolean; tournament: TournamentView }>(BASE, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify(input),
    }).then((res) => res.tournament)
  },

  update(id: string, input: UpdateTournamentInput): Promise<TournamentView> {
    return apiFetch<{ ok: boolean; tournament: TournamentView }>(`${BASE}/${id}`, {
      method: 'PATCH',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify(input),
    }).then((res) => res.tournament)
  },

  changeStatus(id: string, status: TournamentStatus): Promise<TournamentView> {
    return apiFetch<{ ok: boolean; tournament: TournamentView }>(`${BASE}/${id}/status`, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ status }),
    }).then((res) => res.tournament)
  },
}
