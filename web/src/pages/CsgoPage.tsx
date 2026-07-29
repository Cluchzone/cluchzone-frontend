import { useRef } from 'react'
import { Link } from 'react-router-dom'
import { Button } from '@/design-system/Button'
import { useAuth } from '@/features/auth'
import { GameSignatureKit } from '@/features/games/GameSignatureKit'
import { MatchCenterPanel } from '@/features/matches'
import styles from './CsgoPage.module.css'

/**
 * Porte de csgo.html (Fase 11a — hub CS2).
 *
 * A csgo.html legada era um "kitchen sink": campeonatos (blob global
 * `cluchzone_cs2_camps`), equipes (`cluchzone_cs2_teams`) e rankings/feed/
 * notificações 100% mock. Campeonatos e equipes já foram migrados contra
 * backends endurecidos nas Fases 8 (/tournaments) e 6 (/teams), então aqui o
 * hub apenas encaminha para eles — não reimplementa nem duplica o CRUD. Os
 * rankings/feed/notifs eram dados fictícios sem backend; não são portados
 * (fingir esse estado no cliente é justamente o que a migração elimina).
 *
 * A peça genuinamente nova da página é o Match Center (Fase 11b): automação de
 * servidor dedicado CS2 contra `/api/matches` (endurecido), num widget
 * auto-contido em features/matches/MatchCenterPanel.
 */
export function CsgoPage() {
  const { user, state, login } = useAuth()
  const matchCenterRef = useRef<HTMLElement>(null)

  const sessionState = user ? 'authenticated' : state === 'unavailable' ? 'unavailable' : state
  const sessionLabel =
    sessionState === 'authenticated'
      ? `${user?.displayName} · conectado`
      : sessionState === 'loading'
        ? 'Sincronizando identidade...'
        : sessionState === 'unavailable'
          ? 'Backend indisponível · sessão preservada'
          : 'Entre uma vez para sincronizar sua conta'

  return (
    <div className={styles.page}>
      <div className={styles.bgGrid} aria-hidden="true" />

      <main className={styles.container}>
        <header className={styles.hero}>
          <div className={styles.heroContent}>
            <div className={styles.eyebrow}>
              <span>◈ MATCH CENTER</span>
              <span>REGIÃO SA · CS2</span>
            </div>
            <span className={styles.tag}>ARENA COMPETITIVA CLUTCHZONE</span>
            <h1 className={styles.title}>
              JOGUE COMO UM TIME.<em> VENÇA COMO UM.</em>
            </h1>
            <p className={styles.subtitle}>
              Monte seu roster, encontre o campeonato certo e acompanhe cada etapa do confronto em
              uma central feita para competição.
            </p>

            <div className={styles.heroActions}>
              <Button asChild variant="primary" size="lg">
                <Link to="/tournaments">▶ Buscar campeonato</Link>
              </Button>
              <Button asChild variant="ghost" size="lg">
                <Link to="/teams/new">+ Criar equipe</Link>
              </Button>
            </div>

            <div className={styles.quickActions}>
              <Link to="/tournaments">Criar campeonato</Link>
              <Link to="/teams">
                Gerenciar minhas equipes <span aria-hidden="true">→</span>
              </Link>
            </div>

            <div className={styles.sessionCard} data-state={sessionState}>
              <span className={styles.sessionIcon} aria-hidden="true">
                S
              </span>
              <span className={styles.sessionCopy}>
                <small>SESSÃO STEAM</small>
                <strong>{sessionLabel}</strong>
              </span>
              {sessionState === 'anonymous' && (
                <button type="button" className={styles.sessionLogin} onClick={() => login()}>
                  Entrar
                </button>
              )}
            </div>
          </div>

          <aside className={styles.matchVisual} aria-label="Fluxo de uma partida competitiva">
            <div className={styles.visualTopline}>
              <span>PROTOCOLO DE PARTIDA</span>
              <strong>READY</strong>
            </div>
            <div className={styles.versusCard}>
              <div className={`${styles.side} ${styles.sideTr}`}>
                <span>TR</span>
                <small>SEU TIME</small>
              </div>
              <div className={styles.versusCenter}>
                <small>FORMATO</small>
                <strong>MD1 / MD3</strong>
                <span>VS</span>
              </div>
              <div className={`${styles.side} ${styles.sideCt}`}>
                <span>CT</span>
                <small>ADVERSÁRIO</small>
              </div>
            </div>
            <div className={styles.matchFlow}>
              <div>
                <span>01</span>
                <strong>CHECK-IN</strong>
                <small>Equipe confirmada</small>
              </div>
              <div>
                <span>02</span>
                <strong>VETO</strong>
                <small>Escolha de mapas</small>
              </div>
              <div>
                <span>03</span>
                <strong>LOBBY</strong>
                <small>Partida pronta</small>
              </div>
            </div>
          </aside>
        </header>

        <section className={styles.shortcuts} aria-label="Atalhos do CS2">
          <Link to="/tournaments" className={styles.shortcutCard}>
            <span className={styles.shortcutIcon} aria-hidden="true">
              🏆
            </span>
            <strong>Campeonatos</strong>
            <p>Crie, publique e gerencie campeonatos — inscrições e chaveamento inclusos.</p>
            <span className={styles.shortcutGo} aria-hidden="true">
              Abrir /tournaments →
            </span>
          </Link>
          <Link to="/teams" className={styles.shortcutCard}>
            <span className={styles.shortcutIcon} aria-hidden="true">
              👥
            </span>
            <strong>Equipes & Roster</strong>
            <p>Monte sua equipe tática, gerencie o roster e inscreva o time nos campeonatos.</p>
            <span className={styles.shortcutGo} aria-hidden="true">
              Abrir /teams →
            </span>
          </Link>
        </section>

        <section className={styles.kitSection}>
          <GameSignatureKit
            game="cs2"
            onAction={() => matchCenterRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })}
          />
        </section>

        <section ref={matchCenterRef} className={styles.matchCenterSection}>
          <MatchCenterPanel currentUser={user} authState={state} />
        </section>
      </main>

      <footer className={styles.footer}>
        <div className={styles.footerLogo}>CLUTCHZONE</div>
        <p>© 2026 CLUTCHZONE Esports · Arena competitiva independente de CS2 ⚡</p>
      </footer>
    </div>
  )
}
