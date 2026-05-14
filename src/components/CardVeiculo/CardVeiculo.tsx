import { useNavigate } from 'react-router-dom'
import type { Veiculo } from '../../types'
import styles from './CardVeiculo.module.css'
import { Heart, Star } from 'lucide-react'

interface Props {
  veiculo: Veiculo
  favoritado?: boolean
  onFavoritar?: (id: string) => void
}

export function CardVeiculo({ veiculo, favoritado = false, onFavoritar }: Props) {
  const navigate = useNavigate()

  const foto = veiculo.fotos?.[0]?.url

  const handleFavoritar = (e: React.MouseEvent) => {
    e.stopPropagation()

    if (onFavoritar) {
      onFavoritar(veiculo.id)
    }
  }

  return (
    <article className={styles.card} onClick={() => navigate(`/veiculo/${veiculo.id}`)}>
      <div className={styles.imagemContainer}>
        {foto ? (
          <img src={foto} alt={`${veiculo.marca} ${veiculo.modelo}`} className={styles.imagem} />
        ) : (
          <div className={styles.semFoto}>Sem foto</div>
        )}

        {veiculo.destaque && <span className={styles.tagDestaque}><Star size={18} strokeWidth={2.5} /></span>}
      </div>

      <div className={styles.info}>
        <h3 className={styles.nome}>
          {veiculo.marca} {veiculo.modelo}
        </h3>

        <p className={styles.detalhes}>
          {veiculo.ano} · {veiculo.km.toLocaleString('pt-BR')} km · {veiculo.combustivel}
        </p>

        <div className={styles.rodape}>
          <div className={styles.precoContainer}>
            <span className={styles.preco}>
              {veiculo.preco.toLocaleString('pt-BR', {
                style: 'currency',
                currency: 'BRL',
              })}
            </span>
          </div>

          {onFavoritar && (
            <button
              onClick={handleFavoritar}
              className={`${styles.botaoFavorito} ${favoritado ? styles.favoritado : ''}`}
              aria-label="Favoritar veículo"
            >
              <Heart size={20} fill={favoritado ? '#ef4444' : 'none'} color={favoritado ? '#ef4444' : 'currentColor'} />
            </button>
          )}
        </div>
      </div>
    </article>
  )
}
