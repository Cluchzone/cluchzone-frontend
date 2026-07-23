import { Slot } from '@radix-ui/react-slot'
import type { ButtonHTMLAttributes } from 'react'
import styles from './Button.module.css'

type ButtonVariant = 'primary' | 'ghost'
type ButtonSize = 'md' | 'lg'

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: ButtonVariant
  size?: ButtonSize
  full?: boolean
  /**
   * Quando true, renderiza o filho no lugar do <button> (padrão Radix `asChild`),
   * mantendo os estilos. Útil para transformar um <a>/<Link> em botão sem aninhar tags.
   */
  asChild?: boolean
}

/**
 * Porte 1:1 de .btn-primary/.btn-ghost (style.css, bloco "BUTTONS (GLOBAL)").
 * Únicas variantes globais que existiam no legado — outras classes de botão
 * (.btn-login, .btn-join, .btn-watch etc.) são específicas de feature e
 * migram junto com a feature correspondente, não pertencem ao design system.
 */
export function Button({
  variant = 'primary',
  size = 'md',
  full = false,
  asChild = false,
  className,
  ...props
}: ButtonProps) {
  const Comp = asChild ? Slot : 'button'
  return (
    <Comp
      className={[
        styles.button,
        styles[variant],
        size === 'lg' ? styles.lg : '',
        full ? styles.full : '',
        className,
      ]
        .filter(Boolean)
        .join(' ')}
      {...props}
    />
  )
}
