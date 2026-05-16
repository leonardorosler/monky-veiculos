import { useEffect, useState, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../../../api/axios'
import { Spinner } from '../../../components/Spinner/Spinner'
import styles from './Leads.module.css'
import { AdminNavBar } from '../../../components/AdminNavBar/AdminNavBar'
import { AdminVoltar } from '../../../components/AdminVoltar/AdminVoltar'
import { MessageCircleCheck, Circle, CircleCheck } from 'lucide-react'

interface Lead {
  id: string
  tipo: 'VENDER_CARRO' | 'FINANCIAMENTO'
  nome: string
  telefone: string
  email?: string
  dados: Record<string, string>
  lido: boolean
  criadoEm: string
}

type Filtro = 'TODOS' | 'VENDER_CARRO' | 'FINANCIAMENTO'

export function Leads() {
  const [leads, setLeads] = useState<Lead[]>([])
  const [carregando, setCarregando] = useState(true)
  const [filtro, setFiltro] = useState<Filtro>('TODOS')
  const [busca, setBusca] = useState('')

  const navigate = useNavigate()

  useEffect(() => {
    carregarLeads()
  }, [])

  async function carregarLeads() {
    try {
      const { data } = await api.get<Lead[]>('/leads')
      setLeads(data)
    } finally {
      setCarregando(false)
    }
  }

  async function handleLido(id: string) {
    const { data } = await api.patch<Lead>(`/leads/${id}/lido`)
    setLeads(prev => prev.map(l => l.id === id ? data : l))
  }

  const naoLidos = useMemo(() => leads.filter(l => !l.lido).length, [leads])

  const leadsFiltrados = useMemo(() => {
    return leads
      .filter(l => filtro === 'TODOS' || l.tipo === filtro)
      .filter(l => {
        const termo = busca.toLowerCase()
        return (
          l.nome.toLowerCase().includes(termo) ||
          l.telefone.includes(termo) ||
          (l.email?.toLowerCase().includes(termo) ?? false)
        )
      })
  }, [leads, filtro, busca])

  const contadores = {
    TODOS: leads.length,
    VENDER_CARRO: leads.filter(l => l.tipo === 'VENDER_CARRO').length,
    FINANCIAMENTO: leads.filter(l => l.tipo === 'FINANCIAMENTO').length,
  }

  const filtros: { label: string; valor: Filtro }[] = [
    { label: `Todos (${contadores.TODOS})`, valor: 'TODOS' },
    { label: `Vender carro (${contadores.VENDER_CARRO})`, valor: 'VENDER_CARRO' },
    { label: `Financiamento (${contadores.FINANCIAMENTO})`, valor: 'FINANCIAMENTO' },
  ]

  if (carregando) return <Spinner />

  return (
    <div className={styles.container}>
      <AdminNavBar />

      <main className={styles.main}>
        <div className={styles.header}>
          <div className={styles.left}>
            <div>
              <div className={styles.tituloRow}>
                <h1 className={styles.titulo}>Leads</h1>
                {naoLidos > 0 && (
                  <span className={styles.badgeNaoLidos}>{naoLidos} novo{naoLidos > 1 ? 's' : ''}</span>
                )}
              </div>
              <p className={styles.subtitulo}>Gerencie os contatos recebidos</p>
            </div>
          </div>

          <div className={styles.right}>
            <AdminVoltar />
            <div className={styles.dropdown}>
              <button className={styles.botaoPrimario}>+ Novo lead</button>
              <div className={styles.dropdownMenu}>
                <button onClick={() => navigate('/vender-meu-carro')}>Vender carro</button>
                <button onClick={() => navigate('/financiamento')}>Financiamento</button>
              </div>
            </div>
          </div>
        </div>

        {/* Busca e filtros */}
        <div className={styles.controles}>
          <input
            type="text"
            placeholder="Buscar por nome, telefone ou email..."
            value={busca}
            onChange={e => setBusca(e.target.value)}
            className={styles.inputBusca}
          />
          <div className={styles.filtros}>
            {filtros.map(f => (
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
          {leadsFiltrados.length === 0 ? (
            <p className={styles.vazio}>
              {busca || filtro !== 'TODOS' ? 'Nenhum lead encontrado.' : 'Nenhum lead recebido ainda.'}
            </p>
          ) : (
            <div className={styles.lista}>
              {leadsFiltrados.map(lead => (
                <div key={lead.id} className={`${styles.leadCard} ${lead.lido ? styles.cardLido : ''}`}>
                  <div className={styles.cardHeader}>
                    <div>
                      <span className={lead.tipo === 'VENDER_CARRO' ? styles.tagVender : styles.tagFinanciamento}>
                        {lead.tipo === 'VENDER_CARRO' ? 'Vender Carro' : 'Financiamento'}
                      </span>
                      <h3 className={styles.nome}>{lead.nome}</h3>
                      <p className={styles.contato}>
                        📞 {lead.telefone}
                        {lead.email && ` · ✉️ ${lead.email}`}
                      </p>
                    </div>
                    <div className={styles.cardAcoes}>
                      <span className={styles.data}>
                        {new Date(lead.criadoEm).toLocaleDateString('pt-BR')}
                      </span>
                      {!lead.lido && <span className={styles.pontinho} />}
                    </div>
                  </div>

                  <div className={styles.dados}>
                    {Object.entries(lead.dados).map(([k, v]) =>
                      v && (
                        <div key={k} className={styles.dado}>
                          <span className={styles.dadoLabel}>{k.replace(/([A-Z])/g, ' $1').toLowerCase()}</span>
                          <span className={styles.dadoValor}>{v}</span>
                        </div>
                      )
                    )}
                  </div>

                  <div className={styles.footer}>
                    <a
                      href={`https://wa.me/55${lead.telefone.replace(/\D/g, '')}`}
                      target="_blank"
                      rel="noreferrer"
                      className={styles.botaoWhatsapp}
                    >
                      <MessageCircleCheck size={16} />
                      WhatsApp
                    </a>
                    <button
                      onClick={() => handleLido(lead.id)}
                      className={`${styles.botaoLido} ${lead.lido ? styles.botaoLidoAtivo : ''}`}
                    >
                      {lead.lido ? (
                        <><CircleCheck size={16} />Concluído</>
                      ) : (
                        <><Circle size={16} />Marcar lido</>
                      )}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {leadsFiltrados.length > 0 && (
          <p className={styles.contagem}>
            Exibindo {leadsFiltrados.length} de {leads.length} lead(s)
          </p>
        )}
      </main>
    </div>
  )
}