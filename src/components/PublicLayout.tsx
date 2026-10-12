import { Outlet, useLocation } from 'react-router-dom'
import { useEffect } from 'react'
import { NavBar } from './NavBar/NavBar'
import { Footer } from './Footer/Footer'
import { FavoritosProvider, useFavoritos } from '../contexts/FavoritosContext'
import { Feedback } from './Feedback'
import { useSite } from '../contexts/SiteContext'

export function PublicLayout() {
  const { pathname, hash } = useLocation()
  const site = useSite()
  useEffect(() => {
    const frame = requestAnimationFrame(() => {
      const target = hash ? document.getElementById(hash.slice(1)) : null
      if (target) target.scrollIntoView()
      else window.scrollTo({ top: 0, behavior: 'instant' })
    })
    return () => cancelAnimationFrame(frame)
  }, [pathname, hash])

  useEffect(() => { document.title = site.nomeCompleto }, [site.nomeCompleto])

  return (
    <FavoritosProvider>
      <div className="public-layout" style={site.tema}>
        <a className="skip-link" href="#conteudo-principal">Pular para o conteúdo</a>
        <NavBar />
        <div className="public-content" id="conteudo-principal" tabIndex={-1}>
          <FavoritosFeedback />
          {site.erro && <div style={{ maxWidth: 1280, margin: '110px auto 0', paddingInline: '1rem' }}><Feedback mensagem="Não foi possível carregar a identidade personalizada. Exibindo a identidade base." onRetry={site.recarregar} /></div>}
          <Outlet />
        </div>
        <Footer />
      </div>
    </FavoritosProvider>
  )
}

function FavoritosFeedback() {
  const { erro, carregar } = useFavoritos()
  const { pathname } = useLocation()
  if (!erro || pathname === '/favoritos') return null
  return <div style={{ maxWidth: 1280, margin: pathname === '/' ? '110px auto 0' : '1rem auto', paddingInline: '1rem' }}><Feedback mensagem={erro} onRetry={() => void carregar()} /></div>
}
