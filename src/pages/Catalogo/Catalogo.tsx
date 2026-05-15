import { useEffect, useState } from 'react'
import api from '../../api/axios'
import { CardVeiculo } from '../../components/CardVeiculo/CardVeiculo'
import { Spinner } from '../../components/Spinner/Spinner'
import { NavBar } from '../../components/NavBar/NavBar'
import type { Veiculo } from '../../types'
import styles from './Catalogo.module.css'

const SESSION_KEY = 'catalogo_session_id'
const marcasPopulares = ['Todas', 'Toyota', 'Honda', 'Volkswagen', 'Chevrolet', 'Hyundai', 'Fiat', 'Jeep', 'BMW', 'Audi', 'Mercedes-Benz']

const combustiveis = ['GASOLINA', 'ETANOL', 'FLEX', 'DIESEL', 'ELETRICO', 'HIBRIDO']
const cambios = ['MANUAL', 'AUTOMATICO', 'CVT']

const faixasPreco = [
  {
    label: 'Até R$ 50 mil',
    value: '50000',
  },
  {
    label: 'Até R$ 80 mil',
    value: '80000',
  },
  {
    label: 'Até R$ 120 mil',
    value: '120000',
  },
  {
    label: 'Até R$ 200 mil',
    value: '200000',
  },
]

function getSessionId() {
  let id = localStorage.getItem(SESSION_KEY)

  if (!id) {
    id = crypto.randomUUID()

    localStorage.setItem(SESSION_KEY, id)
  }

  return id
}

export function Catalogo() {
  const [veiculos, setVeiculos] = useState<Veiculo[]>([])
  const [favoritos, setFavoritos] = useState<string[]>([])
  const [carregando, setCarregando] = useState(true)
  const [filtros, setFiltros] = useState({
    marca: '',
    modelo: '',
    preco_max: '',
    combustivel: '',
    cambio: '',
  })

  const sessionId = getSessionId()

  useEffect(() => {
    carregarFavoritos()
    carregarVeiculos()
  }, [])

  async function carregarVeiculos(params?: Record<string, string>) {
    setCarregando(true)

    try {
      const { data } = await api.get<Veiculo[]>('/veiculos', {
        params,
      })

      setVeiculos(data)
    } finally {
      setCarregando(false)
    }
  }

  async function carregarFavoritos() {
    try {
      const { data } = await api.get<Veiculo[]>(`/favoritos?sessionId=${sessionId}`)

      setFavoritos(data.map((v) => v.id))
    } catch {}
  }

  async function handleFavoritar(veiculoId: string) {
    if (favoritos.includes(veiculoId)) {
      await api.delete(`/favoritos/${veiculoId}`, {
        data: {
          sessionId,
        },
      })

      setFavoritos((prev) => prev.filter((id) => id !== veiculoId))
    } else {
      await api.post('/favoritos', {
        sessionId,
        veiculoId,
      })

      setFavoritos((prev) => [...prev, veiculoId])
    }
  }

  function handleFiltrar(e: React.FormEvent) {
    e.preventDefault()

    const params: Record<string, string> = {}

    Object.entries(filtros).forEach(([k, v]) => {
      if (v) {
        params[k] = v
      }
    })

    carregarVeiculos(params)
  }

  function handleLimpar() {
    const filtrosLimpos = {
      marca: '',
      modelo: '',
      preco_max: '',
      combustivel: '',
      cambio: '',
    }

    setFiltros(filtrosLimpos)

    carregarVeiculos()
  }

  return (
    <div className={styles.container}>
      <NavBar />

      <div className={styles.layout}>
        <aside className={styles.sidebar}>
          <form onSubmit={handleFiltrar} className={styles.filtros}>
            <div className={styles.topoFiltros}>
              <h3 className={styles.filtroTitulo}>Filtros</h3>

              <button type="button" onClick={handleLimpar} className={styles.limpar}>
                Limpar
              </button>
            </div>

            <div className={styles.grupo}>
              <label className={styles.label}>Marca</label>

              <div className={styles.marcasGrid}>
                {marcasPopulares.map((marca) => {
                  const ativo = (marca === 'Todas' && !filtros.marca) || filtros.marca === marca

                  return (
                    <button
                      key={marca}
                      type="button"
                      aria-pressed={ativo}
                      onClick={() =>
                        setFiltros((prev) => ({
                          ...prev,
                          marca: marca === 'Todas' ? '' : marca,
                        }))
                      }
                      className={`${styles.marcaItem} ${ativo ? styles.marcaAtiva : ''}`}
                    >
                      {marca}
                    </button>
                  )
                })}
              </div>
            </div>

            <div className={styles.grupo}>
              <label className={styles.label}>Modelo</label>

              <input
                value={filtros.modelo}
                onChange={(e) =>
                  setFiltros((p) => ({
                    ...p,
                    modelo: e.target.value,
                  }))
                }
                className={styles.input}
                placeholder="Ex: Corolla"
              />
            </div>

            <div className={styles.grupo}>
              <label className={styles.label}>Faixa de preço</label>

              <div className={styles.precos}>
                {faixasPreco.map((preco) => (
                  <button
                    key={preco.value}
                    type="button"
                    onClick={() =>
                      setFiltros((p) => ({
                        ...p,
                        preco_max: preco.value,
                      }))
                    }
                    className={`${styles.precoItem} ${filtros.preco_max === preco.value ? styles.precoAtivo : ''}`}
                  >
                    {preco.label}
                  </button>
                ))}
              </div>
            </div>

            <div className={styles.gridSelects}>
              <div className={styles.grupo}>
                <label className={styles.label}>Combustível</label>

                <select
                  value={filtros.combustivel}
                  onChange={(e) =>
                    setFiltros((p) => ({
                      ...p,
                      combustivel: e.target.value,
                    }))
                  }
                  className={styles.input}
                >
                  <option value="">Todos</option>

                  {combustiveis.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              </div>

              <div className={styles.grupo}>
                <label className={styles.label}>Câmbio</label>

                <select
                  value={filtros.cambio}
                  onChange={(e) =>
                    setFiltros((p) => ({
                      ...p,
                      cambio: e.target.value,
                    }))
                  }
                  className={styles.input}
                >
                  <option value="">Todos</option>

                  {cambios.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <button type="submit" className={styles.botaoPrimario}>
              Buscar veículos
            </button>
          </form>
        </aside>

        <main className={styles.main}>
          {carregando ? (
            <Spinner />
          ) : veiculos.length === 0 ? (
            <div className={styles.vazio}>
              <h3>Nenhum veículo encontrado</h3>

              <p>Tente ajustar os filtros para ver mais opções.</p>
            </div>
          ) : (
            <>
              <div className={styles.topoResultados}>
                <h2 className={styles.resultadosTitulo}>
                  {veiculos.length} veículo
                  {veiculos.length > 1 ? 's' : ''} encontrado
                  {veiculos.length > 1 ? 's' : ''}
                </h2>
              </div>

              <div className={styles.grid}>
                {veiculos.map((v) => (
                  <CardVeiculo key={v.id} veiculo={v} favoritado={favoritos.includes(v.id)} onFavoritar={handleFavoritar} />
                ))}
              </div>
            </>
          )}
        </main>
      </div>
    </div>
  )
}
