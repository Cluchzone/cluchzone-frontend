import { RouterProvider } from 'react-router-dom'
import { ToastProvider } from '@/design-system/Toast'
import { AuthProvider } from '@/features/auth'
import { router } from '@/router'

export default function App() {
  return (
    <ToastProvider>
      <AuthProvider>
        <RouterProvider router={router} />
      </AuthProvider>
    </ToastProvider>
  )
}
