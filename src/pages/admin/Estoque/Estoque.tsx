import { useEffect, useState, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'

import api from '../../../api/axios'
import type { Veiculo } from '../../../types'

import { Spinner } from '../../../components/Spinner/Spinner'
import { AdminNavBar } from '../../../components/AdminNavBar/AdminNavBar'
import { AdminVoltar } from '../../../components/AdminVoltar/AdminVoltar'

import styles from './Estoque.module.css'

type Filtro = 'TODOS' | 'ATIVO' | 'DESTAQUE' | 'VENDIDO'

export function Estoque() {
  const [veiculos, setVeiculos] = useState<Veiculo[]>([])
  const [carregando, setCarregando] = useState(true)
  const [busca, setBusca] = useState('')
  const [filtro, setFiltro] = useState<Filtro>('TODOS')

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

  const veiculosFiltrados = useMemo(() => {
    return veiculos
      .filter((v) => {
        const termo = busca.toLowerCase()
        return v.marca.toLowerCase().includes(termo) || v.modelo.toLowerCase().includes(termo) || String(v.ano).includes(termo)
      })
      .filter((v) => {
        if (filtro === 'VENDIDO') return v.vendido
        if (filtro === 'DESTAQUE') return v.destaque && !v.vendido
        if (filtro === 'ATIVO') return !v.vendido && !v.destaque
        return true
      })
  }, [veiculos, busca, filtro])

  if (carregando) return <Spinner />

  const filtros: { label: string; valor: Filtro }[] = [
    { label: `Todos (${veiculos.length})`, valor: 'TODOS' },
    { label: `Ativos (${veiculos.filter((v) => !v.vendido && !v.destaque).length})`, valor: 'ATIVO' },
    { label: `Destaques (${veiculos.filter((v) => v.destaque && !v.vendido).length})`, valor: 'DESTAQUE' },
    { label: `Vendidos (${veiculos.filter((v) => v.vendido).length})`, valor: 'VENDIDO' },
  ]

  return (
    <div className={styles.container}>
      <AdminNavBar />

      <main className={styles.main}>
        <div className={styles.header}>
          <div className={styles.left}>
            <h1 className={styles.titulo}>Estoque</h1>
            <p className={styles.subtitulo}>Gerencie seus veículos</p>
          </div>
          <div className={styles.right}>
            <AdminVoltar />
            <button onClick={() => navigate('/admin/veiculos/novo')} className={styles.botaoPrimario}>
              + Novo veículo
            </button>
          </div>
        </div>

        {/* Busca e filtros */}
        <div className={styles.controles}>
          <input
            type="text"
            placeholder="Buscar por marca, modelo ou ano..."
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
            className={styles.inputBusca}
          />
          <div className={styles.filtros}>
            {filtros.map((f) => (
              <button
                key={f.valor}
                onClick={() => setFiltro(f.valor)}
                className={`${styles.filtroBotao} ${filtro === f.valor ? styles.filtroAtivo : ''}`}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>

        <div className={styles.card}>
          {veiculosFiltrados.length === 0 ? (
            <p className={styles.vazio}>{busca || filtro !== 'TODOS' ? 'Nenhum veículo encontrado.' : 'Nenhum veículo cadastrado.'}</p>
          ) : (
            <>
              <div className={styles.desktopTable}>
                <table className={styles.tabela}>
                  <thead>
                    <tr>
                      <th>Foto</th>
                      <th>Veículo</th>
                      <th>Ano</th>
                      <th>Preço</th>
                      <th>KM</th>
                      <th>Status</th>
                      <th>Ações</th>
                    </tr>
                  </thead>
                  <tbody>
                    {veiculosFiltrados.map((v) => (
                      <tr key={v.id}>
                        <td>
                          {v.fotos?.[0]?.url ? (
                            <img src={v.fotos[0].url} alt={`${v.marca} ${v.modelo}`} className={styles.miniaturaFoto} />
                          ) : (
                            <div className={styles.semFoto}>—</div>
                          )}
                        </td>
                        <td>
                          <strong>
                            {v.marca} {v.modelo}
                          </strong>
                        </td>
                        <td>{v.ano}</td>
                        <td>{v.preco.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</td>
                        <td>{v.km.toLocaleString('pt-BR')} km</td>
                        <td>
                          <span className={v.vendido ? styles.tagVendido : v.destaque ? styles.tagDestaque : styles.tagAtivo}>
                            {v.vendido ? 'Vendido' : v.destaque ? 'Destaque' : 'Ativo'}
                          </span>
                        </td>
                        <td>
                          <div className={styles.acoes}>
                            <button onClick={() => navigate(`/admin/veiculos/${v.id}/editar`)}>Editar</button>
                            <button onClick={() => handleDestaque(v.id)}>{v.destaque ? 'Remover destaque' : 'Destacar'}</button>
                            <button onClick={() => handleVendido(v.id)}>{v.vendido ? 'Reativar' : 'Vendido'}</button>
                            <button onClick={() => handleDeletar(v.id)} className={styles.danger}>
                              Excluir
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className={styles.mobileCards}>
                {veiculosFiltrados.map((v) => (
                  <div key={v.id} className={styles.mobileCard}>
                    {v.fotos?.[0]?.url ? (
                      <img src={v.fotos[0].url} alt={`${v.marca} ${v.modelo}`} className={styles.mobileFoto} />
                    ) : (
                      <div className={styles.mobileSemFoto}>Sem foto</div>
                    )}
                    <div className={styles.mobileTop}>
                      <h3>
                        {v.marca} {v.modelo}
                      </h3>
                      <span className={`${styles.mobileTag} ${v.vendido ? styles.tagVendido : v.destaque ? styles.tagDestaque : styles.tagAtivo}`}>
                        {v.vendido ? 'Vendido' : v.destaque ? 'Destaque' : 'Ativo'}
                      </span>
                    </div>
                    <div className={styles.mobileInfos}>
                      <div>
                        <span>Ano</span>
                        <strong>{v.ano}</strong>
                      </div>
                      <div>
                        <span>Preço</span>
                        <strong>{v.preco.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</strong>
                      </div>
                      <div>
                        <span>KM</span>
                        <strong>{v.km.toLocaleString('pt-BR')} km</strong>
                      </div>
                    </div>
                    <div className={styles.mobileActions}>
                      <button onClick={() => navigate(`/admin/veiculos/${v.id}/editar`)}>Editar</button>
                      <button onClick={() => handleDestaque(v.id)}>{v.destaque ? 'Remover destaque' : 'Destacar'}</button>
                      <button onClick={() => handleVendido(v.id)}>{v.vendido ? 'Reativar' : 'Marcar vendido'}</button>
                      <button onClick={() => handleDeletar(v.id)} className={styles.danger}>
                        Remover
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>

        {/* Rodapé com contagem */}
        {veiculosFiltrados.length > 0 && (
          <p className={styles.contagem}>
            Exibindo {veiculosFiltrados.length} de {veiculos.length} veículo(s)
          </p>
        )}
      </main>
    </div>
  )
}
