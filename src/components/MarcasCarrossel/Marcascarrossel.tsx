import { useRef } from 'react'
import { siteConfig } from '../../config/site'
import styles from './MarcasCarrossel.module.css'

interface MarcasCarrosselProps {
  marcaSelecionada: string
  onSelecionarMarca: (nome: string) => void
  variante?: 'padrao' | 'home'
}

export function MarcasCarrossel({ marcaSelecionada, onSelecionarMarca, variante = 'padrao' }: MarcasCarrosselProps) {
  const carrosselRef = useRef<HTMLDivElement>(null)

  function scrollCarrossel(direcao: 'esquerda' | 'direita') {
    if (carrosselRef.current) {
      carrosselRef.current.scrollBy({
        left: direcao === 'direita' ? 240 : -240,
        behavior: 'smooth',
      })
    }
  }

  return (
    <div className={`${styles.carrosselWrapper} ${variante === 'home' ? styles.home : ''}`}>
      <button
        type="button"
        className={styles.carrosselBtn}
        onClick={() => scrollCarrossel('esquerda')}
        aria-label="Rolar para a esquerda"
      >
        ‹
      </button>

      <div className={styles.carrossel} ref={carrosselRef}>
        {siteConfig.catalog.brands.map((marca) => {
          const ativa = marcaSelecionada === marca.nome
          return (
            <button
              key={marca.nome}
              type="button"
              onClick={() => onSelecionarMarca(marca.nome)}
              className={`${styles.carrosselItem} ${ativa ? styles.carrosselItemAtivo : ''}`}
              aria-pressed={ativa}
            >
              <img src={marca.logo} alt={marca.nome} className={styles.carrosselLogo} />
              <span>{marca.nome}</span>
            </button>
          )
        })}
      </div>

      <button
        type="button"
        className={styles.carrosselBtn}
        onClick={() => scrollCarrossel('direita')}
        aria-label="Rolar para a direita"
      >
        ›
      </button>
    </div>
  )
}
