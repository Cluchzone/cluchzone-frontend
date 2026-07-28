/**
 * Espelha clutchzone-backend/src/modules/tournaments/tournament.types.ts — não
 * invente campos que a API não devolve. As datas (`startsAt`, `createdAt`,
 * `updatedAt`) chegam como string ISO no JSON, não como Date.
 *
 * Fase 8a cobriu o torneio em si (criar/listar/editar/status). Fase 8b
 * adiciona inscrições (RegistrationView). Chaveamento (BracketView) entra na
 * Fase 8c.
 */
export type TournamentStatus =
  | 'DRAFT'
  | 'PUBLISHED'
  | 'REGISTRATION_CLOSED'
  | 'LIVE'
  | 'COMPLETED'
  | 'CANCELLED'

export type TournamentEntryKind = 'TEAM' | 'SOLO' | 'MIXED'

export type TournamentView = {
  id: string
  ownerId: string
  name: string
  slug: string
  game: string
  status: TournamentStatus
  entryKind: TournamentEntryKind
  maxEntries: number | null
  startsAt: string | null
  createdAt: string
  updatedAt: string
}

export type CreateTournamentInput = {
  name: string
  game: string
  entryKind: TournamentEntryKind
  maxEntries: number | null
  startsAt: string | null
}

export type UpdateTournamentInput = {
  name?: string
  entryKind?: TournamentEntryKind
  maxEntries?: number | null
  startsAt?: string | null
}

export type RegistrationEntryKind = 'TEAM' | 'SOLO'
export type RegistrationStatus = 'PENDING' | 'APPROVED' | 'REJECTED' | 'WITHDRAWN'

export type RegistrationView = {
  id: string
  tournamentId: string
  kind: RegistrationEntryKind
  teamId: string | null
  soloUserId: string | null
  registeredById: string
  status: RegistrationStatus
  createdAt: string
  updatedAt: string
}

export type CreateRegistrationInput = { kind: 'TEAM'; teamId: string } | { kind: 'SOLO' }
