import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { CarFront, CheckCircle2, CircleGauge, MessageSquareMore, Plus, Star, Users } from 'lucide-react'
import { useAuth } from '../../../contexts/AuthContext'
import api from '../../../api/axios'
import type { Dashboard as DashboardType, PlanoAdministrativo } from '../../../types'
import { Spinner } from '../../../components/Spinner/Spinner'
import { AdminNavBar } from '../../../components/AdminNavBar/AdminNavBar'
import { Feedback } from '../../../components/Feedback'
import { AdminPageHeader } from '../../../components/AdminPageHeader'
import styles from './Dashboard.module.css'
import type { PaginaLeads, LeadCRM } from '../../../types/crm'
import { ETAPAS, TIPOS } from '../../../utils/crm'

export function Dashboard() {
  const [dados, setDados] = useState<DashboardType | null>(null)
  const [plano, setPlano] = useState<PlanoAdministrativo | null>(null)
  const [leads, setLeads] = useState<LeadCRM[]>([])
  const [resumoLeads, setResumoLeads] = useState<PaginaLeads | null>(null)
  const [erroLeads, setErroLeads] = useState('')
  const [carregando, setCarregando] = useState(true)
  const [erro, setErro] = useState('')
  const [tentativa, setTentativa] = useState(0)
  const { usuario } = useAuth()
  const navigate = useNavigate()

  useEffect(() => {
    const controller = new AbortController()
    Promise.all([
      api.get<DashboardType>('/admin/dashboard', { signal: controller.signal }),
      api.get<PlanoAdministrativo>('/admin/plano', { signal: controller.signal }),
    ])
      .then(async ([dashboardResponse, planoResponse]) => {
        if (controller.signal.aborted) return
        setDados(dashboardResponse.data)
        setPlano(planoResponse.data)

        const leadsAtivos = planoResponse.data.recursos.LEADS
        if (leadsAtivos.incluido && leadsAtivos.implementado) {
          try {
            const leadsResponse = await api.get<PaginaLeads>('/crm/leads', { params: { page: 1, pageSize: 5 }, signal: controller.signal })
            if (!controller.signal.aborted) { setLeads(leadsResponse.data.items); setResumoLeads(leadsResponse.data); setErroLeads('') }
          } catch {
            if (!controller.signal.aborted) { setErroLeads('Não foi possível consultar o CRM.'); setResumoLeads(null) }
          }
        }
      })
      .catch(() => { if (!controller.signal.aborted) setErro('Não foi possível carregar todos os indicadores da loja.') })
      .finally(() => { if (!controller.signal.aborted) setCarregando(false) })
    return () => controller.abort()
  }, [tentativa])

  const tentarNovamente = () => { setErro(''); setCarregando(true); setTentativa(value => value + 1) }

  const limiteVeiculos = plano?.limites.veiculos ?? null
  const veiculosEmUso = plano?.uso.veiculos ?? 0
  const limiteAtingido = limiteVeiculos !== null && veiculosEmUso >= limiteVeiculos
  const percentualUso = limiteVeiculos ? Math.min((veiculosEmUso / limiteVeiculos) * 100, 100) : 0
  const total = dados?.total || 1

  const metricas = [
    { label: 'Veículos ativos', valor: dados?.ativos ?? 0, detalhe: `${dados?.total ?? 0} cadastrados`, icon: CarFront },
    { label: 'Novos leads', valor: resumoLeads?.etapas.NOVO ?? '—', detalhe: resumoLeads ? `${resumoLeads.total} oportunidades acessíveis` : erroLeads ? 'Consulta indisponível' : 'CRM não disponível', icon: Users },
    { label: 'Veículos vendidos', valor: dados?.vendidos ?? 0, detalhe: 'Marcados no estoque', icon: CheckCircle2 },
    { label: 'Em destaque', valor: dados?.destaques ?? 0, detalhe: 'Na vitrine principal', icon: Star },
  ]

  return (
    <div className={`${styles.container} admin-shell`}>
      <AdminNavBar />

      <main id="conteudo-admin" className={`${styles.main} admin-content`}>
        <AdminPageHeader contexto="Visão geral" titulo={`Olá, ${usuario?.nome?.split(' ')[0] ?? ''}`} descricao="Seu estoque e seus atendimentos, em uma visão clara da operação." acoes={usuario?.role === 'ADMIN' && <button className="ui-button ui-button-primary" onClick={() => navigate('/admin/veiculos/novo')} disabled={carregando || !plano || limiteAtingido}><Plus size={17} aria-hidden="true" />Cadastrar veículo</button>} />

        {erro && <Feedback mensagem={erro} onRetry={tentarNovamente} />}
        {carregando ? <Spinner /> : dados && <>
        <section className={styles.metricas} aria-label="Indicadores principais">
          {metricas.map(metrica => {
            const Icon = metrica.icon
            return (
              <article className={styles.metrica} key={metrica.label}>
                <span className={styles.metricaIcone}><Icon size={22} aria-hidden="true" /></span>
                <div>
                  <span>{metrica.label}</span>
                  <strong>{metrica.valor}</strong>
                  <small>{metrica.detalhe}</small>
                </div>
              </article>
            )
          })}
        </section>

        <div className={styles.gradePrincipal}>
          <section className={styles.painel}>
            <div className={styles.painelTitulo}>
              <div>
                <h2>Visão do estoque</h2>
                <p>Distribuição atual dos veículos cadastrados</p>
              </div>
               <Link className="ui-button" to="/admin/estoque">Ver estoque</Link>
            </div>

            <div className={styles.barras}>
              <div>
                <span><b>Disponíveis</b><strong>{dados?.ativos ?? 0}</strong></span>
                <meter aria-label="Proporção de veículos disponíveis" min={0} max={total} value={dados?.ativos ?? 0} />
              </div>
              <div>
                <span><b>Vendidos</b><strong>{dados?.vendidos ?? 0}</strong></span>
                <meter aria-label="Proporção de veículos vendidos" min={0} max={total} value={dados?.vendidos ?? 0} />
              </div>
              <div>
                <span><b>Destaques ativos</b><strong>{dados?.destaques ?? 0}</strong></span>
                <meter aria-label="Proporção de veículos em destaque" min={0} max={total} value={dados?.destaques ?? 0} />
              </div>
            </div>
          </section>

          <section className={styles.painel}>
            <div className={styles.painelTitulo}>
              <div>
                <h2>Plano {plano?.nome}</h2>
                <p>Uso dos limites contratados</p>
              </div>
              <CircleGauge size={22} aria-hidden="true" />
            </div>

            <div className={styles.limiteBloco}>
              <span><b>Veículos disponíveis</b><strong>{veiculosEmUso} / {limiteVeiculos ?? 'Ilimitado'}</strong></span>
              {limiteVeiculos && <i><em style={{ width: `${percentualUso}%` }} /></i>}
            </div>
            <div className={styles.limiteBloco}>
              <span><b>Usuários</b><strong>{plano?.uso.usuarios ?? 0} / {plano?.limites.usuarios ?? 'Ilimitado'}</strong></span>
            </div>
            {limiteAtingido && <p className={styles.aviso}>Limite atingido. Altere o plano para adicionar veículos.</p>}
          </section>
        </div>

        {plano?.recursos.LEADS.incluido && plano.recursos.LEADS.implementado ? (
          <section className={styles.painel}>
            <div className={styles.painelTitulo}>
              <div>
                <h2>Leads recentes</h2>
                <p>Últimos contatos recebidos pela loja</p>
              </div>
               <Link className="ui-button" to="/admin/leads">Ver todos</Link>
            </div>

            <div className={styles.tabelaLeads}>
              {erroLeads && <Feedback mensagem={erroLeads} onRetry={tentarNovamente} />}
              {leads.slice(0, 5).map(lead => (
                <Link className={styles.lead} key={lead.id} to={`/admin/leads?lead=${encodeURIComponent(lead.id)}`}>
                  <span className={styles.leadIcone}><MessageSquareMore size={18} aria-hidden="true" /></span>
                  <div className={styles.leadIdentidade}><strong>{lead.nome}</strong><span>{TIPOS.find(item => item.valor === lead.tipo)?.label}</span></div>
                  <span className={styles.leadContato}>{lead.telefone}</span>
                  <span className={styles.leadData}>{new Date(lead.criadoEm).toLocaleDateString('pt-BR')}</span>
                  <b className={lead.etapa === 'NOVO' ? styles.novoLead : styles.lido}>{ETAPAS.find(item => item.valor === lead.etapa)?.label}</b>
                </Link>
              ))}
              {!erroLeads && leads.length === 0 && <p className={styles.vazio}>Nenhum lead recebido ainda.</p>}
            </div>
          </section>
        ) : (
          <section className={styles.painelVazio}>
            <MessageSquareMore size={24} aria-hidden="true" />
            <div><h2>Gestão de leads</h2><p>Disponível a partir do plano Profissional.</p></div>
          </section>
        )}
        </>}
      </main>
    </div>
  )
}
