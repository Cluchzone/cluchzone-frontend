import type { TeamView } from '@/features/teams'
import type { RegistrationView } from './types'

export function shortId(id: string): string {
  return id.slice(0, 8)
}

/**
 * Resolve um nome de exibição para uma inscrição sem inventar dado que a API
 * não devolve: nomes de equipe só são resolvidos contra `myTeams` (qualquer
 * equipe da qual o usuário é membro, via /api/teams/mine — não só as que ele
 * pode inscrever). Identidade solo só é resolvida para o próprio usuário.
 * Para inscrições de terceiros, sem endpoint de busca de equipe/usuário por
 * id no backend, mostramos o id curto da inscrição em vez de um nome.
 */
export function registrationIdentity(
  registration: RegistrationView,
  myTeams: TeamView[],
  currentUserId: string,
): string {
  if (registration.kind === 'TEAM') {
    if (!registration.teamId) return `Inscrição #${shortId(registration.id)}`
    const mine = myTeams.find((team) => team.id === registration.teamId)
    return mine ? `${mine.name} [${mine.tag}]` : `Equipe #${shortId(registration.teamId)}`
  }
  return registration.soloUserId === currentUserId ? 'Você' : `Inscrição #${shortId(registration.id)}`
}
