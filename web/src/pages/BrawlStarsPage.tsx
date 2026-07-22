import { useEffect, useRef } from 'react'
import { GameSignatureKit } from '@/features/games/GameSignatureKit'
import styles from './BrawlStarsPage.module.css'

/**
 * Porte de brawlstars.html. Hoje em produção a mina de gemas e os slots de
 * equipe são visuais mas não interativos: brawlstars.js referencia
 * #gem-core/#blue-team/#red-team/#notification, IDs que não existem no HTML
 * atual (#active-gem/#blue-slots/#red-slots) — o clique na gema e o preenchimento
 * de slot nunca funcionaram de fato. O modal de seleção de Brawler também nunca
 * é aberto por nada. Este porte replica o comportamento real (estático), não o
 * que o JS órfão sugere ser a intenção original.
 */
export function BrawlStarsPage() {
  const cursorRef = useRef<HTMLDivElement>(null)
  const arenaRef = useRef<HTMLDivElement>(null)

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

  return (
    <div className={styles.page}>
      <div ref={cursorRef} className={styles.cursorGlow} aria-hidden="true" />
      <div className={styles.bgStars} aria-hidden="true" />

      <header className={styles.hero}>
        <div className={styles.heroContent}>
          <div className={styles.logoRow}>
            <span className={styles.starIcon} aria-hidden="true">
              ⭐
            </span>
            <h1 className={`${styles.lilita} ${styles.title}`}>BRAWL STARS CLASH</h1>
          </div>
          <p className={styles.subtitle}>
            Pegue Gemas da mina para reivindicar sua vaga nos lobbies 3v3 de Gem Grab. Escolha
            seu Brawler e brigue!
          </p>
          <div className={styles.heroActions}>
            <a className={styles.createButton} href="create-tournament.html">
              Criar Campeonato
            </a>
            <button type="button" className={styles.exploreButton}>
              Explorar Campeonatos
            </button>
          </div>

          <GameSignatureKit
            game="brawl"
            onAction={() => arenaRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })}
          />
        </div>
      </header>

      <main className={styles.container}>
        <section className={styles.tournamentsSection}>
          <div className={styles.sectionTitle}>
            <h2 className={styles.lilita}>🏆 TORNEIOS BRAWL STARS</h2>
            <p>Inscreva-se clicando nas gemas da mina para reservar seu espaço!</p>
          </div>

          <div className={styles.tabs}>
            <div className={`${styles.tab} ${styles.tabActive}`}>
              <div className={`${styles.tabBadge} ${styles.badgeGemGrab}`}>GEM GRAB</div>
              <div className={`${styles.tabName} ${styles.lilita}`}>Brawl Cup Brasil #1</div>
              <div className={styles.tabPrize}>🏆 R$ 3.000</div>
            </div>
            <div className={styles.tab}>
              <div className={`${styles.tabBadge} ${styles.badgeBrawlBall}`}>BRAWL BALL</div>
              <div className={`${styles.tabName} ${styles.lilita}`}>Star League Qualifier</div>
              <div className={styles.tabPrize}>🏆 R$ 1.500</div>
            </div>
          </div>
        </section>

        <section ref={arenaRef} className={styles.arenaLobby}>
          <div className={styles.gridLayout}>
            <div className={`${styles.team} ${styles.blueTeam}`}>
              <h3 className={`${styles.lilita} ${styles.teamTitle} ${styles.teamTitleBlue}`}>
                EQUIPE AZUL
              </h3>
              <div className={styles.slotsContainer} />
            </div>

            <div className={styles.mineContainer}>
              <h4 className={`${styles.lilita} ${styles.mineHeading}`}>MINA DE GEMAS</h4>
              <p className={styles.mineNote}>Clique em uma gema brilhante para preencher um slot vago!</p>

              <div className={styles.mineCore}>
                <div className={styles.mineHole}>
                  <div className={styles.activeGem}>💎</div>
                </div>
                <div className={styles.glowRing} />
              </div>

              <div className={`${styles.lilita} ${styles.mineStatus}`}>GEMA DISPONÍVEL!</div>
            </div>

            <div className={`${styles.team} ${styles.redTeam}`}>
              <h3 className={`${styles.lilita} ${styles.teamTitle} ${styles.teamTitleRed}`}>
                EQUIPE VERMELHA
              </h3>
              <div className={styles.slotsContainer} />
            </div>
          </div>
        </section>
      </main>

      <footer className={styles.footer}>
        <div className={styles.footerLogo}>CLUTCHZONE</div>
        <p>© 2026 CLUTCHZONE Esports · Torneios de Brawl Stars ⚡</p>
      </footer>
    </div>
  )
}
