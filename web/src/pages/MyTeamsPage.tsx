import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Button } from '@/design-system/Button'
import { useToast } from '@/design-system/Toast'
import { useAuth } from '@/features/auth'
import { HttpError } from '@/core/http'
import { regionLabelPt, teamsService, TeamChat, type TeamMemberView, type TeamView } from '@/features/teams'
import styles from './MyTeamsPage.module.css'

const ROLE_LABELS: Record<TeamMemberView['role'], string> = {
  CAPTAIN: 'Capitão',
  VICE_CAPTAIN: 'Vice-Capitão',
  PLAYER: 'Titular',
  RESERVE: 'Reserva',
}

const ROLE_BADGE_CLASS: Record<TeamMemberView['role'], string> = {
  CAPTAIN: 'badgeCaptain',
  VICE_CAPTAIN: 'badgeVice',
  PLAYER: 'badgePlayer',
  RESERVE: 'badgeReserve',
}

function rosterOrder(members: TeamMemberView[]): TeamMemberView[] {
  const rank: Record<TeamMemberView['role'], number> = { CAPTAIN: 0, VICE_CAPTAIN: 1, PLAYER: 2, RESERVE: 3 }
  return [...members].sort((a, b) => rank[a.role] - rank[b.role])
}

/**
 * Porte de my-teams.html restrito ao que /api/teams garante hoje: criar,
 * listar minhas equipes e chat privado. O legado também tinha convite,
 * promoção, remoção, edição e dissolução de equipe — tudo via localStorage,
 * sem endpoint real. Não replicamos essas ações aqui (ver decisão da Fase 6
 * em MIGRATION.md/CHANGELOG.md): fingir autorização que o backend não tem
 * cria estado divergente entre navegador e realidade.
 */
export function MyTeamsPage() {
  const { user, state, login } = useAuth()
  const toast = useToast()
  const [teams, setTeams] = useState<TeamView[] | null>(null)
  const [selectedTeamId, setSelectedTeamId] = useState<string>('')

  useEffect(() => {
    if (state !== 'authenticated') return
    let ignore = false
    teamsService
      .listMine()
      .then((fresh) => {
        if (ignore) return
        setTeams(fresh)
        setSelectedTeamId((current) => current || fresh[0]?.id || '')
      })
      .catch((error) => {
        if (ignore) return
        toast(error instanceof HttpError ? error.message : 'Não foi possível carregar suas equipes.', 'error')
        setTeams([])
      })
    return () => {
      ignore = true
    }
  }, [state, toast])

  if (state === 'loading') {
    return <div className={styles.container}>Sincronizando sessão…</div>
  }

  if (state !== 'authenticated' || !user) {
    return (
      <div className={styles.gate}>
        <p className={styles.gateBadge}>Área restrita</p>
        <h1 className={styles.gateTitle}>Entre com Steam para ver suas equipes</h1>
        <Button onClick={() => login()}>Entrar com Steam</Button>
      </div>
    )
  }

  if (teams === null) {
    return <div className={styles.container}>Carregando suas equipes…</div>
  }

  const selectedTeam = teams.find((team) => team.id === selectedTeamId) ?? null

  return (
    <div className={styles.container}>
      <div className={styles.selectorRow}>
        <div>
          <label className={styles.selectorLabel} htmlFor="active-team-selector">
            Selecionar equipe
          </label>
          <select
            id="active-team-selector"
            className={styles.selector}
            value={selectedTeamId}
            disabled={teams.length === 0}
            onChange={(event) => setSelectedTeamId(event.target.value)}
          >
            {teams.length === 0 && <option value="">Nenhuma equipe associada</option>}
            {teams.map((team) => (
              <option key={team.id} value={team.id}>
                {team.name} [{team.tag}]
              </option>
            ))}
          </select>
        </div>
        <Button asChild>
          <Link to="/teams/new">🛡️ Criar Nova Equipe</Link>
        </Button>
      </div>

      {!selectedTeam && (
        <div className={styles.empty}>Você ainda não faz parte de nenhuma equipe tática de eSports.</div>
      )}

      {selectedTeam && (
        <div className={styles.layout}>
          <div>
            <header className={styles.header}>
              <div className={styles.headerNameRow}>
                <h1 className={styles.headerName}>{selectedTeam.name}</h1>
                <span className={styles.headerTag}>{selectedTeam.tag}</span>
              </div>
              <p className={styles.headerMeta}>
                Região: {regionLabelPt(selectedTeam.region)} · {selectedTeam.members.length} membros
              </p>
              {selectedTeam.description && <p className={styles.headerDesc}>{selectedTeam.description}</p>}
            </header>

            <section className={styles.card}>
              <h2 className={styles.cardTitle}>🛡️ Elenco da Equipe</h2>
              <div className={styles.roster}>
                {rosterOrder(selectedTeam.members).map((member) => (
                  <div key={member.userId} className={styles.rosterItem}>
                    <span className={styles.rosterNick}>{member.displayName}</span>
                    <span className={[styles.badge, styles[ROLE_BADGE_CLASS[member.role]]].join(' ')}>
                      {ROLE_LABELS[member.role]}
                    </span>
                  </div>
                ))}
              </div>
            </section>
          </div>

          <div>
            <section className={styles.card}>
              <h2 className={styles.cardTitle}>💬 Chat da Equipe</h2>
              <TeamChat teamId={selectedTeam.id} currentUserId={user.id} />
            </section>
          </div>
        </div>
      )}
    </div>
  )
}
