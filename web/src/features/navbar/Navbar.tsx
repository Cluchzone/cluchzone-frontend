import * as DropdownMenu from '@radix-ui/react-dropdown-menu'
import { Link } from 'react-router-dom'
import { useAuth } from '@/features/auth'
import styles from './Navbar.module.css'

const NAV_LINKS = [
  { label: 'Jogos', to: '/' },
  { label: 'Marketplace', to: '/marketplace' },
  { label: 'PUBG', to: '/pubg' },
  { label: 'CS2', to: '/csgo' },
  { label: 'Brawl Stars', to: '/brawlstars' },
  { label: '🛂 Passaporte', to: '/passport' },
]

function Avatar({ url, name }: { url: string | null; name: string }) {
  if (url && url.startsWith('https://')) {
    return <img className={styles.avatarImg} src={url} alt="" referrerPolicy="no-referrer" />
  }
  return <span aria-hidden="true">{name.charAt(0).toUpperCase()}</span>
}

export function Navbar() {
  const { user, state, login, logout } = useAuth()

  return (
    <nav className={styles.navbar}>
      <div className={styles.inner}>
        <Link to="/" className={styles.logo}>
          CLUTCHZONE
        </Link>

        <ul className={styles.links}>
          {NAV_LINKS.map((item) => (
            <li key={item.to + item.label}>
              <Link to={item.to} className={styles.link}>
                {item.label}
              </Link>
            </li>
          ))}
        </ul>

        <div className={styles.actions}>
          {state === 'loading' && (
            <button type="button" className={styles.syncButton} disabled aria-live="polite">
              Sincronizando Steam…
            </button>
          )}

          {state === 'authenticated' && user && (
            <DropdownMenu.Root>
              <DropdownMenu.Trigger asChild>
                <button type="button" className={styles.pill}>
                  <span className={styles.avatar}>
                    <Avatar url={user.avatarUrl} name={user.displayName} />
                  </span>
                  <span className={styles.userName}>{user.displayName}</span>
                </button>
              </DropdownMenu.Trigger>
              <DropdownMenu.Portal>
                <DropdownMenu.Content className={styles.menu} align="end" sideOffset={6}>
                  <DropdownMenu.Item asChild>
                    <Link to="/passport" className={styles.menuItem}>
                      Passaporte
                    </Link>
                  </DropdownMenu.Item>
                  <DropdownMenu.Separator className={styles.menuSep} />
                  <DropdownMenu.Item
                    className={`${styles.menuItem} ${styles.menuItemDanger}`}
                    onSelect={() => void logout()}
                  >
                    Sair
                  </DropdownMenu.Item>
                </DropdownMenu.Content>
              </DropdownMenu.Portal>
            </DropdownMenu.Root>
          )}

          {(state === 'anonymous' || state === 'unavailable') && (
            <button
              type="button"
              className={styles.loginButton}
              onClick={() => login()}
              title={
                state === 'unavailable'
                  ? 'O backend de autenticação está indisponível no momento.'
                  : undefined
              }
            >
              Entrar com Steam
            </button>
          )}
        </div>
      </div>
    </nav>
  )
}
