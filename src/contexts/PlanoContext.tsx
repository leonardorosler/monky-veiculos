import { createContext, useContext, useEffect, useState } from 'react'
import type { ReactNode } from 'react'
import api from '../api/axios'
import type { PlanoPublico, RecursoPlano } from '../types'

/* eslint-disable react-refresh/only-export-components */

type PlanoContextData = {
  plano: PlanoPublico | null
  carregando: boolean
  erro: string
  recarregar: () => void
  possuiRecurso: (recurso: RecursoPlano) => boolean
}

const PlanoContext = createContext<PlanoContextData>({
  plano: null,
  carregando: true,
  erro: '',
  recarregar: () => {},
  possuiRecurso: () => false,
})

export function PlanoProvider({ children }: { children: ReactNode }) {
  const [plano, setPlano] = useState<PlanoPublico | null>(null)
  const [carregando, setCarregando] = useState(true)
  const [erro, setErro] = useState('')
  const [tentativa, setTentativa] = useState(0)

  useEffect(() => {
    const controller = new AbortController()
    api.get<PlanoPublico>('/plano', { signal: controller.signal })
      .then(response => { if (!controller.signal.aborted) { setPlano(response.data); setErro('') } })
      .catch(() => { if (!controller.signal.aborted) setErro('Não foi possível consultar os recursos do seu plano.') })
      .finally(() => { if (!controller.signal.aborted) setCarregando(false) })
    return () => controller.abort()
  }, [tentativa])

  function recarregar() { setCarregando(true); setErro(''); setTentativa(value => value + 1) }

  function possuiRecurso(recurso: RecursoPlano) {
    const status = plano?.recursos[recurso]
    return !erro && Boolean(status?.incluido && status.implementado)
  }

  return (
    <PlanoContext.Provider value={{ plano, carregando, erro, recarregar, possuiRecurso }}>
      {children}
    </PlanoContext.Provider>
  )
}

export const usePlano = () => useContext(PlanoContext)
