import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'

import api from '../../../api/axios'

import type { Veiculo } from '../../../types'

import { Spinner } from '../../../components/Spinner/Spinner'
import { NavBar } from '../../../components/NavBar/NavBar'

import styles from './Estoque.module.css'
import { AdminNavBar } from '../../../components/AdminNavBar/AdminNavBar'
import { AdminVoltar } from '../../../components/AdminVoltar/AdminVoltar'

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
    if (!confirm('Deseja remover este veículo?')) {
      return
    }

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

  if (carregando) {
    return <Spinner />
  }

  return (
    <div className={styles.container}>
      <AdminNavBar />

      <AdminVoltar />
      <main className={styles.main}>
        <div className={styles.topo}>
          <h1 className={styles.titulo}>Estoque</h1>

          <button onClick={() => navigate('/admin/veiculos/novo')} className={styles.botaoPrimario}>
            + Novo Veículo
          </button>
        </div>

        {veiculos.length === 0 ? (
          <p className={styles.vazio}>Nenhum veículo cadastrado.</p>
        ) : (
          <div className={styles.tabelaWrapper}>
            <table className={styles.tabela}>
              <thead>
                <tr>
                  <th className={styles.th}>Veículo</th>

                  <th className={styles.th}>Ano</th>

                  <th className={styles.th}>Preço</th>

                  <th className={styles.th}>KM</th>

                  <th className={styles.th}>Status</th>

                  <th className={styles.th}>Ações</th>
                </tr>
              </thead>

              <tbody>
                {veiculos.map((v) => (
                  <tr key={v.id} className={styles.tr}>
                    <td className={styles.td}>
                      <strong>
                        {v.marca} {v.modelo}
                      </strong>
                    </td>

                    <td className={styles.td}>{v.ano}</td>

                    <td className={styles.td}>
                      {v.preco.toLocaleString('pt-BR', {
                        style: 'currency',
                        currency: 'BRL',
                      })}
                    </td>

                    <td className={styles.td}>{v.km.toLocaleString('pt-BR')} km</td>

                    <td className={styles.td}>
                      <span className={v.vendido ? styles.tagVendido : v.destaque ? styles.tagDestaque : styles.tagAtivo}>
                        {v.vendido ? 'Vendido' : v.destaque ? 'Destaque' : 'Ativo'}
                      </span>
                    </td>

                    <td className={styles.td}>
                      <div className={styles.acoes}>
                        <button onClick={() => navigate(`/admin/veiculos/${v.id}/editar`)} className={styles.botaoAcao}>
                          Editar
                        </button>

                        <button onClick={() => handleDestaque(v.id)} className={styles.botaoAcao}>
                          {v.destaque ? 'Remover destaque' : 'Destacar'}
                        </button>

                        <button onClick={() => handleVendido(v.id)} className={styles.botaoAcao}>
                          {v.vendido ? 'Reativar' : 'Marcar vendido'}
                        </button>

                        <button onClick={() => handleDeletar(v.id)} className={styles.botaoDeletar}>
                          Remover
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </main>
    </div>
  )
}
