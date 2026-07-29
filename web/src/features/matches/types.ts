/**
 * Espelha o contrato endurecido de `/api/matches` no clutchzone-backend
 * (`src/modules/matches/match.types.ts` e `cs2-server.types.ts`). Não invente
 * campos que a API não devolve.
 *
 * Datas chegam como string ISO (o backend serializa Date em JSON).
 */

export type MatchFormat = 'BEST_OF_1' | 'BEST_OF_3'

export type MatchStatus =
  | 'SCHEDULED'
  | 'CHECK_IN'
  | 'VETO'
  | 'PROVISIONING'
  | 'READY'
  | 'LIVE'
  | 'COMPLETED'
  | 'RELEASING'
  | 'RELEASED'
  | 'FAILED'
  | 'RETRYING'
  | 'CANCELLED'

export type MatchParticipantRole = 'PLAYER' | 'CAPTAIN' | 'COACH'

export type MatchParticipantView = {
  userId: string
  teamRef: string
  role: MatchParticipantRole
  checkedInAt: string | null
}

export type MatchView = {
  id: string
  tournamentRef: string | null
  createdById: string
  format: MatchFormat
  status: MatchStatus
  regionCode: string | null
  scheduledAt: string
  version: number
  participants: MatchParticipantView[]
  createdAt: string
  updatedAt: string
}

export type ServerCommandType = 'PAUSE' | 'UNPAUSE' | 'RESTART' | 'RELEASE'

export type ServerRoomView = {
  matchId: string
  matchStatus: MatchStatus
  allocationStatus: string | null
  regionCode: string | null
  canOperate: boolean
  endpoint: string | null
  /** Só exibida para jogadores confirmados/organizadores desta partida. */
  password: string | null
  connectCommand: string | null
}

export type ServerCommandView = {
  id: string
  type: ServerCommandType
  status: 'PENDING' | 'PROCESSING' | 'SUCCEEDED' | 'FAILED'
  createdAt: string
  processedAt: string | null
}
