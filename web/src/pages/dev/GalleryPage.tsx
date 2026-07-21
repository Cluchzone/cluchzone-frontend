import { useState } from 'react'
import { Button } from '@/design-system/Button'
import { Modal } from '@/design-system/Modal'
import { useToast } from '@/design-system/Toast'
import styles from './GalleryPage.module.css'

/**
 * Galeria dev-only para comparação visual 1:1 com o legado durante a Fase 1.
 * A rota só é registrada quando import.meta.env.DEV é true (ver router.tsx) —
 * inacessível em produção.
 */
export function GalleryPage() {
  const [modalOpen, setModalOpen] = useState(false)
  const [wideModalOpen, setWideModalOpen] = useState(false)
  const toast = useToast()

  return (
    <main className={styles.wrap}>
      <h1 className={styles.heading}>Design system — galeria (dev only)</h1>

      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>Button</h2>
        <div className={styles.row}>
          <Button variant="primary">Primary</Button>
          <Button variant="ghost">Ghost</Button>
          <Button variant="primary" size="lg">
            Primary lg
          </Button>
          <Button variant="primary" full>
            Primary full
          </Button>
        </div>
      </section>

      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>Modal</h2>
        <div className={styles.row}>
          <Button onClick={() => setModalOpen(true)}>Abrir modal</Button>
          <Button variant="ghost" onClick={() => setWideModalOpen(true)}>
            Abrir modal (wide)
          </Button>
        </div>
        <Modal open={modalOpen} onOpenChange={setModalOpen} title="Entrar">
          <p>Conteúdo de exemplo — equivalente ao modal de auth do legado.</p>
        </Modal>
        <Modal open={wideModalOpen} onOpenChange={setWideModalOpen} title="Criar campeonato" wide>
          <p>Conteúdo de exemplo — equivalente ao modal de campanha (premium.css / Fase 8).</p>
        </Modal>
      </section>

      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>Toast</h2>
        <div className={styles.row}>
          <Button variant="ghost" onClick={() => toast('Ação concluída!', 'success')}>
            success
          </Button>
          <Button variant="ghost" onClick={() => toast('Algo deu errado.', 'error')}>
            error
          </Button>
          <Button variant="ghost" onClick={() => toast('Informação relevante.', 'info')}>
            info
          </Button>
        </div>
      </section>
    </main>
  )
}
