import { Navigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { Spinner } from './Spinner/Spinner'
import { Feedback } from './Feedback'

export function PrivateRoute({ children, adminOnly = false }: { children: React.ReactNode; adminOnly?: boolean }) {
  const { isAuthenticated, usuario, status, revalidar, logout } = useAuth()
  if (status === 'carregando') return <Spinner />
  if (status === 'erro') return <main className="section-container" style={{ paddingBlock: '4rem' }}><Feedback mensagem="Não foi possível verificar sua sessão. Seus dados de acesso foram preservados." onRetry={revalidar} /><button className="ui-button" onClick={logout}>Sair da conta</button></main>
  if (!isAuthenticated) return <Navigate to="/admin/login" replace />
  if (adminOnly && usuario?.role !== 'ADMIN') return <Navigate to="/admin" replace />
  return <>{children}</>
}
