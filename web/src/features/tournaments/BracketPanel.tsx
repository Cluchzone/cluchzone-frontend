import { useEffect, useMemo, useState } from 'react'
import { Button } from '@/design-system/Button'
import { useToast } from '@/design-system/Toast'
import { HttpError } from '@/core/http'
import type { AuthUser } from '@/features/auth'
import { teamsService, type TeamView } from '@/features/teams'
import { registrationIdentity, shortId } from './identity'
import { BRACKET_MATCH_STATUS_LABELS } from './labels'
import { tournamentsService } from './tournamentsService'
import type { BracketMatchView, BracketView, RegistrationView, TournamentView } from './types'
import styles from './BracketPanel.module.css'

const READY_FOR_GENERATION: readonly TournamentView['status'][] = ['REGISTRATION_CLOSED', 'LIVE']

function participantLabel(
  registrationId: string | null,
  registrations: Map<string, RegistrationView>,
  allTeams: TeamView[],
  currentUserId: string,
): string {
  if (!registrationId) return 'BYE'
  const registration = registrations.get(registrationId)
  return registration ? registrationIdentity(registration, allTeams, currentUserId) : `Inscrição #${shortId(registrationId)}`
}

function matchesByRound(matches: BracketMatchView[]): [number, BracketMatchView[]][] {
  const rounds = new Map<number, BracketMatchView[]>()
  for (const match of matches) {
    const list = rounds.get(match.round) ?? []
    list.push(match)
    rounds.set(match.round, list)
  }
  return [...rounds.entries()].sort(([a], [b]) => a - b)
}

/**
 * Painel de chaveamento (Fase 8c), contra POST/GET /:tournamentId/bracket. A
 * API só gera (single-elimination, a partir das inscrições aprovadas) e lê —
 * não existe endpoint para reportar resultado de partida ou avançar vencedor
 * além do que a geração já resolve via byes. Sem chaveamento ainda gerado,
 * GET devolve 404 (TOURNAMENT_BRACKET_NOT_FOUND): tratamos isso como estado
 * "ainda não gerado", não como erro.
 */
export function BracketPanel({
  tournament,
  currentUser,
  isOperator,
}: {
  tournament: TournamentView
  currentUser: AuthUser
  isOperator: boolean
}) {
  const toast = useToast()
  const [bracket, setBracket] = useState<BracketView | null | undefined>(undefined)
  const [registrations, setRegistrations] = useState<RegistrationView[]>([])
  const [allTeams, setAllTeams] = useState<TeamView[]>([])
  const [generating, setGenerating] = useState(false)

  useEffect(() => {
    let ignore = false
    tournamentsService
      .getBracket(tournament.id)
      .then((fresh) => {
        if (!ignore) setBracket(fresh)
      })
      .catch((error) => {
        if (ignore) return
        if (!(error instanceof HttpError && error.status === 404)) {
          toast(error instanceof HttpError ? error.message : 'Não foi possível carregar o chaveamento.', 'error')
        }
        setBracket(null)
      })
    return () => {
      ignore = true
    }
  }, [tournament.id, toast])

  useEffect(() => {
    let ignore = false
    tournamentsService
      .listRegistrations(tournament.id)
      .then((fresh) => {
        if (!ignore) setRegistrations(fresh)
      })
      .catch(() => {
        // Silencioso: sem rótulo de participante não impede exibir o chaveamento.
      })
    return () => {
      ignore = true
    }
  }, [tournament.id])

  useEffect(() => {
    if (tournament.entryKind === 'SOLO') return
    let ignore = false
    teamsService
      .listMine()
      .then((teams) => {
        if (!ignore) setAllTeams(teams)
      })
      .catch(() => {
        // Silencioso: mesmo princípio do painel de inscrições.
      })
    return () => {
      ignore = true
    }
  }, [tournament.entryKind])

  const registrationsById = useMemo(() => new Map(registrations.map((r) => [r.id, r])), [registrations])
  const rounds = useMemo(() => (bracket ? matchesByRound(bracket.matches) : []), [bracket])

  async function handleGenerate() {
    setGenerating(true)
    try {
      const created = await tournamentsService.generateBracket(tournament.id)
      setBracket(created)
      toast('🗂️ Chaveamento gerado.', 'success')
    } catch (error) {
      toast(error instanceof HttpError ? error.message : 'Não foi possível gerar o chaveamento.', 'error')
    } finally {
      setGenerating(false)
    }
  }

  const canGenerate = isOperator && bracket === null && READY_FOR_GENERATION.includes(tournament.status)

  return (
    <div className={styles.panel}>
      {canGenerate && (
        <div className={styles.generateBox}>
          <p className={styles.hint}>
            Gera o chaveamento eliminatório simples a partir das inscrições aprovadas. Essa ação não pode
            ser desfeita.
          </p>
          <Button onClick={handleGenerate} disabled={generating}>
            {generating ? 'Gerando…' : '🗂️ Gerar Chaveamento'}
          </Button>
        </div>
      )}

      {isOperator && bracket === null && !READY_FOR_GENERATION.includes(tournament.status) && (
        <p className={styles.hint}>
          Encerre as inscrições para poder gerar o chaveamento (é preciso pelo menos 2 inscrições aprovadas).
        </p>
      )}

      {bracket === undefined && <div className={styles.state}>Carregando chaveamento…</div>}

      {bracket === null && !isOperator && <p className={styles.empty}>O chaveamento ainda não foi gerado.</p>}

      {bracket && (
        <div className={styles.bracket}>
          {rounds.map(([round, matches]) => (
            <div key={round} className={styles.round}>
              <p className={styles.roundLabel}>Rodada {round}</p>
              {matches.map((match) => (
                <div key={match.id} className={styles.match}>
                  <div className={styles.slot} data-winner={match.winnerRegistrationId === match.registrationOneId}>
                    {participantLabel(match.registrationOneId, registrationsById, allTeams, currentUser.id)}
                  </div>
                  <div className={styles.slot} data-winner={match.winnerRegistrationId === match.registrationTwoId}>
                    {participantLabel(match.registrationTwoId, registrationsById, allTeams, currentUser.id)}
                  </div>
                  <p className={styles.matchStatus}>{BRACKET_MATCH_STATUS_LABELS[match.status]}</p>
                </div>
              ))}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
