import type { ReactNode } from 'react'
import { AdminNavBar } from '../../../components/AdminNavBar/AdminNavBar'
import { AdminVoltar } from '../../../components/AdminVoltar/AdminVoltar'
import { AdminPageHeader } from '../../../components/AdminPageHeader'
import styles from './Comercial.module.css'

export function ComercialLayout({ titulo, descricao, children, acao }: { titulo: string; descricao: string; children: ReactNode; acao?: ReactNode }) {
  return <div className={`${styles.page} admin-shell`}><AdminNavBar /><main id="conteudo-admin" className={`${styles.main} admin-content`}><AdminPageHeader contexto="Inteligência comercial" titulo={titulo} descricao={descricao} acoes={<><AdminVoltar />{acao}</>} />{children}</main></div>
}
