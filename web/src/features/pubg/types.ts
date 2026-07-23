export type SeatStatus = 'confirmed' | 'pending' | 'mine'

export type SeatEntry = {
  status: SeatStatus
  nick: string
  rank: string
  kd: string
  wins: string
  rep: string
}

export type TournamentSeats = Record<number, SeatEntry>

export type TournamentId = 1 | 2

export type TournamentsState = Record<TournamentId, { title: string; seats: TournamentSeats }>
