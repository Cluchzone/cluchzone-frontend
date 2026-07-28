/**
 * Espelha clutchzone-backend/src/modules/tournaments/tournament.types.ts — não
 * invente campos que a API não devolve. As datas (`startsAt`, `createdAt`,
 * `updatedAt`) chegam como string ISO no JSON, não como Date.
 *
 * Fase 8a cobre só o torneio em si (criar/listar/editar/status). Inscrições
 * (RegistrationView) e chaveamento (BracketView) entram nas Fases 8b/8c.
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
