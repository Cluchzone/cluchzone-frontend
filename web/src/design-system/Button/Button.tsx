import { Slot } from '@radix-ui/react-slot'
import type { ButtonHTMLAttributes } from 'react'
import styles from './Button.module.css'

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  /**
   * Quando true, renderiza o filho no lugar do <button> (padrão Radix `asChild`),
   * mantendo os estilos. Útil para transformar um <a>/<Link> em botão sem aninhar tags.
   */
  asChild?: boolean
}

/**
 * Seed do design system — prova a integração Radix (Slot) + CSS Modules na Fase 0.
 * A versão completa (variantes, tokens de cor, estados) é formalizada na Fase 1.
 */
export function Button({ asChild = false, className, ...props }: ButtonProps) {
  const Comp = asChild ? Slot : 'button'
  return (
    <Comp
      className={[styles.button, className].filter(Boolean).join(' ')}
      {...props}
    />
  )
}
