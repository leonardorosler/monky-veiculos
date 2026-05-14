import { useNavigate } from 'react-router-dom'

import styles from './Hero.module.css'

// import heroBg from '../../assets/hero-bg.jpg'

export function Hero() {
  const navigate = useNavigate()

  return (
    <section
      className={styles.hero}
      // style={{
      //   backgroundImage: `url(${heroBg})`,
      // }}
    >
      <div className={styles.overlay} />

      <div className={styles.heroConteudo}>
        <span className={styles.badge}>Veículos selecionados</span>

        <h1 className={styles.heroTitulo}>Monky Veículos</h1>

        <p className={styles.heroSubtitulo}>Encontre carros revisados, com procedência e condições exclusivas.</p>

        <div className={styles.acoes}>
          <button onClick={() => navigate('/catalogo')} className={styles.heroBotao}>
            Ver catálogo
          </button>

          <button onClick={() => navigate('/vender-meu-carro')} className={styles.heroBotaoSecundario}>
            Vender meu carro
          </button>
        </div>
      </div>
    </section>
  )
}
