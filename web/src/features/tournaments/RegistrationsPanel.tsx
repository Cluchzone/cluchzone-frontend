import { useEffect, useState } from 'react'
import { Button } from '@/design-system/Button'
import { useToast } from '@/design-system/Toast'
import { HttpError } from '@/core/http'
import type { AuthUser } from '@/features/auth'
import { teamsService, type TeamView } from '@/features/teams'
import { registrationIdentity } from './identity'
import { REGISTRATION_STATUS_LABELS } from './labels'
import { tournamentsService } from './tournamentsService'
import type { RegistrationView, TournamentView } from './types'
import styles from './RegistrationsPanel.module.css'

const CAPTAIN_ROLES = ['CAPTAIN', 'VICE_CAPTAIN'] as const

function formatCreatedAt(iso: string): string {
  const date = new Date(iso)
  if (Number.isNaN(date.getTime())) return ''
  return date.toLocaleString('pt-BR', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' })
}

/**
 * Painel de inscrições de um torneio (Fase 8b), contra POST/GET
 * /:tournamentId/registrations e /status /withdraw. Sem endpoint de busca de
 * equipe/usuário por id no backend (só /api/teams/mine existe) — nomes só são
 * resolvidos para as próprias equipes/identidade do usuário; para inscrições
 * de terceiros mostramos o id curto da inscrição, sem inventar um nome.
 */
export function RegistrationsPanel({
  tournament,
  currentUser,
  isOperator,
}: {
  tournament: TournamentView
  currentUser: AuthUser
  isOperator: boolean
}) {
  const toast = useToast()
  const [registrations, setRegistrations] = useState<RegistrationView[] | null>(null)
  const [allTeams, setAllTeams] = useState<TeamView[]>([])
  const [eligibleTeams, setEligibleTeams] = useState<TeamView[]>([])
  const [selectedTeamId, setSelectedTeamId] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [busyId, setBusyId] = useState<string | null>(null)

  useEffect(() => {
    let ignore = false
    tournamentsService
      .listRegistrations(tournament.id)
      .then((fresh) => {
        if (!ignore) setRegistrations(fresh)
      })
      .catch((error) => {
        if (ignore) return
        toast(error instanceof HttpError ? error.message : 'Não foi possível carregar as inscrições.', 'error')
        setRegistrations([])
      })
    return () => {
      ignore = true
    }
  }, [tournament.id, toast])

  useEffect(() => {
    if (tournament.entryKind === 'SOLO') return
    let ignore = false
    teamsService
      .listMine()
      .then((teams) => {
        if (ignore) return
        setAllTeams(teams)
        const eligible = teams.filter((team) =>
          team.members.some(
            (member) =>
              member.userId === currentUser.id &&
              (CAPTAIN_ROLES as readonly string[]).includes(member.role),
          ),
        )
        setEligibleTeams(eligible)
        setSelectedTeamId((current) => current || eligible[0]?.id || '')
      })
      .catch(() => {
        // Silencioso: sem equipes elegíveis é um estado normal, não um erro a reportar.
      })
    return () => {
      ignore = true
    }
  }, [tournament.entryKind, currentUser.id])

  function upsert(next: RegistrationView) {
    setRegistrations((current) => {
      if (!current) return [next]
      const index = current.findIndex((r) => r.id === next.id)
      if (index === -1) return [next, ...current]
      const copy = [...current]
      copy[index] = next
      return copy
    })
  }

  async function handleRegister(kind: 'TEAM' | 'SOLO') {
    if (kind === 'TEAM' && !selectedTeamId) {
      toast('⚠️ Selecione uma equipe para inscrever.', 'error')
      return
    }
    setSubmitting(true)
    try {
      const idempotencyKey = crypto.randomUUID()
      const registration = await tournamentsService.register(
        tournament.id,
        kind === 'TEAM' ? { kind: 'TEAM', teamId: selectedTeamId } : { kind: 'SOLO' },
        idempotencyKey,
      )
      upsert(registration)
      toast('🏆 Inscrição enviada — aguardando aprovação do organizador.', 'success')
    } catch (error) {
      toast(error instanceof HttpError ? error.message : 'Não foi possível se inscrever.', 'error')
    } finally {
      setSubmitting(false)
    }
  }

  async function handleDecision(registration: RegistrationView, status: 'APPROVED' | 'REJECTED') {
    setBusyId(registration.id)
    try {
      const updated = await tournamentsService.decideRegistration(tournament.id, registration.id, status)
      upsert(updated)
      toast(status === 'APPROVED' ? '✅ Inscrição aprovada.' : '⛔ Inscrição rejeitada.', 'success')
    } catch (error) {
      toast(error instanceof HttpError ? error.message : 'Não foi possível decidir a inscrição.', 'error')
    } finally {
      setBusyId(null)
    }
  }

  async function handleWithdraw(registration: RegistrationView) {
    setBusyId(registration.id)
    try {
      const updated = await tournamentsService.withdrawRegistration(tournament.id, registration.id)
      upsert(updated)
      toast('↩️ Inscrição retirada.', 'success')
    } catch (error) {
      toast(error instanceof HttpError ? error.message : 'Não foi possível retirar a inscrição.', 'error')
    } finally {
      setBusyId(null)
    }
  }

  const myRegistration = registrations?.find((r) => r.registeredById === currentUser.id) ?? null
  const myRegistrationActive = myRegistration?.status === 'PENDING' || myRegistration?.status === 'APPROVED'
  const canRegister = tournament.status === 'PUBLISHED' && !myRegistrationActive

  return (
    <div className={styles.panel}>
      {canRegister && (
        <div className={styles.registerBox}>
          {(tournament.entryKind === 'TEAM' || tournament.entryKind === 'MIXED') &&
            (eligibleTeams.length > 0 ? (
              <div className={styles.registerRow}>
                <select
                  className={styles.select}
                  value={selectedTeamId}
                  onChange={(event) => setSelectedTeamId(event.target.value)}
                >
                  {eligibleTeams.map((team) => (
                    <option key={team.id} value={team.id}>
                      {team.name} [{team.tag}]
                    </option>
                  ))}
                </select>
                <Button onClick={() => handleRegister('TEAM')} disabled={submitting}>
                  Inscrever equipe
                </Button>
              </div>
            ) : (
              <p className={styles.hint}>
                Você precisa ser capitão ou vice-capitão de uma equipe para inscrevê-la.
              </p>
            ))}
          {(tournament.entryKind === 'SOLO' || tournament.entryKind === 'MIXED') && (
            <Button variant="ghost" onClick={() => handleRegister('SOLO')} disabled={submitting}>
              Inscrever-se individualmente
            </Button>
          )}
        </div>
      )}

      {tournament.status !== 'PUBLISHED' && (
        <p className={styles.hint}>Este torneio não está aceitando inscrições no momento.</p>
      )}

      {registrations === null && <div className={styles.state}>Carregando inscrições…</div>}

      {registrations !== null && registrations.length === 0 && (
        <p className={styles.empty}>Nenhuma inscrição ainda.</p>
      )}

      {registrations !== null && registrations.length > 0 && (
        <ul className={styles.list}>
          {registrations.map((registration) => {
            const mine = registration.registeredById === currentUser.id
            const identity = registrationIdentity(registration, allTeams, currentUser.id)
            return (
              <li key={registration.id} className={styles.item}>
                <div className={styles.itemTop}>
                  <span className={styles.identity}>{identity}</span>
                  <span className={styles.regStatus} data-status={registration.status}>
                    {REGISTRATION_STATUS_LABELS[registration.status]}
                  </span>
                </div>
                <p className={styles.meta}>
                  {registration.kind === 'TEAM' ? 'Por equipe' : 'Individual'} · {formatCreatedAt(registration.createdAt)}
                </p>
                <div className={styles.actions}>
                  {isOperator && registration.status === 'PENDING' && (
                    <>
                      <Button
                        variant="ghost"
                        onClick={() => handleDecision(registration, 'APPROVED')}
                        disabled={busyId === registration.id}
                      >
                        ✅ Aprovar
                      </Button>
                      <Button
                        variant="ghost"
                        className={styles.danger}
                        onClick={() => handleDecision(registration, 'REJECTED')}
                        disabled={busyId === registration.id}
                      >
                        ⛔ Rejeitar
                      </Button>
                    </>
                  )}
                  {mine && (registration.status === 'PENDING' || registration.status === 'APPROVED') && (
                    <Button
                      variant="ghost"
                      onClick={() => handleWithdraw(registration)}
                      disabled={busyId === registration.id}
                    >
                      ↩️ Desistir
                    </Button>
                  )}
                </div>
              </li>
            )
          })}
        </ul>
      )}
    </div>
  )
}
