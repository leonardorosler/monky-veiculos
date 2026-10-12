import { createContext, useContext, useEffect, useState, type ReactNode } from 'react'
import api from '../api/axios'
import type { Usuario } from '../types'

type Status = 'carregando' | 'autenticado' | 'anonimo' | 'erro'
type AuthState = { token: string | null; usuario: Usuario | null; status: Status }
interface AuthContextData extends AuthState {
  login: (token: string, usuario: Usuario) => void
  logout: () => void
  revalidar: () => void
  isAuthenticated: boolean
}
const AuthContext = createContext({} as AuthContextData)
const empty: AuthState = { token: null, usuario: null, status: 'anonimo' }

export function AuthProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AuthState>(() => {
    const token = localStorage.getItem('token')
    return token ? { token, usuario: null, status: 'carregando' } : empty
  })
  const [tentativa, setTentativa] = useState(0)

  useEffect(() => {
    const synchronize = () => {
      const token = localStorage.getItem('token')
      setState(token ? { token, usuario: null, status: 'carregando' } : empty)
      setTentativa(value => value + 1)
    }
    const storage = (event: StorageEvent) => {
      if (event.key === 'token' || event.key === 'usuario' || event.key === null) synchronize()
    }
    window.addEventListener('storage', storage)
    window.addEventListener('monky:auth-changed', synchronize)
    return () => {
      window.removeEventListener('storage', storage)
      window.removeEventListener('monky:auth-changed', synchronize)
    }
  }, [])

  useEffect(() => {
    if (!state.token) return
    const token = state.token
    const controller = new AbortController()
    api.get<{ usuario: Usuario }>('/auth/me', { signal: controller.signal })
      .then(({ data }) => {
        if (controller.signal.aborted || localStorage.getItem('token') !== token) return
        localStorage.setItem('usuario', JSON.stringify(data.usuario))
        setState({ token, usuario: data.usuario, status: 'autenticado' })
      })
      .catch(error => {
        if (controller.signal.aborted || localStorage.getItem('token') !== token) return
        if (error.response?.status === 401) setState(empty)
        else setState({ token, usuario: null, status: 'erro' })
      })
    return () => controller.abort()
  }, [state.token, tentativa])

  function login(token: string, usuario: Usuario) {
    localStorage.setItem('token', token)
    localStorage.setItem('usuario', JSON.stringify(usuario))
    setState({ token, usuario: null, status: 'carregando' })
    setTentativa(value => value + 1)
  }
  function logout() {
    localStorage.removeItem('token')
    localStorage.removeItem('usuario')
    setState(empty)
  }
  function revalidar() {
    setState(current => ({ ...current, status: 'carregando' }))
    setTentativa(value => value + 1)
  }
  return <AuthContext.Provider value={{ ...state, login, logout, revalidar, isAuthenticated: state.status === 'autenticado' }}>{children}</AuthContext.Provider>
}

// eslint-disable-next-line react-refresh/only-export-components
export const useAuth = () => useContext(AuthContext)
