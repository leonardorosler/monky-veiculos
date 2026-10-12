import { useEffect, useRef, useState, type FormEvent } from 'react'
import { Link, NavLink, useLocation, useNavigate } from 'react-router-dom'
import { Bell, ChartNoAxesCombined, Settings, CarFront, ExternalLink, LayoutDashboard, LogOut, Menu, Search, UserCog, Users, X } from 'lucide-react'
import { useAuth } from '../../contexts/AuthContext'
import { usePlano } from '../../contexts/PlanoContext'
import styles from './AdminNavBar.module.css'

const links = [
  { label: 'Visão geral', path: '/admin', icon: LayoutDashboard, grupo: 'Operação' },
  { label: 'Veículos', path: '/admin/estoque', icon: CarFront, grupo: 'Operação' },
  { label: 'Leads', path: '/admin/leads', icon: Users, grupo: 'Operação', recurso: 'LEADS' as const },
  { label: 'Relatórios', path: '/admin/relatorios', icon: ChartNoAxesCombined, grupo: 'Resultados', recurso: 'RELATORIOS_CONVERSAO' as const },
  { label: 'Alertas', path: '/admin/alertas', icon: Bell, grupo: 'Resultados', recurso: 'AUTOMACOES_COMERCIAIS' as const },
  { label: 'Equipe', path: '/admin/usuarios', icon: UserCog, grupo: 'Administração', adminOnly: true },
  { label: 'Configuração', path: '/admin/configuracao', icon: Settings, grupo: 'Administração', recurso: 'PERSONALIZACAO_AVANCADA' as const, adminOnly: true },
]

export function AdminNavBar() {
  const { usuario, logout } = useAuth()
  const { plano, possuiRecurso, erro, recarregar } = usePlano()
  const navigate = useNavigate()
  const location = useLocation()
  const [menuAberto, setMenuAberto] = useState(false)
  const [busca, setBusca] = useState('')
  const sidebarRef = useRef<HTMLDivElement>(null)
  const topbarRef = useRef<HTMLElement>(null)
  const menuRef = useRef<HTMLButtonElement>(null)
  useEffect(() => {
    if (!menuAberto) return
    const previousOverflow = document.body.style.overflow
    const menuButton = menuRef.current
    const main = document.getElementById('conteudo-admin')
    const header = topbarRef.current
    const mainInert = main?.inert ?? false
    const headerInert = header?.inert ?? false
    if (main) main.inert = true
    if (header) header.inert = true
    document.body.style.overflow = 'hidden'
    const focusFrame = requestAnimationFrame(() => sidebarRef.current?.querySelector<HTMLButtonElement>('button')?.focus())
    function onKey(event: KeyboardEvent) {
      if (event.key === 'Escape') { event.preventDefault(); setMenuAberto(false) }
      if (event.key !== 'Tab') return
      const controls = sidebarRef.current?.querySelectorAll<HTMLElement>('a[href], button:not(:disabled)')
      if (!controls?.length) return
      const first = controls[0]
      const last = controls[controls.length - 1]
      if (!sidebarRef.current?.contains(document.activeElement)) {
        event.preventDefault()
        const target = event.shiftKey ? last : first
        target.focus()
        return
      }
      if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus() }
      if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus() }
    }
    const media = window.matchMedia('(min-width: 981px)')
    const onResize = () => { if (media.matches) setMenuAberto(false) }
    document.addEventListener('keydown', onKey)
    media.addEventListener('change', onResize)
    return () => {
      document.body.style.overflow = previousOverflow
      cancelAnimationFrame(focusFrame)
      if (main) main.inert = mainInert
      if (header) header.inert = headerInert
      document.removeEventListener('keydown', onKey)
      media.removeEventListener('change', onResize)
      menuButton?.focus()
    }
  }, [menuAberto])
  useEffect(() => {
    const frame = requestAnimationFrame(() => {
      const main = document.getElementById('conteudo-admin')
      if (main && !main.inert) { main.tabIndex = -1; main.focus({ preventScroll: true }) }
      window.scrollTo({ top: 0, behavior: 'instant' })
    })
    return () => cancelAnimationFrame(frame)
  }, [location.pathname])
  const linksDisponiveis = links.filter(link =>
    (!link.recurso || possuiRecurso(link.recurso)) && (!link.adminOnly || usuario?.role === 'ADMIN')
  )

  const iniciais = usuario?.nome.trim().split(/\s+/).slice(0, 2).map(part => part[0]).join('').toUpperCase()
  const paginaAtual = location.pathname.startsWith('/admin/veiculos') ? 'Veículos' : links.find(link => link.path !== '/admin' && location.pathname.startsWith(link.path))?.label ?? 'Visão geral'

  function buscarVeiculo(event: FormEvent) {
    event.preventDefault()
    const query = busca.trim()
    navigate(query ? `/admin/estoque?busca=${encodeURIComponent(query)}` : '/admin/estoque')
  }

  return (
    <>
      <a className="skip-link" href="#conteudo-admin">Pular para o conteúdo</a>
      <div ref={sidebarRef} id="menu-admin" role={menuAberto ? 'dialog' : 'complementary'} aria-modal={menuAberto || undefined} aria-label="Menu da revenda" className={`${styles.sidebar} ${menuAberto ? styles.sidebarAberta : ''}`}>
        <button className={styles.fecharMobile} type="button" onClick={() => setMenuAberto(false)} aria-label="Fechar menu"><X size={22} aria-hidden="true" /></button>
        <div className={styles.marca}>
          <span className={styles.marcaIcone}><CarFront size={23} aria-hidden="true" /></span>
          <div><strong>MONKY <span>GARAGE</span></strong><small>Painel da revenda</small></div>
        </div>

        <div className={styles.planoBadge}><span aria-hidden="true" />{plano?.nome ? `Plano ${plano.nome}` : erro ? 'Plano indisponível' : 'Consultando plano…'}</div>
        {erro && <button className="ui-button" onClick={recarregar}>Tentar consultar plano</button>}

        <nav className={styles.nav} aria-label="Navegação administrativa">
          {['Operação', 'Resultados', 'Administração'].map(grupo => {
            const itens = linksDisponiveis.filter(link => link.grupo === grupo)
            return itens.length > 0 && <div className={styles.navGrupo} key={grupo}>
              <p className={styles.navTitulo}>{grupo}</p>
              {itens.map(link => {
                const Icon = link.icon
                return <NavLink key={link.path} to={link.path} end={link.path === '/admin'} onClick={() => setMenuAberto(false)} className={({ isActive }) => `${styles.navLink} ${isActive || (link.path === '/admin/estoque' && location.pathname.startsWith('/admin/veiculos')) ? styles.ativo : ''}`}>
                  <Icon size={19} aria-hidden="true" /><span>{link.label}</span>
                </NavLink>
              })}
            </div>
          })}
        </nav>

        <div className={styles.sidebarRodape}>
          <div className={styles.perfil}>
            <span className={styles.avatar} aria-hidden="true">{iniciais}</span>
            <div>
              <strong title={usuario?.nome}>{usuario?.nome}</strong>
              <small>{usuario?.role === 'ADMIN' ? 'Administrador' : 'Vendedor'}</small>
            </div>
          </div>
          <button onClick={logout} className={styles.sair}>
            <LogOut size={18} aria-hidden="true" /> Sair da conta
          </button>
        </div>
      </div>

      {menuAberto && <button className={styles.overlay} tabIndex={-1} aria-hidden="true" onClick={() => setMenuAberto(false)} />}

      <header ref={topbarRef} className={styles.topbar}>
        <button ref={menuRef} className={styles.menuButton} onClick={() => setMenuAberto(true)} aria-label="Abrir menu" aria-expanded={menuAberto} aria-controls="menu-admin">
          <Menu size={21} aria-hidden="true" />
        </button>
        <div className={styles.localizacao}><span>Sua revenda</span><strong>{paginaAtual}</strong></div>

        <form className={styles.busca} onSubmit={buscarVeiculo}>
          <label className="sr-only" htmlFor="busca-admin">Buscar veículo no estoque</label>
          <input id="busca-admin" type="search" value={busca} onChange={event => setBusca(event.target.value)} placeholder="Buscar no estoque…" />
          <button type="submit" aria-label="Buscar no estoque"><Search size={18} aria-hidden="true" /></button>
        </form>

        <div className={styles.topbarAcoes}>
          <Link className={styles.vitrine} to="/" target="_blank" rel="noreferrer" aria-label="Ver vitrine (nova aba)"><ExternalLink size={17} aria-hidden="true" /><span>Ver vitrine</span><span className="sr-only"> (nova aba)</span></Link>
          <div className={styles.topbarPerfil}>
            <span className={styles.avatar} aria-hidden="true">{iniciais}</span>
          </div>
        </div>
      </header>
    </>
  )
}
