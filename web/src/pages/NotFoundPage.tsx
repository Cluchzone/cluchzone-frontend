import { Link } from 'react-router-dom'
import { Button } from '@/design-system/Button'
import styles from './NotFoundPage.module.css'

/**
 * Placeholder para rotas ainda não migradas (Marketplace, PUBG, CS2, etc.) e
 * caminhos inexistentes. Cada uma passa a ter sua página real na fase
 * correspondente do plano.
 */
export function NotFoundPage() {
  return (
    <div className={styles.wrap}>
      <p className={styles.badge}>Em migração</p>
      <h1 className={styles.title}>Esta página ainda não foi migrada</h1>
      <p className={styles.lead}>
        Ela continua disponível no site atual enquanto é portada para o novo
        frontend, fase a fase.
      </p>
      <Button asChild>
        <Link to="/">Voltar ao início</Link>
      </Button>
    </div>
  )
}
