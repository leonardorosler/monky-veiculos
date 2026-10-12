import styles from './Footer.module.css'
import { Camera, Clock3, MapPin, MessageCircle, Phone, Play } from 'lucide-react'
import { Link } from 'react-router-dom'
import { getWhatsAppUrl, siteConfig } from '../../config/site'
import { usePlano } from '../../contexts/PlanoContext'
import { useSite } from '../../contexts/SiteContext'

export function Footer() {
  const site = useSite()
  const { possuiRecurso } = usePlano()
  return (
    <footer className={styles.footer}>
      {(siteConfig.contact.address || siteConfig.contact.city || siteConfig.contact.phone || siteConfig.contact.email || siteConfig.contact.hours) && <div className={styles.contatos}>
        {(siteConfig.contact.address || siteConfig.contact.city) && <div><MapPin size={20} /><span>{siteConfig.contact.address}<br />{siteConfig.contact.city}{siteConfig.contact.mapsUrl && <a href={siteConfig.contact.mapsUrl} target="_blank" rel="noreferrer">Como chegar</a>}</span></div>}
        {siteConfig.contact.phone && <a href={`tel:${siteConfig.contact.phone.replace(/[^\d+]/g, '')}`}><Phone size={20} />{siteConfig.contact.phone}</a>}
        {siteConfig.contact.email && <a href={`mailto:${siteConfig.contact.email}`}>{siteConfig.contact.email}</a>}
        {siteConfig.contact.hours && <div><Clock3 size={20} /><span>{siteConfig.contact.hours}</span></div>}
      </div>}
      <div className={styles.inner}>
        <div className={styles.marca}>
          <img className={styles.marcaIcone} src={site.logo} alt="" onError={e => { e.currentTarget.onerror = null; e.currentTarget.src = siteConfig.brand.logo }} />
          <div>
            <span>{site.nome}</span>
            <small>{siteConfig.brand.segment}</small>
          </div>
        </div>

        <nav className={styles.links} aria-label="Links do rodapé">
          <Link to="/catalogo">{siteConfig.navigation.vehicles}</Link>
          {possuiRecurso('LEADS') && (
            <>
              <Link to="/financiamento">{siteConfig.navigation.financing}</Link>
              <Link to="/vender-meu-carro">{siteConfig.navigation.sellCar}</Link>
            </>
          )}
          <Link to="/#sobre-nos">{siteConfig.navigation.about}</Link>
          {siteConfig.contact.whatsapp && <a href={getWhatsAppUrl()} target="_blank" rel="noreferrer">{siteConfig.navigation.contact}</a>}
        </nav>

        <div className={styles.social} aria-label="Redes sociais">
          {siteConfig.social.instagram && <a href={siteConfig.social.instagram} target="_blank" rel="noreferrer" aria-label="Instagram" title="Instagram"><Camera size={17} /></a>}
          {siteConfig.social.facebook && <a href={siteConfig.social.facebook} target="_blank" rel="noreferrer" aria-label="Facebook" title="Facebook"><span className={styles.facebookIcon}>f</span></a>}
          {siteConfig.social.youtube && <a href={siteConfig.social.youtube} target="_blank" rel="noreferrer" aria-label="YouTube" title="YouTube"><Play size={17} fill="currentColor" /></a>}
          {siteConfig.contact.whatsapp && <a
            href={getWhatsAppUrl()}
            target={siteConfig.contact.whatsapp ? '_blank' : undefined}
            rel={siteConfig.contact.whatsapp ? 'noreferrer' : undefined}
            aria-label="WhatsApp"
            title="WhatsApp"
          >
            <MessageCircle size={17} />
          </a>}
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
