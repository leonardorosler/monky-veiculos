import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../../../api/axios'
import { Spinner } from '../../../components/Spinner/Spinner'
// import { AdminNavBar } from '../../components/AdminNavBar/AdminNavBar'
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

export function Leads() {
  const [leads, setLeads] = useState<Lead[]>([])
  const [carregando, setCarregando] = useState(true)
  const [filtro, setFiltro] = useState<'TODOS' | 'VENDER_CARRO' | 'FINANCIAMENTO'>('TODOS')

  const navigate = useNavigate()

  useEffect(() => {
    carregarLeads()
  }, [])

  async function carregarLeads() {
    try {
      const params = filtro !== 'TODOS' ? { tipo: filtro } : {}

      const { data } = await api.get<Lead[]>('/leads', { params })

      setLeads(data)
    } finally {
      setCarregando(false)
    }
  }

  async function handleLido(id: string) {
    const { data } = await api.patch<Lead>(`/leads/${id}/lido`)

    setLeads((prev) => prev.map((l) => (l.id === id ? data : l)))
  }

  const leadsFiltrados = filtro === 'TODOS' ? leads : leads.filter((l) => l.tipo === filtro)

  if (carregando) return <Spinner />

  return (
    <div className={styles.container}>
      <AdminNavBar />

      <main className={styles.main}>
        <div className={styles.header}>
          <div className={styles.left}>
            <div>
              <h1 className={styles.titulo}>Leads</h1>

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

        <div className={styles.filtros}>
          {(['TODOS', 'VENDER_CARRO', 'FINANCIAMENTO'] as const).map((f) => (
            <button key={f} onClick={() => setFiltro(f)} className={`${styles.filtroBotao} ${filtro === f ? styles.filtroAtivo : ''}`}>
              {f === 'TODOS' ? 'Todos' : f === 'VENDER_CARRO' ? 'Vender carro' : 'Financiamento'}
            </button>
          ))}
        </div>

        <div className={styles.card}>
          {leadsFiltrados.length === 0 ? (
            <p className={styles.vazio}>Nenhum lead encontrado.</p>
          ) : (
            <div className={styles.lista}>
              {leadsFiltrados.map((lead) => (
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
                      <span className={styles.data}>{new Date(lead.criadoEm).toLocaleDateString('pt-BR')}</span>
                    </div>
                  </div>

                  <div className={styles.dados}>
                    {Object.entries(lead.dados).map(
                      ([k, v]) =>
                        v && (
                          <div key={k} className={styles.dado}>
                            <span className={styles.dadoLabel}>{k.replace(/([A-Z])/g, ' $1').toLowerCase()}</span>

                            <span className={styles.dadoValor}>{v}</span>
                          </div>
                        )
                    )}
                  </div>
                  <div className={styles.footer}>
                    <a href={`https://wa.me/55${lead.telefone.replace(/\D/g, '')}`} target="_blank" rel="noreferrer" className={styles.botaoWhatsapp}>
                      <MessageCircleCheck size={16} />
                      WhatsApp
                    </a>

                    <button onClick={() => handleLido(lead.id)} className={`${styles.botaoLido} ${lead.lido ? styles.botaoLidoAtivo : ''}`}>
                      {lead.lido ? (
                        <>
                          <CircleCheck size={16} />
                          Conlcuído
                        </>
                      ) : (
                        <>
                          <Circle size={16} />
                          Marcar lido
                        </>
                      )}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  )
}
