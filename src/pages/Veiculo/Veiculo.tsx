import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { Heart, MessageCircle, Fuel, Gauge, Palette, ChevronLeft, ChevronRight, Expand, Loader2 } from 'lucide-react'
import api from '../../api/axios'
import { getWhatsAppUrl, siteConfig } from '../../config/site'
import type { Veiculo as VeiculoType } from '../../types'
import { Spinner } from '../../components/Spinner/Spinner'
import { CardVeiculo } from '../../components/CardVeiculo/CardVeiculo'
import { Feedback } from '../../components/Feedback'
import { Modal } from '../../components/Modal'
import { useFavoritos } from '../../contexts/FavoritosContext'
import { usePlano } from '../../contexts/PlanoContext'
import styles from './Veiculos.module.css'
import { useSite } from '../../contexts/SiteContext'
import { InteresseForm } from './InteresseForm'

export function Veiculo() {
  const { id } = useParams()
  return <VeiculoConteudo key={id} id={id ?? ''} />
}

function VeiculoConteudo({ id }: { id: string }) {
  const site = useSite()
  const [veiculo, setVeiculo] = useState<VeiculoType | null>(null)
  const [relacionados, setRelacionados] = useState<VeiculoType[]>([])
  const [fotoAtiva, setFotoAtiva] = useState(0)
  const [erro, setErro] = useState('')
  const [tentativa, setTentativa] = useState(0)
  const [ampliada, setAmpliada] = useState(false)
  const [interesse, setInteresse] = useState<'SITE' | 'WHATSAPP' | null>(null)
  const { veiculos: favoritos, pendentes, carregando: carregandoFavoritos, alternar } = useFavoritos()
  const { possuiRecurso } = usePlano()

  useEffect(() => {
    const controller = new AbortController()
    api.get<VeiculoType>(`/veiculos/${id}`, { signal: controller.signal })
      .then(({ data }) => {
        setVeiculo(data)
        return api.get<VeiculoType[]>('/veiculos', { params: { marca: data.marca }, signal: controller.signal })
          .then(response => setRelacionados(response.data.filter(item => item.id !== id).slice(0, 3)))
          .catch(() => { /* Related vehicles are optional; the main listing remains available. */ })
      })
      .catch(error => { if (!controller.signal.aborted) setErro(error.response?.status === 404 ? 'Este veículo não foi encontrado. Confira outras opções no estoque.' : 'Não foi possível carregar este veículo.') })
    return () => controller.abort()
  }, [id, tentativa])

  useEffect(() => {
    if (veiculo) document.title = `${veiculo.marca} ${veiculo.modelo} ${veiculo.ano} | ${site.nomeCompleto}`
    return () => { document.title = site.nomeCompleto }
  }, [veiculo, site.nomeCompleto])

  if (erro) return <main className={styles.main}><Feedback mensagem={erro} onRetry={() => { setErro(''); setTentativa(value => value + 1) }} /><Link className="ui-button" to="/catalogo">Voltar ao estoque</Link></main>
  if (!veiculo) return <Spinner />

  const nome = `${veiculo.marca} ${veiculo.modelo}`
  const foto = veiculo.fotos[fotoAtiva]
  const favoritado = favoritos.some(item => item.id === id)
  const ocupado = pendentes.includes(id)
  const preco = veiculo.preco.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
  const whatsappUrl = getWhatsAppUrl(`Olá! Tenho interesse no ${nome} ${veiculo.ano}. ${window.location.href}`)
  const selecionarFoto = (direcao: number) => setFotoAtiva(current => (current + direcao + veiculo.fotos.length) % veiculo.fotos.length)
  const controlesGaleria = veiculo.fotos.length > 1 && <>
    <button type="button" onClick={() => selecionarFoto(-1)} aria-label="Foto anterior" className={`${styles.seta} ${styles.setaEsquerda}`}><ChevronLeft size={22} /></button>
    <button type="button" onClick={() => selecionarFoto(1)} aria-label="Próxima foto" className={`${styles.seta} ${styles.setaDireita}`}><ChevronRight size={22} /></button>
  </>

  return (
    <main className={styles.main}>
      <nav className={styles.breadcrumb} aria-label="Você está em"><Link to="/">Início</Link><span aria-hidden="true">/</span><Link to="/catalogo">Estoque</Link><span aria-hidden="true">/</span><span aria-current="page">{nome}</span></nav>
      <div className={styles.layout}>
        <section className={styles.galeria} aria-label="Fotos do veículo">
          <div className={styles.fotoGrande}>
            {foto ? <>
              <button type="button" className={styles.ampliarFoto} onClick={() => setAmpliada(true)} aria-label={`Ampliar foto ${fotoAtiva + 1} de ${nome}`}><img src={foto.url} alt={`${nome}, foto ${fotoAtiva + 1}`} className={styles.imagemGrande} /><span className={styles.ampliarIcone}><Expand size={18} />Ampliar</span></button>
              {controlesGaleria}
              <span className={styles.contador} role="status">{fotoAtiva + 1} / {veiculo.fotos.length}</span>
            </> : <div className={styles.semFoto}>Fotos em breve</div>}
          </div>
          {veiculo.fotos.length > 1 && <div className={styles.miniaturas}>{veiculo.fotos.map((item, index) => <button key={item.id} type="button" onClick={() => setFotoAtiva(index)} aria-label={`Ver foto ${index + 1} de ${nome}`} aria-pressed={index === fotoAtiva} className={`${styles.miniatura} ${index === fotoAtiva ? styles.miniaturaAtiva : ''}`}><img src={item.url} alt="" loading="lazy" decoding="async" /></button>)}</div>}
        </section>
        <section className={styles.detalhes} aria-label="Informações do veículo">
          <div className={styles.cabecalho}>
            <div><h1 className={styles.nomeVeiculo}>{nome}</h1><p className={styles.anoKm}>{veiculo.ano} · {veiculo.km.toLocaleString('pt-BR')} km</p></div>
            <button type="button" onClick={() => void alternar(veiculo)} disabled={carregandoFavoritos || ocupado} aria-busy={ocupado} aria-label={favoritado ? `Remover ${nome} dos favoritos` : `Salvar ${nome} nos favoritos`} aria-pressed={favoritado} className={`${styles.botaoFavorito} ${favoritado ? styles.favoritado : ''}`}>{ocupado ? <Loader2 size={22} /> : <Heart size={22} fill={favoritado ? 'currentColor' : 'none'} />}</button>
          </div>
          <p className={styles.preco}>{preco}</p>
          {veiculo.vendido && <p className={styles.indisponivel}>Este veículo já foi vendido. Confira outras opções no catálogo.</p>}
          <div className={styles.specs}>
            <div className={styles.spec}><Fuel size={18} /><div><span className={styles.specLabel}>Combustível</span><span className={styles.specValor}>{siteConfig.catalog.fuels.find(item => item.value === veiculo.combustivel)?.label ?? veiculo.combustivel}</span></div></div>
            <div className={styles.spec}><Gauge size={18} /><div><span className={styles.specLabel}>Câmbio</span><span className={styles.specValor}>{veiculo.cambio === 'AUTOMATICO' ? 'Automático' : veiculo.cambio === 'MANUAL' ? 'Manual' : veiculo.cambio}</span></div></div>
            <div className={styles.spec}><Palette size={18} /><div><span className={styles.specLabel}>Cor</span><span className={styles.specValor}>{veiculo.cor}</span></div></div>
          </div>
          <div className={styles.ctas}>
            {siteConfig.contact.whatsapp && (possuiRecurso('LEADS') && !veiculo.vendido ? <button onClick={() => setInteresse('WHATSAPP')} className={styles.botaoWhatsApp}><MessageCircle size={20} />Falar no WhatsApp</button> : <a href={whatsappUrl} target="_blank" rel="noreferrer" className={styles.botaoWhatsApp}><MessageCircle size={20} />Falar no WhatsApp</a>)}
            {possuiRecurso('LEADS') && !veiculo.vendido && <><button className={styles.botaoFinanciamento} onClick={() => setInteresse('SITE')}>Tenho interesse</button><Link to={`/financiamento?veiculo=${encodeURIComponent(id)}`} className={styles.botaoFinanciamento}>Solicitar financiamento</Link></>}
          </div>
          {veiculo.descricao && <div className={styles.descricao}><h2 className={styles.descricaoTitulo}>Sobre o veículo</h2><p className={styles.descricaoTexto}>{veiculo.descricao}</p></div>}
          {veiculo.categoria && <p>Categoria: <strong>{veiculo.categoria}</strong></p>}
          {!!veiculo.opcionais?.length && <section className={styles.descricao}><h2 className={styles.descricaoTitulo}>Opcionais</h2><ul className={styles.opcionais}>{veiculo.opcionais.map(item => <li key={item}>{item}</li>)}</ul></section>}
        </section>
      </div>
      {relacionados.length > 0 && <section className={styles.relacionados}><div className={styles.relacionadosTopo}><h2 className={styles.relacionadosTitulo}>Também pode te interessar</h2><p className={styles.relacionadosTexto}>Conheça outras opções disponíveis na loja.</p></div><div className={styles.relacionadosGrid}>{relacionados.map(item => <CardVeiculo key={item.id} veiculo={item} />)}</div></section>}
      {siteConfig.contact.whatsapp && <div data-mobile-contact className={styles.contatoMobile}><div><span>Valor do veículo</span><strong>{preco}</strong></div>{possuiRecurso('LEADS') && !veiculo.vendido ? <button onClick={() => setInteresse('WHATSAPP')}><MessageCircle size={20} />Falar com a loja</button> : <a href={whatsappUrl} target="_blank" rel="noreferrer"><MessageCircle size={20} />Falar com a loja</a>}</div>}
      {interesse && <Modal titulo={`Interesse em ${nome}`} onClose={() => setInteresse(null)}><InteresseForm veiculo={veiculo} continuarWhatsApp={interesse === 'WHATSAPP'} /></Modal>}
      {ampliada && foto && <Modal ampla titulo={`Fotos de ${nome}`} onClose={() => setAmpliada(false)} onKeyDown={event => {
        if (event.key === 'ArrowRight' || event.key === 'ArrowLeft') {
          event.preventDefault()
          selecionarFoto(event.key === 'ArrowRight' ? 1 : -1)
        }
      }}><div className={styles.lightbox}><img src={foto.url} alt={`${nome}, foto ${fotoAtiva + 1}`} />{controlesGaleria}<p role="status">Foto {fotoAtiva + 1} de {veiculo.fotos.length}</p></div></Modal>}
    </main>
  )
}
