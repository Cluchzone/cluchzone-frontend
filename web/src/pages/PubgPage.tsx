import { useEffect, useRef, useState } from 'react'
import { apiFetch } from '@/core/http'
import { AirplaneLobby, prefillSeats, type SeatEntry, type TournamentId, type TournamentsState } from '@/features/pubg'
import { GameSignatureKit } from '@/features/games/GameSignatureKit'
import styles from './PubgPage.module.css'

const STORE_PATH = '/api/store/cluchzone_pubg_tournaments'

const DEFAULT_TOURNAMENTS: TournamentsState = {
  1: { title: 'Erangel Survivor Cup', seats: {} },
  2: { title: 'Miramar Desert Clash', seats: {} },
}

/**
 * Porte de pubg.html. Diferente do Brawl Stars (Fase 3), o lobby do avião
 * aqui é interativo de verdade em produção: pubg.js referencia os mesmos IDs
 * que existem no HTML atual, o timer/seleção de assento/tooltip funcionam, e
 * o estado é persistido em /api/store/cluchzone_pubg_tournaments — mesma
 * chave e formato usados pelo legado, para os dois ficarem compatíveis
 * enquanto convivem durante a migração.
 */
export function PubgPage() {
  const [tournaments, setTournaments] = useState<TournamentsState>(DEFAULT_TOURNAMENTS)
  const [activeTourId, setActiveTourId] = useState<TournamentId | null>(null)
  const [openToken, setOpenToken] = useState(0)
  const cursorRef = useRef<HTMLDivElement>(null)
  const tournamentsRef = useRef<HTMLDivElement>(null)

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

  useEffect(() => {
    let ignore = false
    apiFetch<{ value: TournamentsState | null }>(STORE_PATH)
      .then((response) => {
        if (ignore || !response?.value) return
        setTournaments((prev) => ({
          1: { title: prev[1].title, seats: response.value?.[1]?.seats ?? prev[1].seats },
          2: { title: prev[2].title, seats: response.value?.[2]?.seats ?? prev[2].seats },
        }))
      })
      .catch(() => {})
    return () => {
      ignore = true
    }
  }, [])

  function persist(next: TournamentsState) {
    void apiFetch(STORE_PATH, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ value: next }),
    }).catch(() => {})
  }

  function handleOpenTournament(id: TournamentId) {
    setTournaments((prev) => {
      if (Object.keys(prev[id].seats).length > 0) return prev
      const next = { ...prev, [id]: { ...prev[id], seats: prefillSeats() } }
      persist(next)
      return next
    })
    setActiveTourId(id)
    setOpenToken((token) => token + 1)
  }

  function handleSeatChange(seatNumber: number, entry: SeatEntry | null) {
    if (activeTourId === null) return
    setTournaments((prev) => {
      const seats = { ...prev[activeTourId].seats }
      if (entry) seats[seatNumber] = entry
      else delete seats[seatNumber]
      const next = { ...prev, [activeTourId]: { ...prev[activeTourId], seats } }
      persist(next)
      return next
    })
  }

  return (
    <div className={styles.page}>
      <div ref={cursorRef} className={styles.cursorGlow} aria-hidden="true" />
      <div className={styles.bgGrid} aria-hidden="true" />
      <div className={styles.fogEffect} aria-hidden="true" />

      <main className={styles.container}>
        <header className={styles.hero}>
          <div className={styles.heroContent}>
            <div className={styles.logoRow}>
              <span className={styles.gameIcon} aria-hidden="true">
                ✈️
              </span>
              <h1 className={styles.title}>PUBG BATTLEGROUNDS</h1>
            </div>
            <p className={styles.subtitle}>
              Selecione seu assento no avião de transporte C-130 e prepare-se para o Drop.
              Sobreviva até o fim.
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
              game="pubg"
              onAction={() => tournamentsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })}
            />
          </div>
        </header>

        <section ref={tournamentsRef} className={styles.tournamentsSection}>
          <div className={styles.sectionHeader}>
            <h2>🏆 CAMPEONATOS PUBG DISPONÍVEIS</h2>
            <p>Inscreva-se nos torneios ativos e reserve seu assento de drop.</p>
          </div>

          <div className={styles.tournamentsGrid}>
            <article className={styles.tourCard}>
              <div className={styles.tourHeader}>
                <span className={styles.badgeType}>DUO / SQUAD</span>
                <span className={styles.prize}>R$ 10.000</span>
              </div>
              <h3>Erangel Survivor Cup</h3>
              <div className={styles.tourDetails}>
                <span>📅 Hoje às 20:00</span>
                <span>📍 Servidor: SA</span>
                <span>
                  ✈️ Lotação: <strong>74</strong>/100
                </span>
              </div>
              <div className={styles.progressBar}>
                <div className={styles.progressFill} style={{ width: '74%' }} />
              </div>
              <button type="button" className={styles.btnAction} onClick={() => handleOpenTournament(1)}>
                RESERVAR ASSENTO
              </button>
            </article>

            <article className={styles.tourCard}>
              <div className={styles.tourHeader}>
                <span className={styles.badgeType}>SOLO</span>
                <span className={styles.prize}>R$ 5.000</span>
              </div>
              <h3>Miramar Desert Clash</h3>
              <div className={styles.tourDetails}>
                <span>📅 Amanhã às 18:00</span>
                <span>📍 Servidor: SA</span>
                <span>
                  ✈️ Lotação: <strong>42</strong>/100
                </span>
              </div>
              <div className={styles.progressBar}>
                <div className={styles.progressFill} style={{ width: '42%' }} />
              </div>
              <button type="button" className={styles.btnAction} onClick={() => handleOpenTournament(2)}>
                RESERVAR ASSENTO
              </button>
            </article>

            <article className={styles.tourCard}>
              <div className={styles.tourHeader}>
                <span className={styles.badgeType}>SQUAD FPP</span>
                <span className={styles.prize}>R$ 20.000</span>
              </div>
              <h3>CLUTCHZONE PUBG Masters</h3>
              <div className={styles.tourDetails}>
                <span>📅 Sábado às 15:00</span>
                <span>📍 Servidor: SA</span>
                <span>
                  ✈️ Lotação: <strong>0</strong>/100
                </span>
              </div>
              <div className={styles.progressBar}>
                <div className={styles.progressFill} style={{ width: '0%' }} />
              </div>
              <button type="button" className={`${styles.btnAction} ${styles.disabled}`} disabled>
                INSCRIÇÕES EM BREVE
              </button>
            </article>
          </div>
        </section>

        {activeTourId !== null && (
          <AirplaneLobby
            key={openToken}
            title={tournaments[activeTourId].title}
            seats={tournaments[activeTourId].seats}
            onSeatChange={handleSeatChange}
          />
        )}
      </main>

      <footer className={styles.footer}>
        <div className={styles.footerLogo}>CLUTCHZONE</div>
        <p>© 2026 CLUTCHZONE Esports · Licenciado para PUBG Battlegrounds Tournaments ⚡</p>
      </footer>
    </div>
  )
}
