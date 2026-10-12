import { useEffect, useId, useRef, useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { Heart, Menu, MessageCircle, X } from 'lucide-react'
import { getWhatsAppUrl, siteConfig } from '../../config/site'
import styles from './NavBar.module.css'
import { usePlano } from '../../contexts/PlanoContext'
import { useSite } from '../../contexts/SiteContext'

export function NavBar() {
  const site = useSite()
  const location = useLocation()
  const { possuiRecurso } = usePlano()

  const [menuAberto, setMenuAberto] = useState(false)
  const menuId = useId()
  const containerRef = useRef<HTMLDivElement>(null)
  const buttonRef = useRef<HTMLButtonElement>(null)
  const fechar = () => setMenuAberto(false)
  useEffect(() => {
    if (!menuAberto) return
    function handleKey(event: KeyboardEvent) {
      if (event.key === 'Escape') { setMenuAberto(false); buttonRef.current?.focus() }
    }
    function handleOutside(event: PointerEvent) {
      if (!containerRef.current?.contains(event.target as Node)) setMenuAberto(false)
    }
    document.addEventListener('keydown', handleKey)
    document.addEventListener('pointerdown', handleOutside)
    return () => {
      document.removeEventListener('keydown', handleKey)
      document.removeEventListener('pointerdown', handleOutside)
    }
  }, [menuAberto])

  return (
    <div ref={containerRef} className={`${styles.container} ${location.pathname === '/' ? styles.home : ''}`}>
      <header className={styles.header}>
        <div className={styles.logoWrapper}>
          <Link to="/" onClick={fechar} className={styles.logo} aria-label={`${site.nomeCompleto} — início`}>
            <span className={styles.logoIcone}>
              <img className={styles.icone} src={site.logo} alt="" onError={e => { e.currentTarget.onerror = null; e.currentTarget.src = siteConfig.brand.logo }} />
            </span>
            <span className={styles.logoTextos}>
              <span className={styles.logoNome}>{site.nome}</span>
              <span className={styles.logoSubtitulo}>{siteConfig.brand.segment}</span>
            </span>
          </Link>
        </div>

        <button ref={buttonRef} className={styles.menuButton} onClick={() => setMenuAberto(!menuAberto)} aria-label={menuAberto ? 'Fechar menu' : 'Abrir menu'} aria-expanded={menuAberto} aria-controls={menuId}>
          {menuAberto ? <X size={22} /> : <Menu size={22} />}
        </button>

        <nav id={menuId} aria-label="Navegação principal" className={`${styles.nav} ${menuAberto ? styles.navOpen : ''}`}>
          <Link to="/catalogo" onClick={fechar} aria-current={location.pathname === '/catalogo' ? 'page' : undefined} className={`${styles.navLink} ${location.pathname === '/catalogo' ? styles.active : ''}`}>
            {siteConfig.navigation.vehicles}
          </Link>

          {possuiRecurso('LEADS') && (
            <>
              <Link to="/financiamento"
                onClick={fechar}
                aria-current={location.pathname === '/financiamento' ? 'page' : undefined}
                className={`${styles.navLink} ${location.pathname === '/financiamento' ? styles.active : ''}`}
              >
                {siteConfig.navigation.financing}
              </Link>

              <Link to="/vender-meu-carro"
                onClick={fechar}
                aria-current={location.pathname === '/vender-meu-carro' ? 'page' : undefined}
                className={`${styles.navLink} ${location.pathname === '/vender-meu-carro' ? styles.active : ''}`}
              >
                {siteConfig.navigation.sellCar}
              </Link>
            </>
          )}

          <Link to="/#sobre-nos" onClick={fechar} className={styles.navLink}>
            {siteConfig.navigation.about}
          </Link>

          <Link to="/favoritos" onClick={fechar} aria-current={location.pathname === '/favoritos' ? 'page' : undefined} className={`${styles.navLink} ${location.pathname === '/favoritos' ? styles.active : ''}`}>
            <Heart size={18} />
            {siteConfig.navigation.favorites}
          </Link>

          {siteConfig.contact.whatsapp && <a className={styles.whatsapp} href={getWhatsAppUrl()} target="_blank" rel="noreferrer">
            <MessageCircle size={18} />
            {siteConfig.navigation.whatsapp}
          </a>}
        </nav>
      </header>
    </div>
  )
}
