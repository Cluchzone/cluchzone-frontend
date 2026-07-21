import { useContext } from 'react'
import { ToastContext } from './ToastContext'

/** `const toast = useToast(); toast('Salvo!', 'success')` */
export function useToast() {
  return useContext(ToastContext)
}
