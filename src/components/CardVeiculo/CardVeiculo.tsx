import { Link } from 'react-router-dom'
import type { Veiculo } from '../../types'
import styles from './CardVeiculo.module.css'
import { ArrowRight, Calendar, Fuel, Gauge, Heart, Loader2, Star } from 'lucide-react'
import { useFavoritos } from '../../contexts/FavoritosContext'

interface Props {
  veiculo: Veiculo
}

export function CardVeiculo({ veiculo }: Props) {
  const { veiculos, pendentes, carregando, alternar } = useFavoritos()
  const favoritado = veiculos.some(item => item.id === veiculo.id)
  const ocupado = pendentes.includes(veiculo.id)
  const foto = (veiculo.fotos?.find(item => item.capa) ?? veiculo.fotos?.[0])?.url
  const nome = `${veiculo.marca} ${veiculo.modelo}`
  const destino = `/veiculo/${veiculo.id}`

  return (
    <article className={styles.card}>
      <div className={styles.imagemContainer}>
        <Link to={destino} tabIndex={-1} aria-hidden="true">
        {foto ? (
          <img src={foto} alt={nome} loading="lazy" decoding="async" className={styles.imagem} />
        ) : (
          <div className={styles.semFoto}>Sem foto</div>
        )}
        </Link>

        {veiculo.destaque && (
          <span className={styles.tagDestaque}>
            <Star size={15} strokeWidth={2.5} />
            Destaque
          </span>
        )}

        <button
          type="button"
          onClick={() => void alternar(veiculo)}
          disabled={carregando || ocupado}
          className={`${styles.botaoFavorito} ${favoritado ? styles.favoritado : ''}`}
          aria-label={`${favoritado ? 'Remover dos favoritos' : 'Salvar nos favoritos'}: ${nome}`}
          aria-pressed={favoritado}
          aria-busy={ocupado}
        >
          {ocupado ? <Loader2 size={20} className={styles.spinner} /> : <Heart size={20} fill={favoritado ? 'currentColor' : 'none'} />}
        </button>
      </div>

      <div className={styles.info}>
        <h3 className={styles.nome}>
            <Link to={destino}>{nome}</Link>
        </h3>

        <div className={styles.detalhes}>
          <span>
            <Calendar size={15} />
            {veiculo.ano}
          </span>
          <span>
            <Gauge size={15} />
            {veiculo.km.toLocaleString('pt-BR')} km
          </span>
          <span>
            <Fuel size={15} />
            {veiculo.combustivel}
          </span>
        </div>

        <div className={styles.rodape}>
          <div className={styles.precoContainer}>
            <span className={styles.preco}>
              {veiculo.preco.toLocaleString('pt-BR', {
                style: 'currency',
                currency: 'BRL',
              })}
            </span>
          </div>
        </div>

        <Link to={destino} className={styles.detalhesBotao} aria-label={`Ver detalhes de ${nome}`}>
          Ver detalhes
          <ArrowRight size={16} />
        </Link>
      </div>
    </article>
  )
}
