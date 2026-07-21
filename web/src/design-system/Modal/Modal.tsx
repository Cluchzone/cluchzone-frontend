import * as Dialog from '@radix-ui/react-dialog'
import type { ReactNode } from 'react'
import styles from './Modal.module.css'

type ModalProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  title: string
  children: ReactNode
  /** Modal maior, com rolagem interna — para formulários longos (ex.: criação de campeonato). */
  wide?: boolean
  /** Radix exige um título acessível; passe false só se `title` já aparece visualmente no children. */
  showTitle?: boolean
}

/**
 * Substitui os dois toggles concorrentes do legado (`.modal-overlay.open` via
 * display em style.css, via opacity em premium.css — resolvidos hoje só pela
 * ordem dos <link>). O Radix Dialog controla montagem/desmontagem, foco e Esc;
 * o CSS Module só cuida da aparência, usando data-state para animar
 * entrada/saída (ver Modal.module.css).
 */
export function Modal({ open, onOpenChange, title, children, wide, showTitle = true }: ModalProps) {
  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className={styles.overlay} />
        <Dialog.Content className={[styles.content, wide ? styles.wide : ''].join(' ')}>
          <Dialog.Title className={showTitle ? styles.title : styles.srOnly}>{title}</Dialog.Title>
          <Dialog.Close className={styles.close} aria-label="Fechar">
            ×
          </Dialog.Close>
          {children}
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  )
}
