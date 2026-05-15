import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'

import api from '../../../api/axios'
import type { Veiculo } from '../../../types'

import { Spinner } from '../../../components/Spinner/Spinner'
import { AdminNavBar } from '../../../components/AdminNavBar/AdminNavBar'
import { AdminVoltar } from '../../../components/AdminVoltar/AdminVoltar'

import styles from './Estoque.module.css'

export function Estoque() {
  const [veiculos, setVeiculos] = useState<Veiculo[]>([])
  const [carregando, setCarregando] = useState(true)

  const navigate = useNavigate()

  useEffect(() => {
    carregarEstoque()
  }, [])

  async function carregarEstoque() {
    try {
      const { data } = await api.get<Veiculo[]>('/admin/estoque')
      setVeiculos(data)
    } finally {
      setCarregando(false)
    }
  }

  async function handleDeletar(id: string) {
    if (!confirm('Deseja remover este veículo?')) return
    await api.delete(`/veiculos/${id}`)
    setVeiculos((prev) => prev.filter((v) => v.id !== id))
  }

  async function handleDestaque(id: string) {
    const { data } = await api.patch<Veiculo>(`/veiculos/${id}/destaque`)
    setVeiculos((prev) => prev.map((v) => (v.id === id ? data : v)))
  }

  async function handleVendido(id: string) {
    const { data } = await api.patch<Veiculo>(`/veiculos/${id}/vendido`)
    setVeiculos((prev) => prev.map((v) => (v.id === id ? data : v)))
  }

  if (carregando) return <Spinner />

  return (
    <div className={styles.container}>
      <AdminNavBar />

      <main className={styles.main}>
        <div className={styles.header}>
  <div className={styles.left}>
    <div>
      <h1 className={styles.titulo}>Estoque</h1>
      <p className={styles.subtitulo}>Gerencie seus veículos</p>
    </div>
  </div>

  <div className={styles.right}>
    <AdminVoltar />

    <button
      onClick={() => navigate('/admin/veiculos/novo')}
      className={styles.botaoPrimario}
    >
      + Novo veículo
    </button>
  </div>
</div>

        <div className={styles.card}>
  {veiculos.length === 0 ? (
    <p className={styles.vazio}>Nenhum veículo cadastrado.</p>
  ) : (
    <>
      <div className={styles.desktopTable}>
        <table className={styles.tabela}>
          <thead>
            <tr>
              <th>Veículo</th>
              <th>Ano</th>
              <th>Preço</th>
              <th>KM</th>
              <th>Status</th>
              <th>Ações</th>
            </tr>
          </thead>

          <tbody>
            {veiculos.map((v) => (
              <tr key={v.id}>
                <td>
                  <strong>
                    {v.marca} {v.modelo}
                  </strong>
                </td>

                <td>{v.ano}</td>

                <td>
                  {v.preco.toLocaleString('pt-BR', {
                    style: 'currency',
                    currency: 'BRL',
                  })}
                </td>

                <td>{v.km.toLocaleString('pt-BR')} km</td>

                <td>
                  <span
                    className={
                      v.vendido
                        ? styles.tagVendido
                        : v.destaque
                        ? styles.tagDestaque
                        : styles.tagAtivo
                    }
                  >
                    {v.vendido
                      ? 'Vendido'
                      : v.destaque
                      ? 'Destaque'
                      : 'Ativo'}
                  </span>
                </td>

                <td>
                  <div className={styles.acoes}>
                    <button
                      onClick={() =>
                        navigate(`/admin/veiculos/${v.id}/editar`)
                      }
                    >
                      Editar
                    </button>

                    <button onClick={() => handleDestaque(v.id)}>
                      {v.destaque ? 'Remover' : 'Destacar'}
                    </button>

                    <button onClick={() => handleVendido(v.id)}>
                      {v.vendido ? 'Reativar' : 'Vendido'}
                    </button>

                    <button
                      onClick={() => handleDeletar(v.id)}
                      className={styles.danger}
                    >
                      Remover
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className={styles.mobileCards}>
        {veiculos.map((v) => (
          <div key={v.id} className={styles.mobileCard}>
            <div className={styles.mobileTop}>
              <h3>
                {v.marca} {v.modelo}
              </h3>

              <span
                className={
                  v.vendido
                    ? styles.tagVendido
                    : v.destaque
                    ? styles.tagDestaque
                    : styles.tagAtivo
                }
              >
                {v.vendido
                  ? 'Vendido'
                  : v.destaque
                  ? 'Destaque'
                  : 'Ativo'}
              </span>
            </div>

            <div className={styles.mobileInfos}>
              <div>
                <span>Ano</span>
                <strong>{v.ano}</strong>
              </div>

              <div>
                <span>Preço</span>
                <strong>
                  {v.preco.toLocaleString('pt-BR', {
                    style: 'currency',
                    currency: 'BRL',
                  })}
                </strong>
              </div>

              <div>
                <span>KM</span>
                <strong>{v.km.toLocaleString('pt-BR')} km</strong>
              </div>
            </div>

            <div className={styles.mobileActions}>
              <button
                onClick={() =>
                  navigate(`/admin/veiculos/${v.id}/editar`)
                }
              >
                Editar
              </button>

              <button onClick={() => handleDestaque(v.id)}>
                {v.destaque ? 'Remover destaque' : 'Destacar'}
              </button>

              <button onClick={() => handleVendido(v.id)}>
                {v.vendido ? 'Reativar' : 'Marcar vendido'}
              </button>

              <button
                onClick={() => handleDeletar(v.id)}
                className={styles.danger}
              >
                Remover
              </button>
            </div>
          </div>
        ))}
      </div>
    </>
  )}
</div>
      </main>
    </div>
  )
}
