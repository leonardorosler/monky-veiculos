import { useEffect, useState } from 'react'

import { Heart, Search } from 'lucide-react'

import api from '../../api/axios'

import { CardVeiculo } from '../../components/CardVeiculo/CardVeiculo'
import { Spinner } from '../../components/Spinner/Spinner'
import { NavBar } from '../../components/NavBar/NavBar'

import type { Veiculo } from '../../types'

import styles from './Favoritos.module.css'

const SESSION_KEY = 'catalogo_session_id'

function getSessionId() {
  let id = localStorage.getItem(SESSION_KEY)

  if (!id) {
    id = crypto.randomUUID()

    localStorage.setItem(SESSION_KEY, id)
  }

  return id
}

export function Favoritos() {
  const [veiculos, setVeiculos] = useState<Veiculo[]>([])

  const [carregando, setCarregando] = useState(true)

  const sessionId = getSessionId()

  useEffect(() => {
    carregarFavoritos()
  }, [])

  async function carregarFavoritos() {
    try {
      const { data } = await api.get<Veiculo[]>(`/favoritos?sessionId=${sessionId}`)

      setVeiculos(data)
    } finally {
      setCarregando(false)
    }
  }

  async function handleDesfavoritar(veiculoId: string) {
    await api.delete(`/favoritos/${veiculoId}`, {
      data: { sessionId },
    })

    setVeiculos((prev) => prev.filter((v) => v.id !== veiculoId))
  }

  return (
    <div className={styles.container}>
      <NavBar />

      <main className={styles.main}>
        <section className={styles.hero}>
          <div className={styles.badge}>
            <Heart size={16} />
            Seus favoritos
          </div>

          <h1 className={styles.titulo}>Veículos salvos</h1>

          <p className={styles.descricao}>Acompanhe os veículos que você marcou para comparar ou revisar depois.</p>
        </section>

        {carregando ? (
          <div className={styles.loading}>
            <Spinner />
          </div>
        ) : veiculos.length === 0 ? (
          <div className={styles.vazio}>
            <div className={styles.vazioIcone}>
              <Search size={34} />
            </div>

            <h2>Nenhum veículo salvo</h2>

            <p>Você ainda não adicionou veículos aos favoritos.</p>
          </div>
        ) : (
          <>
            <div className={styles.topoLista}>
              <p className={styles.resultado}>
                {veiculos.length} veículo
                {veiculos.length > 1 ? 's' : ''} salvo
                {veiculos.length > 1 ? 's' : ''}
              </p>
            </div>

            <div className={styles.grid}>
              {veiculos.map((v) => (
                <CardVeiculo key={v.id} veiculo={v} favoritado={true} onFavoritar={handleDesfavoritar} />
              ))}
            </div>
          </>
        )}
      </main>
    </div>
  )
}
