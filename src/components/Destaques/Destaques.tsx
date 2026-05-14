import styles from './Destaques.module.css'
import type { Veiculo } from '../../types'
import api from '../../api/axios'
import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { CardVeiculo } from '../CardVeiculo/CardVeiculo'

export function Destaques() {
  const [destaques, setDestaques] = useState<Veiculo[]>([])

  const navigate = useNavigate()

  useEffect(() => {
    api.get<Veiculo[]>('/veiculos/destaques').then(({ data }) => setDestaques(data))
  }, [])

  if (destaques.length === 0) {
    return null
  }

  return (
    <section className={styles.secao}>
      <div className={styles.secaoInner}>
        <h2 className={styles.secaoTitulo}>Veículos em destaque</h2>

        <div className={styles.grid}>
          {destaques.map((veiculo) => (
            <CardVeiculo key={veiculo.id} veiculo={veiculo} />
          ))}
        </div>

        <div className={styles.verTodos}>
          <button onClick={() => navigate('/catalogo')} className={styles.botaoSecundario}>
            Ver todos os veículos
          </button>
        </div>
      </div>
    </section>
  )
}
