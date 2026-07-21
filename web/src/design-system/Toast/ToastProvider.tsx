import * as RadixToast from '@radix-ui/react-toast'
import { useCallback, useState, type ReactNode } from 'react'
import { ToastContext, type ToastVariant } from './ToastContext'
import styles from './Toast.module.css'

type ToastItem = { id: string; message: string; variant: ToastVariant }

/**
 * Fonte única de verdade para toasts no novo frontend, substituindo as 7
 * reimplementações de `showToast` do legado (main.js, csgo.js, teams.js,
 * organizer-panel.js, tournament-details.js, premium.js, pubg.js). Monte uma
 * vez perto da raiz do app (ver App.tsx); use `useToast()` para disparar.
 */
export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([])

  const showToast = useCallback((message: string, variant: ToastVariant = 'info') => {
    const id = crypto.randomUUID()
    setToasts((current) => [...current, { id, message, variant }])
  }, [])

  const removeToast = (id: string) => {
    setToasts((current) => current.filter((toast) => toast.id !== id))
  }

  return (
    <ToastContext.Provider value={showToast}>
      <RadixToast.Provider swipeDirection="right" duration={3500}>
        {children}
        {toasts.map((toast) => (
          <RadixToast.Root
            key={toast.id}
            className={[styles.toast, styles[toast.variant]].join(' ')}
            onOpenChange={(open) => {
              if (!open) removeToast(toast.id)
            }}
          >
            <RadixToast.Description>{toast.message}</RadixToast.Description>
          </RadixToast.Root>
        ))}
        <RadixToast.Viewport className={styles.viewport} />
      </RadixToast.Provider>
    </ToastContext.Provider>
  )
}
