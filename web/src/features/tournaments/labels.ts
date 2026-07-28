import type { RegistrationStatus, TournamentEntryKind, TournamentStatus } from './types'

export const STATUS_LABELS: Record<TournamentStatus, string> = {
  DRAFT: 'Rascunho',
  PUBLISHED: 'Inscrições abertas',
  REGISTRATION_CLOSED: 'Inscrições encerradas',
  LIVE: 'Ao vivo',
  COMPLETED: 'Concluído',
  CANCELLED: 'Cancelado',
}

export const ENTRY_KIND_LABELS: Record<TournamentEntryKind, string> = {
  TEAM: 'Por equipe',
  SOLO: 'Individual',
  MIXED: 'Equipe ou individual',
}

/**
 * Espelha statusTransitions em prisma-tournament.repository.ts — usado só para
 * decidir quais botões de transição mostrar. A autorização e a validação da
 * transição são do backend (assertOperator + a máquina de estados lá): se esta
 * cópia divergir, o backend recusa; nunca é ela quem libera a ação.
 */
export const STATUS_TRANSITIONS: Record<TournamentStatus, readonly TournamentStatus[]> = {
  DRAFT: ['PUBLISHED', 'CANCELLED'],
  PUBLISHED: ['REGISTRATION_CLOSED', 'CANCELLED'],
  REGISTRATION_CLOSED: ['LIVE', 'PUBLISHED', 'CANCELLED'],
  LIVE: ['COMPLETED', 'CANCELLED'],
  COMPLETED: [],
  CANCELLED: [],
}

/** Rótulo do botão que efetiva a transição de status (ação, não estado destino). */
export const TRANSITION_ACTION_LABELS: Record<TournamentStatus, string> = {
  DRAFT: 'Voltar para rascunho',
  PUBLISHED: 'Abrir inscrições',
  REGISTRATION_CLOSED: 'Encerrar inscrições',
  LIVE: 'Iniciar (ao vivo)',
  COMPLETED: 'Concluir',
  CANCELLED: 'Cancelar',
}

export const REGISTRATION_STATUS_LABELS: Record<RegistrationStatus, string> = {
  PENDING: 'Pendente',
  APPROVED: 'Aprovada',
  REJECTED: 'Rejeitada',
  WITHDRAWN: 'Retirada',
}
