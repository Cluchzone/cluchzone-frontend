import { useEffect, useRef, useState } from 'react'
import { inventoryService } from './inventoryService'
import type { ShowcaseGameKey, ShowcaseHighlight } from './types'
import styles from './SteamShowcase.module.css'

const GAMES: { key: ShowcaseGameKey; name: string; shortName: string; description: string }[] = [
  { key: 'cs2', name: 'Counter-Strike 2', shortName: 'CS2', description: 'Skins, armas, facas, luvas e colecionáveis' },
  { key: 'pubg', name: 'PUBG: Battlegrounds', shortName: 'PUBG', description: 'Armas, trajes, caixas e itens públicos' },
]

const REFRESH_INTERVAL_MS = 30000

type GameState = { status: 'loading' | 'ready' | 'unavailable'; highlights: ShowcaseHighlight[]; total: number }

/**
 * Vitrine pública do inventário Steam (porte de renderSteamGameShowcases em
 * passport.js). Só mostra um jogo se ele tiver exatamente 4 itens públicos
 * qualificados (mesma regra do backend/legado) — sem isso o card some, não
 * aparece vazio. Se o dono ocultar a vitrine, o card inteiro desaparece
 * quando não há nada para mostrar, igual à produção atual.
 */
export function SteamShowcase({ userId, playerName }: { userId: string; playerName: string }) {
  const [visible, setVisible] = useState<boolean | null>(null)
  const [togglePending, setTogglePending] = useState(false)
  const [games, setGames] = useState<Record<ShowcaseGameKey, GameState>>({
    cs2: { status: 'loading', highlights: [], total: 0 },
    pubg: { status: 'loading', highlights: [], total: 0 },
  })
  const mountedRef = useRef(true)

  useEffect(() => {
    mountedRef.current = true
    return () => {
      mountedRef.current = false
    }
  }, [])

  useEffect(() => {
    inventoryService
      .getShowcaseVisibility()
      .then((result) => mountedRef.current && setVisible(result))
      .catch(() => mountedRef.current && setVisible(true))
  }, [])

  async function hydrate() {
    for (const game of GAMES) {
      inventoryService
        .getShowcaseInventory(userId, game.key)
        .then((payload) => {
          if (!mountedRef.current) return
          const highlights = payload.highlights ?? []
          setGames((current) => ({
            ...current,
            [game.key]: {
              status: highlights.length === 4 ? 'ready' : 'unavailable',
              highlights,
              total: payload.inventory?.total ?? 0,
            },
          }))
        })
        .catch(() => {
          if (mountedRef.current) {
            setGames((current) => ({ ...current, [game.key]: { status: 'unavailable', highlights: [], total: 0 } }))
          }
        })
    }
  }

  useEffect(() => {
    if (visible !== true) return
    void hydrate()
    const interval = window.setInterval(() => {
      if (!document.hidden) void hydrate()
    }, REFRESH_INTERVAL_MS)
    return () => window.clearInterval(interval)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [visible, userId])

  async function handleToggle() {
    if (visible === null || togglePending) return
    setTogglePending(true)
    try {
      const next = await inventoryService.setShowcaseVisibility(!visible)
      setVisible(next)
    } finally {
      setTogglePending(false)
    }
  }

  if (visible === true) {
    const readyGames = GAMES.filter((game) => games[game.key].status === 'ready')
    const stillLoading = GAMES.some((game) => games[game.key].status === 'loading')
    if (!stillLoading && readyGames.length === 0) return null
  }

  return (
    <section className={styles.panel}>
      <div className={styles.heading}>
        <div>
          <h3>Vitrines públicas de jogos</h3>
          <p>
            Os quatro itens públicos mais valiosos de {playerName} aparecem pelo preço atual do Mercado Steam.
            Jogos sem quatro itens qualificados não são exibidos.
          </p>
        </div>
        <span className={styles.controls}>
          <span className={styles.verified}>Steam verificado</span>
          <button
            type="button"
            className={styles.toggle}
            disabled={visible === null || togglePending}
            onClick={handleToggle}
          >
            {visible === null ? 'Verificando privacidade' : visible ? 'Ocultar vitrine' : 'Mostrar vitrine'}
          </button>
        </span>
      </div>

      {visible === false && (
        <div className={styles.privateNote}>
          <strong>Vitrine oculta</strong>
          <small>Seus itens não aparecem para outros jogadores.</small>
        </div>
      )}

      {visible === true && (
        <div className={styles.grid}>
          {GAMES.map((game) => {
            const state = games[game.key]
            if (state.status === 'unavailable') return null
            return (
              <div key={game.key} className={styles.card}>
                <div className={styles.cardTop}>
                  <span className={styles.gameIcon}>{game.shortName}</span>
                  <span className={styles.status}>{state.status === 'loading' ? 'Carregando Steam' : 'Preço verificado'}</span>
                </div>
                <div className={styles.copy}>
                  <strong>{game.name}</strong>
                  <span>{game.description}</span>
                </div>
                <div className={styles.preview} aria-label={`Quatro itens públicos mais valiosos de ${game.name}`}>
                  {state.status === 'loading'
                    ? Array.from({ length: 4 }).map((_, index) => <i key={index} className={styles.tileSkeleton} />)
                    : state.highlights.map((item) => (
                        <span key={item.assetId} className={styles.tile} style={{ borderColor: item.rarityColor ?? '#5b6b84' }}>
                          {item.imageUrl ? (
                            <img src={item.imageUrl} alt={item.name} loading="lazy" />
                          ) : (
                            <b>{game.shortName}</b>
                          )}
                          <em>{item.marketPrice.formatted}</em>
                          <small>{item.name}</small>
                        </span>
                      ))}
                </div>
                <div className={styles.footer}>
                  <span>
                    {state.status === 'loading'
                      ? 'Sincronizando inventário…'
                      : `${state.total.toLocaleString('pt-BR')} itens · 4 mais valiosos`}
                  </span>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </section>
  )
}
