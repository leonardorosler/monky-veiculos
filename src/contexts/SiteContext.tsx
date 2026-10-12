import { createContext, useContext, type ReactNode } from 'react'
import { useApiResource } from '../hooks/useApiResource'
import type { Personalizacao } from '../types/comercial'
import { resolvePersonalizacao } from '../utils/personalizacao'

const SiteContext = createContext({ ...resolvePersonalizacao(), erro: '', recarregar: () => {} })
export function SiteProvider({ children }: { children: ReactNode }) {
  const query = useApiResource<{ personalizacao?: Personalizacao }>('/configuracao-publica')
  return <SiteContext.Provider value={{ ...resolvePersonalizacao(query.data?.personalizacao), erro: query.erro ?? '', recarregar: query.recarregar }}>{children}</SiteContext.Provider>
}
// eslint-disable-next-line react-refresh/only-export-components
export const useSite = () => useContext(SiteContext)
