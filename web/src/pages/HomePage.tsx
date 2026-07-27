import { useEffect, useRef } from 'react'
import { Link } from 'react-router-dom'
import { useToast } from '@/design-system/Toast'
import styles from './HomePage.module.css'

type GameTheme = 'pubg' | 'csgo' | 'brawl' | 'val' | 'apex' | 'r6' | 'cod' | 'lol'
type GameBadge = 'new' | 'hot' | 'live' | 'soon'

type GameCard = {
  key: string
  theme: GameTheme
  featured?: boolean
  badge: GameBadge
  badgeLabel: string
  tag: string
  title: string
  meta: string[]
  to?: string
  ctaLabel: string
}

const GAME_CARDS: GameCard[] = [
  {
    key: 'pubg',
    theme: 'pubg',
    featured: true,
    badge: 'hot',
    badgeLabel: '🔥 EM ALTA',
    tag: 'BATTLE ROYALE',
    title: 'PUBG',
    meta: ['✈️ Fila no Avião', '👥 Até 100 Players', '🏆 12 Campeonatos Ativos'],
    to: '/pubg',
    ctaLabel: 'Entrar na Arena →',
  },
  {
    key: 'csgo',
    theme: 'csgo',
    badge: 'live',
    badgeLabel: '🔴 AO VIVO',
    tag: 'FPS TÁTICO',
    title: 'CS2',
    meta: ['💣 Base TR vs CT', '🏆 8 Campeonatos'],
    to: '/csgo',
    ctaLabel: 'Entrar na Arena →',
  },
  {
    key: 'brawl',
    theme: 'brawl',
    badge: 'new',
    badgeLabel: '✨ NOVO',
    tag: 'SUPERCELL',
    title: 'BRAWL STARS',
    meta: ['💎 Arena de Gems', '🏆 6 Campeonatos'],
    to: '/brawlstars',
    ctaLabel: 'Entrar na Arena →',
  },
  {
    key: 'valorant',
    theme: 'val',
    badge: 'soon',
    badgeLabel: '🔵 EM BREVE',
    tag: 'FPS TÁTICO',
    title: 'VALORANT',
    meta: ['🔫 5v5', '🏆 Em Breve'],
    ctaLabel: 'Em Breve',
  },
  {
    key: 'apex',
    theme: 'apex',
    badge: 'soon',
    badgeLabel: '🔵 EM BREVE',
    tag: 'BATTLE ROYALE',
    title: 'APEX LEGENDS',
    meta: ['🔥 Squads', '🏆 Em Breve'],
    ctaLabel: 'Em Breve',
  },
  {
    key: 'r6',
    theme: 'r6',
    badge: 'soon',
    badgeLabel: '🔵 EM BREVE',
    tag: 'FPS TÁTICO',
    title: 'RAINBOW SIX',
    meta: ['💣 5v5', '🏆 Em Breve'],
    ctaLabel: 'Em Breve',
  },
  {
    key: 'cod',
    theme: 'cod',
    badge: 'soon',
    badgeLabel: '🔵 EM BREVE',
    tag: 'FPS',
    title: 'CALL OF DUTY',
    meta: ['💥 Warzone', '🏆 Em Breve'],
    ctaLabel: 'Em Breve',
  },
  {
    key: 'lol',
    theme: 'lol',
    badge: 'soon',
    badgeLabel: '🔵 EM BREVE',
    tag: 'MOBA',
    title: 'LEAGUE OF LEGENDS',
    meta: ['⚔️ 5v5', '🏆 Em Breve'],
    ctaLabel: 'Em Breve',
  },
]

const STATS: { value: string; label: string; color?: string }[] = [
  { value: '148k', label: 'Jogadores Ativos' },
  { value: '3.2k', label: 'Campeonatos' },
  { value: '8', label: 'Jogos' },
  { value: 'R$2.4M', label: 'Em Premiações' },
  { value: '5', label: '🔴 Ao Vivo Agora', color: 'var(--pink)' },
]

const TICKER_ITEMS = [
  '🎯 NEXUS8 vs SHOCKWAVE — CS2 Copa CLUTCHZONE Semis — 14:11',
  '✈️ PUBG Invitational — 78/100 jogadores na fila',
  '⭐ Brawl Stars Open — Quarterfinals em andamento',
  '🔫 CS2 — GHOST5 elimina IRON WOLVES 13:7',
]

const BADGE_CLASS: Record<GameBadge, string> = {
  new: styles.badgeNew,
  hot: styles.badgeHot,
  live: styles.badgeLive,
  soon: styles.badgeSoon,
}

/**
 * Porte de index.html. A navbar/live-badge/botões de login legados somem —
 * já são cobertos pela Navbar global (RootLayout). O canvas de partículas e o
 * contador animado das estatísticas eram só flourish decorativo sem valor
 * funcional (mesma decisão tomada nas Fases 3/4 para o cursor-glow/bg
 * animado): aqui os números ficam estáticos. Os 8 cards de jogo trocam as
 * fotos de fundo (~800KB–1MB cada, nunca usadas em nenhuma página já
 * portada) por gradientes temáticos por jogo, mantendo a cor de destaque de
 * cada card do legado.
 */
export function HomePage() {
  const toast = useToast()
  const cursorRef = useRef<HTMLDivElement>(null)
  const gamesRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function handleMouseMove(event: MouseEvent) {
      const glow = cursorRef.current
      if (!glow) return
      glow.style.left = `${event.clientX}px`
      glow.style.top = `${event.clientY}px`
    }
    document.addEventListener('mousemove', handleMouseMove)
    return () => document.removeEventListener('mousemove', handleMouseMove)
  }, [])

  function handleComingSoon(title: string) {
    toast(`🔵 ${title} estará disponível em breve!`, 'info')
  }

  return (
    <div className={styles.page}>
      <div ref={cursorRef} className={styles.cursorGlow} aria-hidden="true" />

      <section className={styles.hero}>
        <div className={styles.heroBg} aria-hidden="true" />
        <div className={styles.heroGrid} aria-hidden="true" />
        <div className={styles.heroContent}>
          <div className={styles.logoRow}>
            <span className={styles.logoIcon} aria-hidden="true">
              ⚡
            </span>
            <h1 className={styles.logoText}>CLUTCHZONE</h1>
          </div>
          <p className={styles.tagline}>Escolha seu jogo. Entre na fila. Domine.</p>
          <div className={styles.badgeRow}>
            <span className={`${styles.badge} ${styles.badgeLiveRow}`}>
              <span className={styles.liveDot} aria-hidden="true" /> 5 Partidas Ao Vivo
            </span>
            <span className={styles.badge}>🏆 R$ 2.4M em Premiações</span>
            <span className={styles.badge}>👥 148k Jogadores</span>
            <span className={styles.badge}>🎮 8 Jogos</span>
          </div>
          <div className={styles.heroActions}>
            <button
              type="button"
              className={styles.ctaPrimary}
              onClick={() => gamesRef.current?.scrollIntoView({ behavior: 'smooth' })}
            >
              ESCOLHER JOGO →
            </button>
            <Link to="/teams/new" className={styles.ctaSecondary}>
              🛡️ CRIAR EQUIPE
            </Link>
          </div>
        </div>
      </section>

      <div className={styles.ticker} aria-hidden="true">
        <div className={styles.tickerInner}>
          <span className={styles.tickerLabel}>🔴 AO VIVO</span>
          <div className={styles.tickerTrack}>
            <div className={styles.tickerContent}>
              {[...TICKER_ITEMS, ...TICKER_ITEMS].map((item, index) => (
                <span key={index} className={styles.tickerItem}>
                  {item}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className={styles.statsStrip}>
        <div className={styles.statsInner}>
          {STATS.map((stat) => (
            <div key={stat.label} className={styles.statItem}>
              <div className={styles.statNum} style={stat.color ? { color: stat.color } : undefined}>
                {stat.value}
              </div>
              <div className={styles.statLabel}>{stat.label}</div>
            </div>
          ))}
        </div>
      </div>

      <section id="games" ref={gamesRef} className={styles.gamesSection}>
        <div className={styles.sectionHead}>
          <h2 className={styles.sectionTitle}>
            ESCOLHA SEU <span className={styles.accent}>JOGO</span>
          </h2>
          <p className={styles.sectionSub}>Cada jogo tem sua própria arena com mecânicas únicas</p>
        </div>

        <div className={styles.gamesGrid}>
          {GAME_CARDS.map((game) => {
            const cardClassName = `${styles.card} ${game.featured ? styles.featured : ''}`
            const content = (
              <>
                <div className={styles.cardBg} data-theme={game.theme} aria-hidden="true" />
                {game.theme === 'pubg' && (
                  <div className={styles.pubgPlane} aria-hidden="true">
                    ✈️
                  </div>
                )}
                {game.theme === 'csgo' && <div className={styles.csgoSplit} aria-hidden="true" />}
                {game.theme === 'brawl' && (
                  <div className={styles.brawlGems} aria-hidden="true">
                    <span className={styles.gem}>💎</span>
                    <span className={styles.gem}>⭐</span>
                    <span className={styles.gem}>💎</span>
                    <span className={styles.gem}>⭐</span>
                  </div>
                )}
                <div className={styles.cardOverlay} data-theme={game.theme} aria-hidden="true" />
                <span className={`${styles.cardBadge} ${BADGE_CLASS[game.badge]}`}>{game.badgeLabel}</span>
                <div className={styles.cardContent}>
                  <span className={styles.cardTag} data-theme={game.theme}>
                    {game.tag}
                  </span>
                  <div className={styles.cardTitle}>{game.title}</div>
                  <div className={styles.cardMeta}>
                    {game.meta.map((item) => (
                      <span key={item}>{item}</span>
                    ))}
                  </div>
                  <div className={`${styles.cardBtn} ${game.to ? '' : styles.cardBtnSoon}`}>{game.ctaLabel}</div>
                </div>
              </>
            )

            if (game.to) {
              return (
                <Link key={game.key} to={game.to} className={cardClassName} data-theme={game.theme}>
                  {content}
                </Link>
              )
            }

            return (
              <button
                key={game.key}
                type="button"
                className={cardClassName}
                data-theme={game.theme}
                onClick={() => handleComingSoon(game.title)}
              >
                {content}
              </button>
            )
          })}
        </div>
      </section>

      <footer className={styles.footer}>
        <div className={styles.footerLogo}>CLUTCHZONE</div>
        <p>© 2026 CLUTCHZONE Esports · Feito para a cena competitiva brasileira ⚡</p>
      </footer>
    </div>
  )
}
