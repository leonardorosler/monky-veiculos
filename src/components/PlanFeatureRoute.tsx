import { Link, useLocation } from 'react-router-dom'
import type { ReactNode } from 'react'
import type { RecursoPlano } from '../types'
import { usePlano } from '../contexts/PlanoContext'
import { Spinner } from './Spinner/Spinner'
import { Feedback } from './Feedback'
import { AdminNavBar } from './AdminNavBar/AdminNavBar'
import { AdminPageHeader } from './AdminPageHeader'

export function PlanFeatureRoute({ children, recurso }: { children: ReactNode, recurso: RecursoPlano }) {
  const { carregando, possuiRecurso, erro, recarregar } = usePlano()
  const { pathname } = useLocation()

  if (pathname.startsWith('/admin') && (carregando || erro || !possuiRecurso(recurso))) {
    return <div className="admin-shell"><AdminNavBar /><main id="conteudo-admin" className="admin-content">
      <AdminPageHeader titulo={carregando ? 'Consultando seu plano' : erro ? 'Consulta do plano indisponível' : 'Recurso indisponível neste plano'} descricao={carregando ? 'Aguarde enquanto carregamos os recursos da sua revenda.' : erro ? 'Você pode tentar novamente ou continuar nas outras áreas do painel.' : 'Confira os recursos contratados para sua revenda.'} />
      {carregando ? <Spinner /> : erro ? <Feedback mensagem={erro} onRetry={recarregar} /> : <Link className="ui-button" to="/admin">Voltar à visão geral</Link>}
    </main></div>
  }
  if (carregando) return <Spinner />
  if (erro) return <main className="section-container" style={{ paddingBlock: '4rem' }}><Feedback mensagem={erro} onRetry={recarregar} /></main>
  if (!possuiRecurso(recurso)) return <main className="section-container" style={{ paddingBlock: '4rem' }}><h1>Recurso indisponível neste plano</h1><p>Consulte os recursos contratados para esta revenda.</p><Link className="ui-button" to="/">Voltar à vitrine</Link></main>

  return children
}
