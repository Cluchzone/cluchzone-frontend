import type { SeatEntry, TournamentSeats } from './types'

const NICKS = [
  'xDROPx', 'BattlePro', 'SniperGod', 'ChickenKing', 'DesertFox',
  'ErangelWin', 'GhostRider', 'IronSight', 'JuiceWRLD', 'KillSwitch',
  'LagSpike', 'MiradaX', 'NightOwl', 'OmegaFrag', 'ProScopeR',
  'QuickScope', 'RedZoneR', 'ShotFirst', 'ThermalX', 'UltimateG',
  'VaultKing', 'WarZoneR', 'XSniperX', 'YoloDropR', 'ZeroRecoil',
]
const RANKS = ['Bronze', 'Silver', 'Gold', 'Platinum', 'Diamond', 'Master', 'Grandmaster']

function pick<T>(list: T[]): T {
  return list[Math.floor(Math.random() * list.length)]
}
function randomKd() {
  return (Math.random() * 4 + 0.4).toFixed(2)
}
function randomWinRate() {
  return `${Math.floor(Math.random() * 35 + 3)}%`
}
function randomReputation() {
  return `${Math.floor(Math.random() * 30 + 70)}%`
}

function shuffledSeatNumbers(total: number): number[] {
  const nums = Array.from({ length: total }, (_, i) => i + 1)
  for (let i = nums.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[nums[i], nums[j]] = [nums[j], nums[i]]
  }
  return nums
}

function mockEntry(status: 'confirmed' | 'pending'): SeatEntry {
  return { status, nick: pick(NICKS), rank: pick(RANKS), kd: randomKd(), wins: randomWinRate(), rep: randomReputation() }
}

/** ~55 confirmados, ~10 pendentes, resto disponível — mesma distribuição do legado (pubg.js::prefill). */
export function prefillSeats(total = 100): TournamentSeats {
  const order = shuffledSeatNumbers(total)
  const seats: TournamentSeats = {}
  order.slice(0, 55).forEach((num) => {
    seats[num] = mockEntry('confirmed')
  })
  order.slice(55, 65).forEach((num) => {
    seats[num] = mockEntry('pending')
  })
  return seats
}
