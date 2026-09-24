import styles from './Footer.module.css'
import { Camera, MessageCircle, Play } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { getWhatsAppUrl, siteConfig } from '../../config/site'

export function Footer() {
  const navigate = useNavigate()
  return (
    <footer className={styles.footer}>
      <div className={styles.inner}>
        <div className={styles.marca}>
          <img className={styles.marcaIcone} src={siteConfig.brand.logo} alt="" />
          <div>
            <span>{siteConfig.brand.name}</span>
            <small>{siteConfig.brand.segment}</small>
          </div>
        </div>

        <nav className={styles.links} aria-label="Links do rodapé">
          <button onClick={() => navigate('/catalogo')}>{siteConfig.navigation.vehicles}</button>
          <button onClick={() => navigate('/financiamento')}>{siteConfig.navigation.financing}</button>
          <button onClick={() => navigate('/vender-meu-carro')}>{siteConfig.navigation.sellCar}</button>
          <button onClick={() => navigate('/')}>{siteConfig.navigation.about}</button>
          <a href={getWhatsAppUrl()} target="_blank" rel="noreferrer">{siteConfig.navigation.contact}</a>
        </nav>

        <div className={styles.social} aria-label="Redes sociais">
          <a href={siteConfig.social.instagram || '#'} aria-label="Instagram" title="Instagram"><Camera size={17} /></a>
          <a href={siteConfig.social.facebook || '#'} aria-label="Facebook" title="Facebook"><span className={styles.facebookIcon}>f</span></a>
          <a href={siteConfig.social.youtube || '#'} aria-label="YouTube" title="YouTube"><Play size={17} fill="currentColor" /></a>
          <a
            href={getWhatsAppUrl()}
            target={siteConfig.contact.whatsapp ? '_blank' : undefined}
            rel={siteConfig.contact.whatsapp ? 'noreferrer' : undefined}
            aria-label="WhatsApp"
            title="WhatsApp"
          >
            <MessageCircle size={17} />
          </a>
        </div>

        <a
          className={styles.empresa}
          href={siteConfig.developer.url}
          target="_blank"
          rel="noreferrer"
          aria-label={`Site da ${siteConfig.developer.name}`}
        >
          <span>{siteConfig.developer.label}</span>
          <span className={styles.empresaLogo}>
            <img src={siteConfig.developer.logo} alt={siteConfig.developer.name} />
          </span>
        </a>
      </div>
    </footer>
  )
}
