import { useCallback, useEffect, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { Columns3, List, Plus, Search, ChevronLeft, ChevronRight, MessageCircle } from 'lucide-react'
import api from '../../../api/axios'
import { AdminNavBar } from '../../../components/AdminNavBar/AdminNavBar'
import { AdminVoltar } from '../../../components/AdminVoltar/AdminVoltar'
import { Spinner } from '../../../components/Spinner/Spinner'
import { Feedback } from '../../../components/Feedback'
import { Modal } from '../../../components/Modal'
import { FormField } from '../../../components/FormField'
import { useAuth } from '../../../contexts/AuthContext'
import { usePlano } from '../../../contexts/PlanoContext'
import type { Etapa, LeadCRM, NovoLead, Origem, PaginaLeads, UsuarioCRM, VeiculoCRM } from '../../../types/crm'
import { dataHora, erroCRM, ETAPAS, nomeVeiculo, ORIGENS, TIPOS, whatsappUrl } from '../../../utils/crm'
import { LeadForm } from './LeadForm'
import { LeadDetail } from './LeadDetail'
import { useCrmMutation } from './useCrmMutation'
import { AdminPageHeader } from '../../../components/AdminPageHeader'
import styles from './Leads.module.css'

type Filtros = { busca: string; etapa: Etapa | ''; origem: Origem | ''; responsavel: string; page: number; pageSize: number }

function filtrosDaURL(params: URLSearchParams): Filtros {
  const etapa = params.get('etapa') ?? ''
  const origem = params.get('origem') ?? ''
  const page = Number(params.get('page') ?? 1)
  const pageSize = Number(params.get('pageSize') ?? 20)
  return {
    busca: (params.get('busca') ?? '').slice(0, 120),
    etapa: ETAPAS.some(e => e.valor === etapa) ? etapa as Etapa : '',
    origem: ORIGENS.some(o => o.valor === origem) ? origem as Origem : '',
    responsavel: params.get('responsavel') ?? '',
    page: Number.isInteger(page) && page > 0 && page <= 100000 ? page : 1,
    pageSize: [10, 20, 50].includes(pageSize) ? pageSize : 20,
  }
}

export function Leads() {
  const { usuario } = useAuth()
  const { carregando: carregandoPlano, possuiRecurso } = usePlano()
  const [searchParams, setSearchParams] = useSearchParams()
  const filtros = filtrosDaURL(searchParams)
  const setFiltros = useCallback((next: Filtros | ((current: Filtros) => Filtros)) => {
    setSearchParams(current => {
      const values = typeof next === 'function' ? next(filtrosDaURL(current)) : next
      const params = new URLSearchParams(current)
      for (const [key, value] of Object.entries(values)) {
        if (value === '' || (key === 'page' && value === 1) || (key === 'pageSize' && value === 20)) params.delete(key)
        else params.set(key, String(value))
      }
      return params
    }, { replace: true })
  }, [setSearchParams])
  const [vista, setVista] = useState<'lista' | 'funil'>('lista')
  const [versao, setVersao] = useState(0)
  const [snapshot, setSnapshot] = useState<{ chave: string; data?: PaginaLeads; erro?: string } | null>(null)
  const [opcoesVersao, setOpcoesVersao] = useState(0)
  const [opcoes, setOpcoes] = useState<{ versao: string; usuarios: UsuarioCRM[]; veiculos: VeiculoCRM[]; erro: string } | null>(null)
  const [novo, setNovo] = useState(false)
  const [agora, setAgora] = useState(Date.now)
  const mutation = useCrmMutation()
  const funil = possuiRecurso('FUNIL_ATENDIMENTO')
  const propostas = possuiRecurso('PROPOSTAS')
  const podeAtribuir = usuario?.role === 'ADMIN' && possuiRecurso('DISTRIBUICAO_LEADS')
  const permitido = possuiRecurso('LEADS') || funil
  const responsavelId = usuario?.role === 'VENDEDOR' || filtros.responsavel === 'MEUS' ? usuario?.id : filtros.responsavel || undefined
  const params = { busca: filtros.busca.trim() || undefined, etapa: filtros.etapa || undefined, origem: filtros.origem || undefined, responsavelId, page: filtros.page, pageSize: filtros.pageSize }
  const chave = JSON.stringify({ ...params, versao })
  const chaveOpcoes = `${opcoesVersao}:${podeAtribuir}`
  const carregando = snapshot?.chave !== chave
  const pagina = !carregando ? snapshot?.data : undefined
  const erroLista = !carregando ? snapshot?.erro : undefined
  const veiculos = opcoes?.veiculos ?? []
  const usuarios = opcoes?.usuarios ?? []
  const carregandoOpcoes = opcoes?.versao !== chaveOpcoes
  const erroOpcoes = !carregandoOpcoes ? opcoes?.erro ?? '' : ''
  const leadId = searchParams.get('lead')

  useEffect(() => {
    const timer = window.setInterval(() => setAgora(Date.now()), 60_000)
    return () => window.clearInterval(timer)
  }, [])

  useEffect(() => {
    if (carregandoPlano || !permitido || !usuario) return
    const controller = new AbortController()
    // The serialized key is the request snapshot; later responses cannot replace another query.
    const { versao: _versao, ...query } = JSON.parse(chave)
    void _versao
    const timer = window.setTimeout(() => {
      api.get<PaginaLeads>('/crm/leads', { params: query, signal: controller.signal })
        .then(({ data }) => {
          if (controller.signal.aborted) return
          const ultimaPagina = Math.max(1, Math.ceil(data.total / data.pageSize))
          if (data.page > ultimaPagina) setFiltros(atual => ({ ...atual, page: ultimaPagina }))
          else setSnapshot({ chave, data })
        })
        .catch(error => { if (!controller.signal.aborted) setSnapshot({ chave, erro: erroCRM(error, 'Não foi possível carregar os leads. Seus filtros foram preservados.') }) })
    }, 300)
    return () => { window.clearTimeout(timer); controller.abort() }
  }, [chave, carregandoPlano, permitido, usuario, setFiltros])

  useEffect(() => {
    if (carregandoPlano || !permitido) return
    const controller = new AbortController()
    Promise.all([
      api.get<VeiculoCRM[]>('/crm/veiculos', { signal: controller.signal }),
      podeAtribuir ? api.get<UsuarioCRM[]>('/crm/usuarios', { signal: controller.signal }) : Promise.resolve({ data: [] as UsuarioCRM[] }),
    ]).then(([vehicles, users]) => {
      if (!controller.signal.aborted) setOpcoes({ versao: chaveOpcoes, usuarios: users.data, veiculos: vehicles.data, erro: '' })
    }).catch(error => {
      if (!controller.signal.aborted) setOpcoes({ versao: chaveOpcoes, usuarios: [], veiculos: [], erro: erroCRM(error, 'Não foi possível carregar os veículos ou responsáveis.') })
    })
    return () => controller.abort()
  }, [chaveOpcoes, carregandoPlano, permitido, podeAtribuir])

  function filtrar(dados: Partial<Filtros>) { setFiltros(atual => ({ ...atual, ...dados, page: 1 })) }
  function abrir(id: string) { setSearchParams(atual => { const next = new URLSearchParams(atual); next.set('lead', id); return next }) }
  function fechar() { setSearchParams(atual => { const next = new URLSearchParams(atual); next.delete('lead'); return next }, { replace: true }) }
  function atualizar() { setVersao(v => v + 1); setOpcoesVersao(v => v + 1) }

  async function criar(dados: NovoLead) {
    let id: string | undefined
    const ok = await mutation.executar(async () => {
      const { data } = await api.post<LeadCRM>('/crm/leads', dados)
      id = data.id
    }, 'Lead criado.')
    if (ok) {
      setNovo(false)
      atualizar()
      if (id) abrir(id)
    }
  }

  const totalPaginas = pagina ? Math.max(1, Math.ceil(pagina.total / pagina.pageSize)) : 1
  return <div className={`${styles.container} admin-shell`}>
    <AdminNavBar />
    <main id="conteudo-admin" className={`${styles.main} admin-content`}>
      <AdminPageHeader contexto="Relacionamento comercial" titulo="Leads e atendimento" descricao="Do primeiro interesse ao fechamento, com cada próximo passo registrado." acoes={<><AdminVoltar /><button className="ui-button ui-button-primary" disabled={carregandoPlano || !permitido} onClick={() => setNovo(true)}><Plus size={18} aria-hidden="true" />Novo lead</button></>} />
      {carregandoPlano ? <Spinner /> : !permitido ? <section className={styles.empty}><h2>CRM indisponível neste plano</h2><p>Seu plano precisa incluir a gestão de leads para acessar este atendimento.</p></section> : <>
        {!novo && mutation.sucesso && <Feedback mensagem={mutation.sucesso} tipo="sucesso" />}
        <section className={styles.filters} aria-label="Filtros de leads">
          <div className={styles.filterGrid}>
            <FormField id="crm-busca" label="Buscar lead"><div className={styles.search}><Search size={18} aria-hidden="true" /><input id="crm-busca" type="search" placeholder="Nome, telefone ou e-mail" value={filtros.busca} maxLength={120} onChange={e => filtrar({ busca: e.target.value })} /></div></FormField>
            <FormField id="crm-origem" label="Origem"><select id="crm-origem" value={filtros.origem} onChange={e => filtrar({ origem: e.target.value as Origem | '' })}><option value="">Todas as origens</option>{ORIGENS.map(o => <option key={o.valor} value={o.valor}>{o.label}</option>)}</select></FormField>
            <FormField id="crm-responsavel" label="Responsável"><select id="crm-responsavel" value={usuario?.role === 'VENDEDOR' ? 'MEUS' : filtros.responsavel} disabled={usuario?.role === 'VENDEDOR'} onChange={e => filtrar({ responsavel: e.target.value })}><option value="">Todos os acessíveis</option><option value="MEUS">Meus leads</option>{podeAtribuir && !carregandoOpcoes && usuarios.map(u => <option key={u.id} value={u.id}>{u.nome}</option>)}</select></FormField>
            <FormField id="crm-etapa" label="Etapa"><select id="crm-etapa" value={filtros.etapa} disabled={!funil} onChange={e => filtrar({ etapa: e.target.value as Etapa | '' })}><option value="">Todas as etapas</option>{ETAPAS.map(e => <option key={e.valor} value={e.valor}>{e.label}</option>)}</select></FormField>
          </div>
          <div className={styles.filterFooter}>
            <p className={styles.hint}>{usuario?.role === 'VENDEDOR' ? 'Você visualiza somente os leads autorizados para seu usuário.' : 'Os filtros consultam o CRM completo acessível ao seu usuário.'}</p>
            <button className="ui-button" onClick={() => setFiltros({ busca: '', etapa: '', origem: '', responsavel: '', page: 1, pageSize: filtros.pageSize })}>Limpar filtros</button>
          </div>
        </section>
        {erroOpcoes && <Feedback mensagem={erroOpcoes} onRetry={() => setOpcoesVersao(v => v + 1)} />}

        <div className={styles.viewHeader}>
          <h2>{vista === 'funil' && funil ? 'Funil de atendimento' : 'Lista de leads'}</h2>
          <div className={styles.viewSwitch} aria-label="Visualização"><button aria-pressed={vista === 'lista'} onClick={() => setVista('lista')}><List size={18} aria-hidden="true" />Lista</button><button aria-pressed={vista === 'funil'} disabled={!funil} onClick={() => setVista('funil')}><Columns3 size={18} aria-hidden="true" />Funil</button></div>
        </div>
        {vista === 'funil' && funil && <section className={styles.pipeline} aria-label="Filtrar por etapa do funil">
          <button className={styles.allStages} aria-pressed={!filtros.etapa} onClick={() => filtrar({ etapa: '' })}>Todas as etapas</button>
          <div className={styles.stageGrid}>{ETAPAS.map(e => <button key={e.valor} className={styles.stageTab} data-stage={e.valor} aria-pressed={filtros.etapa === e.valor} onClick={() => filtrar({ etapa: filtros.etapa === e.valor ? '' : e.valor })}><span>{e.label}</span><strong>{pagina ? pagina.etapas[e.valor] ?? 0 : '—'}</strong></button>)}</div>
          <p className={styles.hint}>Totais para os filtros ativos. Os cards mostram a página atual; selecione uma etapa para consultar seus leads.</p>
        </section>}

        <section className={styles.results} aria-label="Resultados da busca" aria-busy={carregando}>
          {carregando ? <Spinner /> : erroLista ? <Feedback mensagem={erroLista} onRetry={() => setVersao(v => v + 1)} /> : !pagina?.items.length ? <div className={styles.empty}><h3>Nenhum lead encontrado</h3><p>Revise os filtros ou cadastre um novo contato.</p></div> : <div className={vista === 'funil' && funil ? styles.cards : styles.list}>
            {pagina.items.map(lead => <LeadCard key={lead.id} lead={lead} agora={agora} onOpen={() => abrir(lead.id)} />)}
          </div>}
        </section>
        {pagina && <footer className={styles.pagination}>
          <p role="status">{pagina.total ? `${(pagina.page - 1) * pagina.pageSize + (pagina.items.length ? 1 : 0)}–${(pagina.page - 1) * pagina.pageSize + pagina.items.length} de ${pagina.total} leads` : '0 leads'} · Página {pagina.page} de {totalPaginas}</p>
          <div className={styles.actions}>
            <FormField id="crm-page-size" label="Por página"><select id="crm-page-size" value={filtros.pageSize} onChange={e => filtrar({ pageSize: Number(e.target.value) })}>{[10, 20, 50].map(n => <option value={n} key={n}>{n}</option>)}</select></FormField>
            <button className="ui-button" aria-label="Página anterior" disabled={pagina.page <= 1} onClick={() => setFiltros(f => ({ ...f, page: Math.max(1, pagina.page - 1) }))}><ChevronLeft size={18} aria-hidden="true" />Anterior</button>
            <button className="ui-button" aria-label="Próxima página" disabled={pagina.page >= totalPaginas} onClick={() => setFiltros(f => ({ ...f, page: pagina.page + 1 }))}>Próxima<ChevronRight size={18} aria-hidden="true" /></button>
          </div>
        </footer>}
        {leadId && <LeadDetail key={leadId} id={leadId} usuarios={usuarios} veiculos={veiculos} funil={funil} propostas={propostas} podeAtribuir={podeAtribuir} carregandoOpcoes={carregandoOpcoes} erroOpcoes={erroOpcoes} onRetryOpcoes={() => setOpcoesVersao(v => v + 1)} onClose={fechar} onChange={atualizar} />}
        {novo && <Modal titulo="Cadastrar novo lead" onClose={() => { if (!mutation.ocupado) setNovo(false) }}><div className={styles.detail}>{carregandoOpcoes && <p className={styles.hint} role="status">Carregando veículos…</p>}{erroOpcoes && <Feedback mensagem={erroOpcoes} onRetry={() => setOpcoesVersao(v => v + 1)} />}<LeadForm veiculos={erroOpcoes ? [] : veiculos} veiculosIndisponiveis={carregandoOpcoes || Boolean(erroOpcoes)} ocupado={mutation.ocupado} erro={mutation.erro} onCancel={() => setNovo(false)} onSubmit={dados => criar(dados as NovoLead)} /></div></Modal>}
      </>}
    </main>
  </div>
}

function LeadCard({ lead, agora, onOpen }: { lead: LeadCRM; agora: number; onOpen: () => void }) {
  const wa = whatsappUrl(lead.telefone)
  const atrasada = Boolean(lead.proximaAtividadeEm && new Date(lead.proximaAtividadeEm).getTime() < agora)
  return <article className={styles.leadCard}>
    <div className={styles.cardTop}><span className={styles.stage} data-stage={lead.etapa}>{ETAPAS.find(e => e.valor === lead.etapa)?.label ?? lead.etapa}</span><span className={styles.hint}>{ORIGENS.find(o => o.valor === lead.origem)?.label ?? lead.origem}</span></div>
    <h3><button className={styles.leadName} onClick={onOpen}>{lead.nome}</button></h3>
    <p className={styles.contact}>{lead.telefone}{lead.email ? ` · ${lead.email}` : ''}</p>
    <p className={styles.hint}>{TIPOS.find(t => t.valor === lead.tipo)?.label ?? lead.tipo}</p>
    <p className={styles.vehicle}>{nomeVeiculo(lead.veiculo)}</p>
    <dl className={styles.cardFacts}><div><dt>Responsável</dt><dd>{lead.responsavel?.nome ?? 'Não atribuído'}</dd></div><div><dt>Próxima atividade</dt><dd className={atrasada ? styles.overdue : ''}>{lead.proximaAtividadeEm ? `${dataHora(lead.proximaAtividadeEm)}${atrasada ? ' · Atrasada' : ''}` : 'Não agendada'}</dd></div></dl>
    <div className={styles.cardBottom}><button className="ui-button ui-button-primary" onClick={onOpen}>Abrir lead</button>{wa && <a className="ui-button" href={wa} target="_blank" rel="noreferrer" aria-label={`Abrir WhatsApp de ${lead.nome}`}><MessageCircle size={18} aria-hidden="true" />WhatsApp</a>}</div>
  </article>
}
