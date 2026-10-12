import { useEffect, useState, useMemo } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { CarFront, ChevronDown, Pencil, Plus } from 'lucide-react'

import api from '../../../api/axios'
import type { Veiculo } from '../../../types'

import { Spinner } from '../../../components/Spinner/Spinner'
import { AdminNavBar } from '../../../components/AdminNavBar/AdminNavBar'
import { AdminVoltar } from '../../../components/AdminVoltar/AdminVoltar'
import { Feedback } from '../../../components/Feedback'
import { ConfirmDialog } from '../../../components/Modal'
import { useAuth } from '../../../contexts/AuthContext'
import { AdminPageHeader } from '../../../components/AdminPageHeader'

import styles from './Estoque.module.css'

type Filtro = 'TODOS' | 'ATIVO' | 'DESTAQUE' | 'VENDIDO'

export function Estoque() {
  const { usuario } = useAuth()
  const podeEditar = usuario?.role === 'ADMIN'
  const [veiculos, setVeiculos] = useState<Veiculo[]>([])
  const [carregando, setCarregando] = useState(true)
  const [searchParams, setSearchParams] = useSearchParams()
  const busca = searchParams.get('busca') ?? ''
  const [erro, setErro] = useState('')
  const [sucesso, setSucesso] = useState('')
  const [tentativa, setTentativa] = useState(0)
  const [pendentes, setPendentes] = useState<string[]>([])
  const [remover, setRemover] = useState<Veiculo | null>(null)
  const [filtro, setFiltro] = useState<Filtro>('TODOS')

  function setBusca(valor: string) {
    const params = new URLSearchParams(searchParams)
    if (valor) params.set('busca', valor)
    else params.delete('busca')
    setSearchParams(params, { replace: true })
  }
  useEffect(() => {
    const controller = new AbortController()
    async function carregarEstoque() {
      try {
        const { data } = await api.get<Veiculo[]>('/admin/estoque', { signal: controller.signal })
        setVeiculos(data)
      } catch {
        if (!controller.signal.aborted) setErro('Não foi possível carregar o estoque.')
      } finally {
        if (!controller.signal.aborted) setCarregando(false)
      }
    }

    void carregarEstoque()
    return () => controller.abort()
  }, [tentativa])

  async function handleDeletar(id: string) {
    await executar(id, async () => {
      await api.delete(`/veiculos/${id}`)
      setVeiculos((prev) => prev.filter((v) => v.id !== id))
    }, 'Veículo removido do estoque.')
    setRemover(null)
  }

  async function handleDestaque(id: string) {
    await executar(id, async () => {
      const { data } = await api.patch<Veiculo>(`/veiculos/${id}/destaque`)
      setVeiculos((prev) => prev.map((v) => (v.id === id ? data : v)))
    }, 'Destaque atualizado.')
  }

  async function handleVendido(id: string) {
    await executar(id, async () => {
      const { data } = await api.patch<Veiculo>(`/veiculos/${id}/vendido`)
      setVeiculos((prev) => prev.map((v) => (v.id === id ? data : v)))
    }, 'Status do veículo atualizado.')
  }

  async function executar(id: string, acao: () => Promise<void>, mensagem: string) {
    if (!podeEditar || pendentes.includes(id)) return
    setPendentes(current => [...current, id])
    setErro('')
    setSucesso('')
    try { await acao(); setSucesso(mensagem) }
    catch (error: unknown) {
      const apiError = error as { response?: { data?: { message?: string } } }
      setErro(apiError.response?.data?.message ?? 'Não foi possível concluir a ação. Tente novamente.')
    } finally { setPendentes(current => current.filter(item => item !== id)) }
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
        if (filtro === 'ATIVO') return !v.vendido
        return true
      })
  }, [veiculos, busca, filtro])


  const quantidade = (total: number) => carregando ? '…' : erro && !veiculos.length ? '—' : total
  const filtros: { label: string; valor: Filtro }[] = [
    { label: `Todos (${quantidade(veiculos.length)})`, valor: 'TODOS' },
    { label: `Ativos (${quantidade(veiculos.filter((v) => !v.vendido).length)})`, valor: 'ATIVO' },
    { label: `Destaques (${quantidade(veiculos.filter((v) => v.destaque && !v.vendido).length)})`, valor: 'DESTAQUE' },
    { label: `Vendidos (${quantidade(veiculos.filter((v) => v.vendido).length)})`, valor: 'VENDIDO' },
  ]

  function acoesVeiculo(v: Veiculo) {
    if (!podeEditar) return <Link className="ui-button" to={`/veiculo/${v.id}`}>Ver anúncio</Link>
    const ocupado = pendentes.includes(v.id)
    return <div className={styles.acoes} aria-busy={ocupado}>
      <Link className="ui-button" to={`/admin/veiculos/${v.id}/editar`} aria-label={`Editar ${v.marca} ${v.modelo}`}><Pencil size={15} aria-hidden="true" />Editar</Link>
      <details className={styles.maisAcoes} name="acoes-veiculo">
        <summary>Mais ações<ChevronDown size={15} aria-hidden="true" /><span className="sr-only"> de {v.marca} {v.modelo}</span></summary>
        <div className={styles.menuAcoes}>
          <button disabled={ocupado} onClick={() => void handleDestaque(v.id)}>{v.destaque ? 'Remover destaque' : 'Destacar'}</button>
          <button disabled={ocupado} onClick={() => void handleVendido(v.id)}>{v.vendido ? 'Reativar' : 'Marcar vendido'}</button>
          <button disabled={ocupado} onClick={() => setRemover(v)} className={styles.danger}>Excluir veículo</button>
        </div>
      </details>
    </div>
  }

  const fotoCapa = (v: Veiculo) => (v.fotos?.find(f => f.capa) ?? v.fotos?.[0])?.url

  return (
    <div className={`${styles.container} admin-shell`}>
      <AdminNavBar />

      <main id="conteudo-admin" className={`${styles.main} admin-content`}>
        <AdminPageHeader contexto="Operação" titulo="Estoque" descricao={podeEditar ? 'Organize seus anúncios, preços, fotos e disponibilidade.' : 'Consulte os veículos da revenda para seus atendimentos.'} acoes={<><AdminVoltar />{podeEditar && <Link to="/admin/veiculos/novo" className="ui-button ui-button-primary"><Plus size={17} aria-hidden="true" />Novo veículo</Link>}</>} />

        {erro && <Feedback mensagem={erro} onRetry={() => { setErro(''); setCarregando(true); setTentativa(value => value + 1) }} />}
        {sucesso && <Feedback mensagem={sucesso} tipo="sucesso" />}
        {/* Busca e filtros */}
        <div className={styles.controles}>
          <label className={styles.labelBusca} htmlFor="estoque-busca">Buscar veículo</label>
          <input
            id="estoque-busca"
            type="search"
            placeholder="Buscar por marca, modelo ou ano..."
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
            className={styles.inputBusca}
            aria-label="Buscar estoque por marca, modelo ou ano"
          />
          <div className={styles.filtros} role="group" aria-label="Filtrar por disponibilidade">
            {filtros.map((f) => (
              <button
                key={f.valor}
                onClick={() => setFiltro(f.valor)}
                className={`${styles.filtroBotao} ${filtro === f.valor ? styles.filtroAtivo : ''}`}
                aria-pressed={filtro === f.valor}
                disabled={carregando}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>

        <div className={styles.card}>
          {carregando ? <Spinner /> : erro && veiculos.length === 0 ? null : veiculosFiltrados.length === 0 ? (
            <div className={styles.vazio}><CarFront size={32} aria-hidden="true" /><h2>{busca || filtro !== 'TODOS' ? 'Nenhum veículo neste filtro' : 'Seu estoque começa aqui'}</h2><p>{busca || filtro !== 'TODOS' ? 'Tente outro termo ou volte a exibir todos os veículos.' : 'Cadastre o primeiro veículo para publicar seu anúncio na vitrine.'}</p>{busca || filtro !== 'TODOS' ? <button className="ui-button" onClick={() => { setBusca(''); setFiltro('TODOS') }}>Limpar filtros</button> : podeEditar && <Link className="ui-button ui-button-primary" to="/admin/veiculos/novo">Cadastrar veículo</Link>}</div>
          ) : (
            <>
              <div className={styles.desktopTable}>
                <table className={styles.tabela}>
                  <caption className="sr-only">Veículos da revenda com preço, disponibilidade e ações</caption>
                  <thead>
                    <tr>
                      <th>Foto</th>
                      <th className={styles.modelo}>Veículo</th>
                      <th>Preço</th>
                      <th>Status</th>
                      <th>Ações</th>
                    </tr>
                  </thead>
                  <tbody>
                    {veiculosFiltrados.map((v) => (
                      <tr key={v.id}>
                        <td>
                          {fotoCapa(v) ? (
                            <img src={fotoCapa(v)} alt={`${v.marca} ${v.modelo}`} loading="lazy" className={styles.miniaturaFoto} />
                          ) : (
                            <div className={styles.semFoto}>—</div>
                          )}
                        </td>
                        <td>
                          <strong>
                            {v.marca} {v.modelo}
                           </strong>
                           <span className={styles.dadosVeiculo}>{v.ano} · {v.km.toLocaleString('pt-BR')} km</span>
                        </td>
                        <td className={styles.preco}>{v.preco.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</td>
                        <td>
                          <span className={v.vendido ? styles.tagVendido : v.destaque ? styles.tagDestaque : styles.tagAtivo}>
                            {v.vendido ? 'Vendido' : v.destaque ? 'Destaque' : 'Ativo'}
                          </span>
                        </td>
                        <td>
                          {acoesVeiculo(v)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className={styles.mobileCards}>
                {veiculosFiltrados.map((v) => (
                  <div key={v.id} className={styles.mobileCard}>
                    {fotoCapa(v) ? (
                      <img src={fotoCapa(v)} alt={`${v.marca} ${v.modelo}`} loading="lazy" className={styles.mobileFoto} />
                    ) : (
                      <div className={styles.mobileSemFoto}>Sem foto</div>
                    )}
                    <div className={styles.mobileTop}>
                      <h2>
                        {v.marca} {v.modelo}
                      </h2>
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
                    <div className={styles.mobileActions}>{acoesVeiculo(v)}</div>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>

        {/* Rodapé com contagem */}
        {veiculosFiltrados.length > 0 && (
          <p className={styles.contagem} role="status">
            Exibindo {veiculosFiltrados.length} de {veiculos.length} veículo(s)
          </p>
        )}
      </main>
      {remover && <ConfirmDialog titulo="Remover veículo?" mensagem={`${remover.marca} ${remover.modelo} será removido do estoque.`} ocupado={pendentes.includes(remover.id)} onClose={() => setRemover(null)} onConfirm={() => void handleDeletar(remover.id)} />}
    </div>
  )
}
