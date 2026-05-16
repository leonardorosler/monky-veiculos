import { useRef } from 'react'
import styles from './MarcasCarrossel.module.css'

export const marcasPopulares = [
  { nome: 'Chevrolet', logo: '/marcas/chevrolet.svg' },
  { nome: 'Citroën', logo: '/marcas/citroen.svg' },
  { nome: 'Fiat', logo: '/marcas/fiat.svg' },
  { nome: 'Ford', logo: '/marcas/ford.svg' },
  { nome: 'Honda', logo: '/marcas/honda.svg' },
  { nome: 'Hyundai', logo: '/marcas/hyundai.svg' },
  { nome: 'Jeep', logo: '/marcas/jeep.svg' },
  { nome: 'Kia', logo: '/marcas/kia.svg' },
  { nome: 'Nissan', logo: '/marcas/nissan.svg' },
  { nome: 'Peugeot', logo: '/marcas/peugeot.svg' },
  { nome: 'Renault', logo: '/marcas/renault.svg' },
  { nome: 'Toyota', logo: '/marcas/toyota.svg' },
  { nome: 'Volkswagen', logo: '/marcas/volkswagen.svg' },
  { nome: 'Audi', logo: '/marcas/audi.svg' },
  { nome: 'BMW', logo: '/marcas/bmw.svg' },
  { nome: 'Mercedes-Benz', logo: '/marcas/mercedes-benz.svg' },
]

interface MarcasCarrosselProps {
  marcaSelecionada: string
  onSelecionarMarca: (nome: string) => void
}

export function MarcasCarrossel({ marcaSelecionada, onSelecionarMarca }: MarcasCarrosselProps) {
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
    <div className={styles.carrosselWrapper}>
      <button
        type="button"
        className={styles.carrosselBtn}
        onClick={() => scrollCarrossel('esquerda')}
        aria-label="Rolar para a esquerda"
      >
        ‹
      </button>

      <div className={styles.carrossel} ref={carrosselRef}>
        {marcasPopulares.map((marca) => {
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