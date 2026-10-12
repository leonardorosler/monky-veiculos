import { createContext, useContext, useEffect, useRef, useState, type ReactNode } from 'react'
import api from '../api/axios'
import type { Veiculo } from '../types'
import { siteConfig } from '../config/site'

type FavoritosData = {
  veiculos: Veiculo[]
  carregando: boolean
  erro: string
  pendentes: string[]
  carregar: () => void
  alternar: (veiculo: Veiculo) => Promise<void>
}

const FavoritosContext = createContext<FavoritosData | null>(null)

function getSessionId() {
  const key = `catalogo_session_id:${siteConfig.tenant.id}`
  let id = localStorage.getItem(key)
  if (!id) {
    // Preserve existing favorites for this deployment on first upgrade.
    id = localStorage.getItem('catalogo_session_id') || crypto.randomUUID()
    localStorage.setItem(key, id)
  }
  return id
}

export function FavoritosProvider({ children }: { children: ReactNode }) {
  const [sessionId] = useState(getSessionId)
  const [veiculos, setVeiculos] = useState<Veiculo[]>([])
  const [carregando, setCarregando] = useState(true)
  const [erro, setErro] = useState('')
  const [pendentes, setPendentes] = useState<string[]>([])
  const [tentativa, setTentativa] = useState(0)
  const emAndamento = useRef(new Set<string>())

  useEffect(() => {
    const controller = new AbortController()
    api.get<Veiculo[]>('/favoritos', { params: { sessionId }, signal: controller.signal })
      .then(({ data }) => { setVeiculos(data); setErro('') })
      .catch(() => { if (!controller.signal.aborted) setErro('Não foi possível carregar seus favoritos.') })
      .finally(() => { if (!controller.signal.aborted) setCarregando(false) })
    return () => controller.abort()
  }, [sessionId, tentativa])

  async function alternar(veiculo: Veiculo) {
    if (carregando || emAndamento.current.has(veiculo.id)) return
    emAndamento.current.add(veiculo.id)
    setPendentes(current => [...current, veiculo.id])
    setErro('')
    try {
      if (veiculos.some(item => item.id === veiculo.id)) {
        await api.delete(`/favoritos/${veiculo.id}`, { data: { sessionId } })
        setVeiculos(current => current.filter(item => item.id !== veiculo.id))
      } else {
        await api.post('/favoritos', { sessionId, veiculoId: veiculo.id })
        setVeiculos(current => [...current, veiculo])
      }
    } catch {
      setErro('Não foi possível atualizar o favorito. Tente novamente.')
    } finally {
      emAndamento.current.delete(veiculo.id)
      setPendentes(current => current.filter(id => id !== veiculo.id))
    }
  }

  const recarregar = () => { setCarregando(true); setErro(''); setTentativa(value => value + 1) }
  return <FavoritosContext.Provider value={{ veiculos, carregando, erro, pendentes, carregar: recarregar, alternar }}>{children}</FavoritosContext.Provider>
}

// eslint-disable-next-line react-refresh/only-export-components
export function useFavoritos() {
  const context = useContext(FavoritosContext)
  if (!context) throw new Error('useFavoritos deve ser usado dentro de FavoritosProvider')
  return context
}
