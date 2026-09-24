import { useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { Heart, Menu, MessageCircle, X } from 'lucide-react'
import { getWhatsAppUrl, siteConfig } from '../../config/site'
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
    <div className={`${styles.container} ${location.pathname === '/' ? styles.home : styles.solid}`}>
      <header className={styles.header}>
        <h1 className={styles.logoWrapper}>
          <button onClick={() => navegar('/')} className={styles.logo}>
            <span className={styles.logoIcone}>
              <img className={styles.icone} src={siteConfig.brand.logo} alt="" />
            </span>
            <span className={styles.logoTextos}>
              <span className={styles.logoNome}>{siteConfig.brand.name}</span>
              <span className={styles.logoSubtitulo}>{siteConfig.brand.segment}</span>
            </span>
          </button>
        </h1>

        <button className={styles.menuButton} onClick={() => setMenuAberto(!menuAberto)}>
          {menuAberto ? <X size={22} /> : <Menu size={22} />}
        </button>

        <nav className={`${styles.nav} ${menuAberto ? styles.navOpen : ''}`}>
          <button onClick={() => navegar('/catalogo')} className={`${styles.navLink} ${location.pathname === '/catalogo' ? styles.active : ''}`}>
            {siteConfig.navigation.vehicles}
          </button>

          <button
            onClick={() => navegar('/financiamento')}
            className={`${styles.navLink} ${location.pathname === '/financiamento' ? styles.active : ''}`}
          >
            {siteConfig.navigation.financing}
          </button>

          <button
            onClick={() => navegar('/vender-meu-carro')}
            className={`${styles.navLink} ${location.pathname === '/vender-meu-carro' ? styles.active : ''}`}
          >
            {siteConfig.navigation.sellCar}
          </button>

          <button onClick={() => navegar('/')} className={styles.navLink}>
            {siteConfig.navigation.about}
          </button>

          <button onClick={() => navegar('/favoritos')} className={`${styles.navLink} ${location.pathname === '/favoritos' ? styles.active : ''}`}>
            <Heart size={18} />
            {siteConfig.navigation.favorites}
          </button>

          <a className={styles.whatsapp} href={getWhatsAppUrl()} target="_blank" rel="noreferrer">
            <MessageCircle size={18} />
            {siteConfig.navigation.whatsapp}
          </a>
        </nav>
      </header>
    </div>
  )
}
