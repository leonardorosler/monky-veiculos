import { useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { Heart, Menu, X } from 'lucide-react'
import styles from './NavBar.module.css'

export function NavBar() {
  const navigate = useNavigate()
  const location = useLocation()

  const [menuAberto, setMenuAberto] = useState(false)

  const navegar = (rota: string) => {
    navigate(rota)
    setMenuAberto(false)
  }

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <h1 className={styles.logoWrapper}>
          <button onClick={() => navegar('/')} className={styles.logo}>
            Monky Veículos
          </button>
        </h1>

        <button className={styles.menuButton} onClick={() => setMenuAberto(!menuAberto)}>
          {menuAberto ? <X size={22} /> : <Menu size={22} />}
        </button>

        <nav className={`${styles.nav} ${menuAberto ? styles.navOpen : ''}`}>
          <button onClick={() => navegar('/catalogo')} className={`${styles.navLink} ${location.pathname === '/catalogo' ? styles.active : ''}`}>
            Ver todos
          </button>

          <button
            onClick={() => navegar('/vender-meu-carro')}
            className={`${styles.navLink} ${location.pathname === '/vender-meu-carro' ? styles.active : ''}`}
          >
            Vender meu carro
          </button>

          <button
            onClick={() => navegar('/financiamento')}
            className={`${styles.navLink} ${location.pathname === '/financiamento' ? styles.active : ''}`}
          >
            Financiamento
          </button>

          <button onClick={() => navegar('/favoritos')} className={`${styles.navLink} ${location.pathname === '/favoritos' ? styles.active : ''}`}>
            {/* <Heart size={18} /> */}
            Favoritos
          </button>
        </nav>
      </header>
    </div>
  )
}
