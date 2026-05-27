import { LayoutDashboard, CarFront, Users, Plus, LogOut, Menu, X } from 'lucide-react'
import { useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'
import { useState } from 'react'
import styles from './AdminNavBar.module.css'

const links = [
  { label: 'Dashboard', path: '/admin', icon: LayoutDashboard },
  { label: 'Estoque', path: '/admin/estoque', icon: CarFront },
  { label: 'Leads', path: '/admin/leads', icon: Users },
]

export function AdminNavBar() {
  const { usuario, logout } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [menuAberto, setMenuAberto] = useState(false)

  function handleNavigate(path: string) {
    navigate(path)
    setMenuAberto(false)
  }

  function isActive(path: string) {
    return location.pathname.startsWith(path)
  }

  return (
    <header className={styles.header}>
      <div className={styles.container}>
        <div className={styles.esquerda}>
          <button onClick={() => navigate('/admin')} className={styles.logo}>
            <img className={styles.icone} src="/admin.svg"/>
            <div className={styles.logoTextos}>
              <strong>Painel</strong>
              <span>Admin</span>
            </div>
          </button>

          <nav className={styles.nav}>
            {links.map((link) => {
              const Icon = link.icon
              const ativo = isActive(link.path)

              return (
                <button
                  key={link.path}
                  onClick={() => handleNavigate(link.path)}
                  className={`${styles.navLink} ${ativo ? styles.ativo : ''}`}
                >
                  <Icon size={16} />
                  {link.label}
                </button>
              )
            })}
          </nav>
        </div>

        <div className={styles.direita}>
          <button
            onClick={() => navigate('/admin/veiculos/novo')}
            className={styles.botaoNovo}
          >
            <Plus size={16} />
            Novo
          </button>

          <div className={styles.usuarioBox}>
            <span className={styles.usuario}>{usuario?.nome}</span>
            <span className={styles.role}>{usuario?.role}</span>
          </div>

          <button onClick={logout} className={styles.botaoSair}>
            <LogOut size={17} />
          </button>

          <button
            className={styles.botaoMenu}
            onClick={() => setMenuAberto(!menuAberto)}
          >
            {menuAberto ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </div>

      {/* MOBILE */}
      <div className={`${styles.mobileMenu} ${menuAberto ? styles.mobileAtivo : ''}`}>
        <nav className={styles.mobileNav}>
          {links.map((link) => {
            const Icon = link.icon
            const ativo = isActive(link.path)

            return (
              <button
                key={link.path}
                onClick={() => handleNavigate(link.path)}
                className={`${styles.mobileLink} ${ativo ? styles.ativo : ''}`}
              >
                <Icon size={16} />
                {link.label}
              </button>
            )
          })}

          <button
            onClick={() => navigate('/admin/veiculos/novo')}
            className={styles.mobileNovo}
          >
            <Plus size={16} />
            Novo veículo
          </button>

          <button onClick={logout} className={styles.mobileSair}>
            <LogOut size={16} />
            Sair
          </button>
        </nav>
      </div>
    </header>
  )
}