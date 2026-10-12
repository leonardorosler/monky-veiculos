import type { ReactNode } from 'react'

export function AdminPageHeader({ titulo, descricao, contexto = 'Gestão da revenda', acoes }: {
  titulo: string
  descricao: string
  contexto?: string
  acoes?: ReactNode
}) {
  return <header className="admin-page-header">
    <div className="admin-page-heading">
      <p className="admin-eyebrow">{contexto}</p>
      <h1>{titulo}</h1>
      <p className="admin-page-description">{descricao}</p>
    </div>
    {acoes && <div className="admin-page-actions">{acoes}</div>}
  </header>
}
