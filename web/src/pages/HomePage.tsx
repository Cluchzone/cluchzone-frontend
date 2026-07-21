import { Button } from '@/design-system/Button'
import styles from './HomePage.module.css'

export function HomePage() {
  return (
    <main className={styles.wrap}>
      <p className={styles.badge}>Fase 0 · scaffold</p>
      <h1 className={styles.title}>CLUTCHZONE web</h1>
      <p className={styles.lead}>
        Novo frontend em React + Vite + TypeScript. A migração acontece por
        fases, cada uma revisável antes de ir para produção.
      </p>
      <Button asChild>
        <a href="https://github.com/LucasMoreirac" target="_blank" rel="noreferrer">
          Ver plano de migração
        </a>
      </Button>
    </main>
  )
}
