import styles from './GameSignatureKit.module.css'

type SignatureSlot = { kind: string; code: string; label: string }

/**
 * 'cs2' entra na Fase 11. No legado, cs2/pubg também hidratam destaques Steam
 * reais (window.ClutchInventory) por cima do fallback estático — isso depende
 * da feature inventory/, ainda não portada, então por ora pubg mostra sempre
 * o kit estático, como o brawl já mostra.
 */
export type GameKey = 'brawl' | 'pubg'

const KITS: Record<GameKey, { eyebrow: string; title: string; note: string; action: string; slots: SignatureSlot[] }> = {
  brawl: {
    eyebrow: 'BATTLE KIT',
    title: 'PODER PARA O 3V3',
    note: 'Gemas, Super e Power Cubes dão o ritmo de uma arena arcade.',
    action: 'ENTRAR NA ARENA',
    slots: [
      { kind: 'gem', code: 'GEM', label: 'Gem Grab' },
      { kind: 'super', code: 'SUPER', label: 'Super carregado' },
      { kind: 'cube', code: 'PWR', label: 'Power Cube' },
      { kind: 'team', code: '3V3', label: 'Equipe completa' },
    ],
  },
  pubg: {
    eyebrow: 'SURVIVAL KIT',
    title: 'PRONTO PARA O DROP',
    note: 'Loot, proteção e cobertura para sobreviver até o círculo final.',
    action: 'ESCOLHER CAMPEONATO',
    slots: [
      { kind: 'crate', code: 'DROP', label: 'Airdrop' },
      { kind: 'helmet', code: 'LV.3', label: 'Capacete nível 3' },
      { kind: 'smoke', code: 'SMK', label: 'Granada de fumaça' },
      { kind: 'boost', code: '+40', label: 'Boost de energia' },
    ],
  },
}

const THEME_CLASS: Record<GameKey, string> = {
  brawl: styles.isBrawl,
  pubg: styles.isPubg,
}

type GameSignatureKitProps = {
  game: GameKey
  onAction: () => void
}

export function GameSignatureKit({ game, onAction }: GameSignatureKitProps) {
  const kit = KITS[game]

  return (
    <section className={`${styles.kit} ${THEME_CLASS[game]}`} data-signature-game={game}>
      <header className={styles.head}>
        <span className={styles.heading}>
          <small>{kit.eyebrow}</small>
          <strong>{kit.title}</strong>
        </span>
        <button type="button" className={styles.action} onClick={onAction}>
          {kit.action}
        </button>
      </header>
      <p className={styles.note} aria-live="polite">
        {kit.note}
      </p>
      <div className={styles.slots}>
        {kit.slots.map((slot) => (
          <div key={slot.kind} className={styles.slot} data-kind={slot.kind}>
            <span className={styles.visual} aria-hidden="true" />
            <span className={styles.slotCopy}>
              <strong>{slot.code}</strong>
              <small>{slot.label}</small>
            </span>
          </div>
        ))}
      </div>
    </section>
  )
}
