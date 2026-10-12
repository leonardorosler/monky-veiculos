import { Link } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'

export function AdminVoltar({ to = '/admin', label = 'Visão geral' }: { to?: string; label?: string }) {
  return <Link to={to} className="ui-button"><ArrowLeft size={16} aria-hidden="true" />{label}</Link>
}
