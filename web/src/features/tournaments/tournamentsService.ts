import { apiFetch } from '@/core/http'
import type {
  BracketView,
  CreateRegistrationInput,
  CreateTournamentInput,
  RegistrationStatus,
  RegistrationView,
  TournamentStatus,
  TournamentView,
  UpdateTournamentInput,
} from './types'

const BASE = '/api/tournaments'

/**
 * Cliente fino sobre /api/tournaments. Fase 8a: ciclo de vida do torneio
 * (criar, listar, editar, status). Fase 8b: inscrições (inscrever, listar,
 * decidir, desistir). Fase 8c: chaveamento (gerar, ler). O backend decide
 * autorização por recurso (ownerId/role/membership de equipe) — este cliente
 * não finge nenhuma permissão; só chama e propaga o erro do servidor.
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

  register(
    tournamentId: string,
    input: CreateRegistrationInput,
    idempotencyKey: string,
  ): Promise<RegistrationView> {
    return apiFetch<{ ok: boolean; registration: RegistrationView }>(`${BASE}/${tournamentId}/registrations`, {
      method: 'POST',
      headers: { 'content-type': 'application/json', 'Idempotency-Key': idempotencyKey },
      body: JSON.stringify(input),
    }).then((res) => res.registration)
  },

  listRegistrations(tournamentId: string): Promise<RegistrationView[]> {
    return apiFetch<{ ok: boolean; registrations: RegistrationView[] }>(
      `${BASE}/${tournamentId}/registrations`,
    ).then((res) => res.registrations)
  },

  decideRegistration(
    tournamentId: string,
    registrationId: string,
    status: Extract<RegistrationStatus, 'APPROVED' | 'REJECTED'>,
  ): Promise<RegistrationView> {
    return apiFetch<{ ok: boolean; registration: RegistrationView }>(
      `${BASE}/${tournamentId}/registrations/${registrationId}/status`,
      {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ status }),
      },
    ).then((res) => res.registration)
  },

  withdrawRegistration(tournamentId: string, registrationId: string): Promise<RegistrationView> {
    return apiFetch<{ ok: boolean; registration: RegistrationView }>(
      `${BASE}/${tournamentId}/registrations/${registrationId}/withdraw`,
      { method: 'POST' },
    ).then((res) => res.registration)
  },

  generateBracket(tournamentId: string): Promise<BracketView> {
    return apiFetch<{ ok: boolean; bracket: BracketView }>(`${BASE}/${tournamentId}/bracket`, {
      method: 'POST',
    }).then((res) => res.bracket)
  },

  getBracket(tournamentId: string): Promise<BracketView> {
    return apiFetch<{ ok: boolean; bracket: BracketView }>(`${BASE}/${tournamentId}/bracket`).then(
      (res) => res.bracket,
    )
  },
}
