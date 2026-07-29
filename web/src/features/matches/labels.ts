import type { MatchStatus } from './types'

/** Rótulos pt-BR de MatchStatus — portados 1:1 de `serverStatusLabels` (csgo.js legado). */
export const SERVER_STATUS_LABELS: Record<MatchStatus, string> = {
  SCHEDULED: 'Agendada',
  CHECK_IN: 'Check-in',
  VETO: 'Veto de mapas',
  PROVISIONING: 'Preparando servidor',
  READY: 'Pronta',
  LIVE: 'Ao vivo',
  COMPLETED: 'Concluída',
  RELEASING: 'Liberando servidor',
  RELEASED: 'Liberada',
  FAILED: 'Falha no servidor',
  RETRYING: 'Nova tentativa',
  CANCELLED: 'Cancelada',
}
