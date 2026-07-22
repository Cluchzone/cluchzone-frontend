import { useEffect, useRef, useState, type MouseEvent as ReactMouseEvent } from 'react'
import { useToast } from '@/design-system/Toast'
import type { SeatEntry, TournamentSeats } from './types'
import styles from './AirplaneLobby.module.css'

const ROWS = 25
const TOTAL = 100

type TooltipState = { x: number; y: number; data: SeatEntry }

type AirplaneLobbyProps = {
  title: string
  seats: TournamentSeats
  onSeatChange: (seatNumber: number, entry: SeatEntry | null) => void
}

/**
 * Monta com `key` trocada a cada clique em "RESERVAR ASSENTO" (mesmo reabrindo
 * o mesmo campeonato) — replica o pubg.js legado, que zera `mySeats` a cada
 * chamada de `openLobby()` mesmo com `tour.seats` persistido. Um assento que
 * era "seu" antes do remount aparece de novo com tooltip rico (como no
 * legado), não mais com o `title` simples de seleção.
 */
export function AirplaneLobby({ title, seats, onSeatChange }: AirplaneLobbyProps) {
  const toast = useToast()
  const [mySeats, setMySeats] = useState<Set<number>>(new Set())
  const [timeLeft, setTimeLeft] = useState(14 * 60 + 59)
  const [tooltip, setTooltip] = useState<TooltipState | null>(null)
  const sectionRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    sectionRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }, [])

  useEffect(() => {
    const handle = window.setInterval(() => {
      setTimeLeft((prev) => (prev <= 0 ? 0 : prev - 1))
    }, 1000)
    return () => window.clearInterval(handle)
  }, [])

  function handleSeatClick(seatNumber: number) {
    if (mySeats.has(seatNumber)) {
      setMySeats((prev) => {
        const next = new Set(prev)
        next.delete(seatNumber)
        return next
      })
      onSeatChange(seatNumber, null)
      toast(`Assento ${seatNumber} liberado.`, 'info')
    } else {
      setMySeats((prev) => new Set(prev).add(seatNumber))
      onSeatChange(seatNumber, {
        status: 'mine',
        nick: '✈ VOCÊ',
        rank: 'Seu Assento',
        kd: '-',
        wins: '-',
        rep: '100%',
      })
      toast(`✅ Assento ${seatNumber} reservado! Boa sorte!`, 'success')
    }
  }

  function positionTooltip(clientX: number, clientY: number) {
    let x = clientX + 16
    let y = clientY + 16
    if (x + 200 > window.innerWidth) x = clientX - 210
    if (y + 120 > window.innerHeight) y = clientY - 130
    return { x, y }
  }

  function handleTooltipShow(event: ReactMouseEvent, data: SeatEntry) {
    setTooltip({ ...positionTooltip(event.clientX, event.clientY), data })
  }
  function handleTooltipMove(event: ReactMouseEvent) {
    setTooltip((prev) => (prev ? { ...prev, ...positionTooltip(event.clientX, event.clientY) } : prev))
  }
  function handleTooltipHide() {
    setTooltip(null)
  }

  function renderSeat(seatNumber: number) {
    const isMine = mySeats.has(seatNumber)
    const data = seats[seatNumber]
    const status = isMine ? 'mine' : data ? data.status : 'available'
    const isOccupiedByOthers = !isMine && !!data
    const isAvailable = !isMine && !data

    return (
      <div
        key={seatNumber}
        className={`${styles.seat} ${styles[status]}`}
        title={isMine ? 'Seu assento' : undefined}
        onClick={isAvailable ? () => handleSeatClick(seatNumber) : undefined}
        onMouseEnter={isOccupiedByOthers ? (event) => handleTooltipShow(event, data) : undefined}
        onMouseMove={isOccupiedByOthers ? handleTooltipMove : undefined}
        onMouseLeave={isOccupiedByOthers ? handleTooltipHide : undefined}
      >
        {seatNumber}
      </div>
    )
  }

  // Réplica fiel do cálculo do legado (pubg.js::updateSummary): um assento
  // recém-selecionado nesta sessão é contado tanto no laço abaixo (status
  // 'mine' em `seats`) quanto em `+ mySeats.size` — double count real em
  // produção, não um bug introduzido aqui.
  let confirmed = 0
  let pending = 0
  Object.values(seats).forEach((seat) => {
    if (seat.status === 'confirmed') confirmed++
    else if (seat.status === 'pending') pending++
    else if (seat.status === 'mine') confirmed++
  })
  const summaryConfirmed = confirmed + mySeats.size
  const summaryPending = pending
  const summaryAvailable = TOTAL - confirmed - pending - mySeats.size
  const occupancy = Object.keys(seats).length

  const minutes = String(Math.floor(Math.max(timeLeft, 0) / 60)).padStart(2, '0')
  const seconds = String(Math.max(timeLeft, 0) % 60).padStart(2, '0')

  return (
    <section ref={sectionRef} className={styles.lobby}>
      <div className={styles.header}>
        <h2>✈️ AVIÃO — 100 ASSENTOS / 50 DUOs</h2>
        <p>
          Campeonato: <span className={styles.highlightTour}>{title}</span>
        </p>
      </div>

      <div className={styles.controls}>
        <div className={styles.countdownBox}>
          <span className={styles.countdownTitle}>DECOLAGEM EM:</span>
          <span className={styles.countdownTimer}>
            {minutes}:{seconds}
          </span>
        </div>
        <div className={styles.statsBox}>
          <span>
            👥 LOBBY: <strong>{occupancy}/{TOTAL}</strong>
          </span>
          <span className={styles.statusText}>Aguardando preenchimento total</span>
        </div>
      </div>

      <div className={styles.airplaneCard}>
        <div className={styles.legend}>
          <div className={styles.legendItem}>
            <div className={`${styles.legendDot} ${styles.confirmed}`} /> Confirmado
          </div>
          <div className={styles.legendItem}>
            <div className={`${styles.legendDot} ${styles.pending}`} /> Pendente
          </div>
          <div className={styles.legendItem}>
            <div className={`${styles.legendDot} ${styles.available}`} /> Disponível
          </div>
          <div className={styles.legendItem}>
            <div className={`${styles.legendDot} ${styles.mine}`} /> Seu assento
          </div>
        </div>

        <div className={styles.planeGrid}>
          <div className={styles.planeGridHeader}>
            <div />
            <div className={styles.colLabel}>← ESQUERDO (1-50)</div>
            <div className={styles.aisleLabel}>CORREDOR</div>
            <div className={styles.colLabel}>DIREITO (51-100) →</div>
            <div />
          </div>

          {Array.from({ length: ROWS }, (_, i) => i + 1).map((row) => {
            const l1 = (row - 1) * 2 + 1
            const l2 = (row - 1) * 2 + 2
            const r1 = 50 + (row - 1) * 2 + 1
            const r2 = 50 + (row - 1) * 2 + 2
            return (
              <div key={row} className={styles.planeRow}>
                <div className={styles.planeRowNum}>{row}</div>
                <div className={styles.seatPair}>
                  {renderSeat(l1)}
                  {renderSeat(l2)}
                </div>
                <div className={styles.aisleDivider} />
                <div className={styles.seatPair}>
                  {renderSeat(r1)}
                  {renderSeat(r2)}
                </div>
                <div className={styles.planeRowNum}>{row}</div>
              </div>
            )
          })}
        </div>

        <div className={styles.summary}>
          <div className={styles.summaryItem}>
            <div className={`${styles.summaryNum} ${styles.confirmed}`}>{summaryConfirmed}</div>
            <div className={styles.summaryLabel}>Confirmados</div>
          </div>
          <div className={styles.summaryItem}>
            <div className={`${styles.summaryNum} ${styles.pending}`}>{summaryPending}</div>
            <div className={styles.summaryLabel}>Pendentes</div>
          </div>
          <div className={styles.summaryItem}>
            <div className={`${styles.summaryNum} ${styles.available}`}>{summaryAvailable}</div>
            <div className={styles.summaryLabel}>Disponíveis</div>
          </div>
        </div>
      </div>

      {tooltip && (
        <div className={styles.tooltip} style={{ left: tooltip.x, top: tooltip.y }}>
          <div className={styles.tooltipHeader}>
            <span className={styles.tooltipAvatar}>🎮</span>
            <div>
              <div className={styles.tooltipNick}>{tooltip.data.nick}</div>
              <div className={styles.tooltipRank}>{tooltip.data.rank}</div>
            </div>
          </div>
          <div className={styles.tooltipStats}>
            <div className={styles.tStat}>
              <span>K/D:</span> <strong>{tooltip.data.kd}</strong>
            </div>
            <div className={styles.tStat}>
              <span>Vitórias:</span> <strong>{tooltip.data.wins}</strong>
            </div>
            <div className={styles.tStat}>
              <span>Reputação:</span> <strong className={styles.greenText}>{tooltip.data.rep}</strong>
            </div>
          </div>
        </div>
      )}
    </section>
  )
}
