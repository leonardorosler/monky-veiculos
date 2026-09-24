import { NavBar } from '../../components/NavBar/NavBar'
import { Hero } from '../../components/Hero/Hero'
import { Footer } from '../../components/Footer/Footer'
import { Destaques } from '../../components/Destaques/Destaques'
import { MarcasCarrossel } from '../../components/MarcasCarrossel/Marcascarrossel'

import { useNavigate } from 'react-router-dom'
import type { CSSProperties } from 'react'
import { ArrowRight, BadgeCheck, CarFront, Handshake, ShieldCheck, UserRoundCheck } from 'lucide-react'
import { siteConfig } from '../../config/site'

import styles from './Home.module.css'

export function Home() {
  const navigate = useNavigate()
  const benefitIcons = [BadgeCheck, UserRoundCheck, Handshake, ShieldCheck]
  
  return (
    <main className={styles.container} style={{ '--dealership-image': `url("${siteConfig.assets.dealership}")` } as CSSProperties}>
      <NavBar />
      <Hero />
      <MarcasCarrossel
        marcaSelecionada=""
        variante="home"
        onSelecionarMarca={(nome) => navigate(`/catalogo?marca=${encodeURIComponent(nome)}`)}
      />
      <Destaques />

      <section className={styles.catalogoCta}>
        <div className={styles.catalogoCtaInner}>
          <CarFront size={38} />
          <div>
            <strong>{siteConfig.home.catalogCta.title}</strong>
            <span>{siteConfig.home.catalogCta.description}</span>
          </div>
          <button onClick={() => navigate('/catalogo')}>
            {siteConfig.home.catalogCta.action}
            <ArrowRight size={17} />
          </button>
        </div>
      </section>

      <section className={styles.institucional}>
        <div className={styles.fotoLoja}>
          <div>
            <strong>{siteConfig.home.institutional.statement}</strong>
            <span />
          </div>
        </div>

        <div className={styles.motivos}>
          <h2>{siteConfig.home.institutional.title}</h2>
          <div className={styles.motivosGrid}>
            {siteConfig.home.institutional.benefits.map((benefit, index) => {
              const Icon = benefitIcons[index]
              return <div key={benefit.title}><Icon /><span>{benefit.title}<br />{benefit.description}</span></div>
            })}
          </div>
        </div>

        <blockquote className={styles.depoimento}>
          <div className={styles.estrelas}>{siteConfig.home.institutional.testimonial.rating}</div>
          <p>{siteConfig.home.institutional.testimonial.text}</p>
          <strong>{siteConfig.home.institutional.testimonial.author}</strong>
          <span>{siteConfig.home.institutional.testimonial.detail}</span>
        </blockquote>
      </section>
      <Footer />
    </main>
  )
}
