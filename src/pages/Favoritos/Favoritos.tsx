import { Link } from 'react-router-dom'
import { Heart, Search } from 'lucide-react'
import { CardVeiculo } from '../../components/CardVeiculo/CardVeiculo'
import { Spinner } from '../../components/Spinner/Spinner'
import { Feedback } from '../../components/Feedback'
import { useFavoritos } from '../../contexts/FavoritosContext'
import styles from './Favoritos.module.css'

export function Favoritos() {
  const { veiculos, carregando, erro, carregar } = useFavoritos()
  return (
    <main className={styles.container}>
      <div className={styles.main}>
        <section className={styles.hero}>
          <div className={styles.badge}><Heart size={16} />Seus favoritos</div>
          <h1 className={styles.titulo}>Veículos salvos</h1>
          <p className={styles.descricao}>Guarde suas opções e encontre o veículo ideal com calma.</p>
        </section>
        {erro && <Feedback mensagem={erro} onRetry={() => void carregar()} />}
        {carregando ? <Spinner /> : !erro && veiculos.length === 0 ? (
          <div className={styles.vazio}>
            <Search size={34} aria-hidden="true" /><h2>Seu próximo veículo pode estar aqui</h2>
            <p>Toque no coração de um veículo para salvá-lo nesta lista.</p>
            <Link className="ui-button ui-button-primary" to="/catalogo">Explorar o estoque</Link>
          </div>
        ) : <><p className={styles.resultado} role="status">{veiculos.length} veículo{veiculos.length === 1 ? '' : 's'} salvo{veiculos.length === 1 ? '' : 's'}</p><div className={styles.grid}>{veiculos.map(veiculo => <CardVeiculo key={veiculo.id} veiculo={veiculo} />)}</div></>}
      </div>
    </main>
  )
}
