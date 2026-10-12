import { useEffect, useMemo, useState, type FormEvent } from 'react'
import { useSearchParams } from 'react-router-dom'
import { SlidersHorizontal, X } from 'lucide-react'
import api from '../../api/axios'
import { CardVeiculo } from '../../components/CardVeiculo/CardVeiculo'
import { Spinner } from '../../components/Spinner/Spinner'
import { Feedback } from '../../components/Feedback'
import { Modal } from '../../components/Modal'
import { MarcasCarrossel } from '../../components/MarcasCarrossel/Marcascarrossel'
import type { Veiculo } from '../../types'
import { siteConfig } from '../../config/site'
import styles from './Catalogo.module.css'

const filtrosVazios = { marca: '', modelo: '', preco_max: '', ano: '', combustivel: '', cambio: '', categoria: '' }
type Filtros = typeof filtrosVazios

export function Catalogo() {
  const [searchParams, setSearchParams] = useSearchParams()
  const filtros = Object.fromEntries(Object.keys(filtrosVazios).map(key => [key, searchParams.get(key) ?? ''])) as Filtros
  const ordem = searchParams.get('ordem') ?? 'recentes'

  function aplicar(filtrosNovos: Filtros, novaOrdem = ordem) {
    const params = new URLSearchParams()
    Object.entries(filtrosNovos).forEach(([key, value]) => { if (value) params.set(key, value) })
    if (novaOrdem !== 'recentes') params.set('ordem', novaOrdem)
    setSearchParams(params)
  }

  return <CatalogoConteudo key={searchParams.toString()} filtrosAplicados={filtros} ordem={ordem} aplicar={aplicar} />
}

function CatalogoConteudo({ filtrosAplicados, ordem, aplicar }: { filtrosAplicados: Filtros; ordem: string; aplicar: (filtros: Filtros, ordem?: string) => void }) {
  const [filtros, setFiltros] = useState(filtrosAplicados)
  const [veiculos, setVeiculos] = useState<Veiculo[]>([])
  const [carregando, setCarregando] = useState(true)
  const [erro, setErro] = useState('')
  const [tentativa, setTentativa] = useState(0)
  const [filtrosAbertos, setFiltrosAbertos] = useState(false)

  useEffect(() => {
    const controller = new AbortController()
    // The current API contract has no documented minimum-year filter.
    // Apply that condition locally to the returned catalog instead of inventing an endpoint parameter.
    const params = Object.fromEntries(Object.entries(filtrosAplicados).filter(([key, value]) => value && key !== 'ano'))
    api.get<Veiculo[]>('/veiculos', { params, signal: controller.signal })
      .then(({ data }) => setVeiculos(data.filter(veiculo => !filtrosAplicados.ano || veiculo.ano >= Number(filtrosAplicados.ano))))
      .catch(() => { if (!controller.signal.aborted) setErro('Não foi possível carregar o estoque. Tente novamente.') })
      .finally(() => { if (!controller.signal.aborted) setCarregando(false) })
    return () => controller.abort()
  }, [filtrosAplicados, tentativa])

  const ordenados = useMemo(() => [...veiculos].sort((a, b) => {
    if (ordem === 'menor-preco') return a.preco - b.preco
    if (ordem === 'maior-preco') return b.preco - a.preco
    if (ordem === 'mais-novos') return b.ano - a.ano
    if (ordem === 'menor-km') return a.km - b.km
    return new Date(b.criadoEm).getTime() - new Date(a.criadoEm).getTime()
  }), [veiculos, ordem])

  const etiquetas: Record<keyof Filtros, string> = {
    marca: filtrosAplicados.marca,
    modelo: filtrosAplicados.modelo,
    preco_max: filtrosAplicados.preco_max ? `Até ${Number(filtrosAplicados.preco_max).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 })}` : '',
    ano: filtrosAplicados.ano ? `${filtrosAplicados.ano} ou mais novo` : '',
    combustivel: siteConfig.catalog.fuels.find(item => item.value === filtrosAplicados.combustivel)?.label ?? filtrosAplicados.combustivel,
    cambio: filtrosAplicados.cambio === 'AUTOMATICO' ? 'Automático' : filtrosAplicados.cambio === 'MANUAL' ? 'Manual' : filtrosAplicados.cambio,
    categoria: filtrosAplicados.categoria,
  }
  const ativos = Object.entries(etiquetas).filter(([, value]) => value)
  const draftAlterado = JSON.stringify(filtros) !== JSON.stringify(filtrosAplicados)

  function filtrar(event: FormEvent) {
    event.preventDefault()
    setFiltrosAbertos(false)
    aplicar(filtros)
  }

  const formulario = (
    <form onSubmit={filtrar} className={styles.filtros}>
      <div className={styles.topoFiltros}>
        <h2 className={styles.filtroTitulo}>Refine sua busca</h2>
        <button type="button" onClick={() => { setFiltrosAbertos(false); aplicar(filtrosVazios) }} className={styles.limpar}>Limpar</button>
      </div>
      <div className={styles.grupo}>
        <label htmlFor="filtro-marca" className={styles.label}>Marca</label>
        <select id="filtro-marca" value={filtros.marca} onChange={event => setFiltros({ ...filtros, marca: event.target.value })} className={styles.input}>
          <option value="">Todas as marcas</option>
          {siteConfig.catalog.brands.map(marca => <option key={marca.nome} value={marca.nome}>{marca.nome}</option>)}
        </select>
      </div>
      <div className={styles.grupo}>
        <label htmlFor="filtro-modelo" className={styles.label}>Modelo</label>
        <input id="filtro-modelo" value={filtros.modelo} onChange={event => setFiltros({ ...filtros, modelo: event.target.value })} className={styles.input} placeholder="Ex: Corolla" />
      </div>
      <div className={styles.grupo}>
        <label htmlFor="filtro-preco" className={styles.label}>Preço máximo</label>
        <select id="filtro-preco" value={filtros.preco_max} onChange={event => setFiltros({ ...filtros, preco_max: event.target.value })} className={styles.input}>
          <option value="">Qualquer valor</option>
          {siteConfig.catalog.priceRanges.map(preco => <option key={preco.value} value={preco.value}>{preco.label}</option>)}
          {filtros.preco_max && !siteConfig.catalog.priceRanges.some(item => item.value === filtros.preco_max) && <option value={filtros.preco_max}>Até R$ {Number(filtros.preco_max).toLocaleString('pt-BR')}</option>}
        </select>
      </div>
      <div className={styles.grupo}>
        <label htmlFor="filtro-ano" className={styles.label}>Ano a partir de</label>
        <select id="filtro-ano" value={filtros.ano} onChange={event => setFiltros({ ...filtros, ano: event.target.value })} className={styles.input}>
          <option value="">Qualquer ano</option>
          {siteConfig.catalog.years.map(ano => <option key={ano} value={ano}>{ano}</option>)}
        </select>
      </div>
      <div className={styles.grupo}>
        <label htmlFor="filtro-combustivel" className={styles.label}>Combustível</label>
        <select id="filtro-combustivel" value={filtros.combustivel} onChange={event => setFiltros({ ...filtros, combustivel: event.target.value })} className={styles.input}>
          <option value="">Todos</option>
          {siteConfig.catalog.fuels.map(item => <option key={item.value} value={item.value}>{item.label}</option>)}
        </select>
      </div>
      <div className={styles.grupo}>
        <label htmlFor="filtro-cambio" className={styles.label}>Câmbio</label>
        <select id="filtro-cambio" value={filtros.cambio} onChange={event => setFiltros({ ...filtros, cambio: event.target.value })} className={styles.input}>
          <option value="">Todos</option>
          <option value="MANUAL">Manual</option><option value="AUTOMATICO">Automático</option><option value="CVT">CVT</option>
        </select>
      </div>
      <div className={styles.grupo}><label htmlFor="filtro-categoria" className={styles.label}>Categoria</label><select id="filtro-categoria" value={filtros.categoria} onChange={event => setFiltros({ ...filtros, categoria: event.target.value })} className={styles.input}><option value="">Todas as categorias</option>{siteConfig.catalog.categories.map(item => <option key={item} value={item}>{item}</option>)}{filtros.categoria && !siteConfig.catalog.categories.some(item => item === filtros.categoria) && <option value={filtros.categoria}>{filtros.categoria}</option>}</select></div>
      <button type="submit" className={styles.botaoPrimario}>{draftAlterado ? 'Aplicar filtros' : carregando ? 'Buscar veículos' : `Ver ${veiculos.length} veículo${veiculos.length === 1 ? '' : 's'}`}</button>
    </form>
  )

  return (
    <main className={styles.container}>
      <header className={styles.cabecalho}><span>Nosso estoque</span><h1>Encontre o seu próximo veículo</h1><p>Compare as opções e fale diretamente com nossa equipe.</p></header>
      <MarcasCarrossel marcaSelecionada={filtrosAplicados.marca} onSelecionarMarca={marca => aplicar({ ...filtrosAplicados, marca: marca === filtrosAplicados.marca ? '' : marca })} />
      <div className={styles.layout}>
        {!filtrosAbertos && <aside className={styles.sidebar} aria-label="Filtros do catálogo">{formulario}</aside>}
        {filtrosAbertos && <Modal titulo="Filtros do catálogo" onClose={() => setFiltrosAbertos(false)}>{formulario}</Modal>}
        <section className={styles.main} aria-label="Resultados do catálogo" aria-busy={carregando}>
          <div className={styles.topoResultados}>
            <p className={styles.resultadosTitulo} role="status">{carregando ? 'Buscando veículos...' : erro ? 'Estoque indisponível' : `${veiculos.length} veículo${veiculos.length === 1 ? '' : 's'} encontrado${veiculos.length === 1 ? '' : 's'}`}</p>
            <div className={styles.ferramentas}>
              <button type="button" className={styles.abrirFiltros} onClick={() => setFiltrosAbertos(true)} aria-haspopup="dialog"><SlidersHorizontal size={18} />Filtros{ativos.length > 0 && ` (${ativos.length})`}</button>
              <label className="sr-only" htmlFor="ordem-catalogo">Ordenar veículos</label>
              <select id="ordem-catalogo" className={styles.ordenar} value={ordem} onChange={event => aplicar(filtrosAplicados, event.target.value)}>
                <option value="recentes">Mais recentes</option><option value="menor-preco">Menor preço</option><option value="maior-preco">Maior preço</option><option value="mais-novos">Ano mais novo</option><option value="menor-km">Menor quilometragem</option>
              </select>
            </div>
          </div>
          {ativos.length > 0 && <div className={styles.etiquetas} aria-label="Filtros aplicados">{ativos.map(([key, value]) => <button key={key} type="button" onClick={() => aplicar({ ...filtrosAplicados, [key]: '' })} aria-label={`Remover filtro: ${value}`}>{value}<X size={16} /></button>)}</div>}
          {carregando ? <Spinner /> : erro ? <Feedback mensagem={erro} onRetry={() => { setCarregando(true); setErro(''); setTentativa(current => current + 1) }} /> : ordenados.length === 0 ? (
            <div className={styles.vazio}><h2>Nenhum veículo encontrado</h2><p>Tente remover um filtro para ver mais opções.</p><button className="ui-button" type="button" onClick={() => aplicar(filtrosVazios)}>Limpar filtros</button></div>
          ) : <div className={styles.grid}>{ordenados.map(veiculo => <CardVeiculo key={veiculo.id} veiculo={veiculo} />)}</div>}
        </section>
      </div>
    </main>
  )
}
