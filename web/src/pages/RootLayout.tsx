import { Outlet } from 'react-router-dom'
import { Navbar } from '@/features/navbar'
import styles from './RootLayout.module.css'

/** Casca comum a todas as rotas: navbar fixa + área de conteúdo. */
export function RootLayout() {
  return (
    <>
      <Navbar />
      <main className={styles.main}>
        <Outlet />
      </main>
    </>
  )
}
