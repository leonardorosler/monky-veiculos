import { createContext, useContext, useState } from 'react'
import type { ReactNode } from 'react'
import type { Usuario } from '../types'

interface AuthContextData {
  usuario: Usuario | null
  token: string | null
  login: (token: string, usuario: Usuario) => void
  logout: () => void
  isAuthenticated: boolean
}

const AuthContext = createContext({} as AuthContextData)

function getStoredAuth() {
  const token = localStorage.getItem('token')
  const usuario = localStorage.getItem('usuario')

  if (!token || !usuario) {
    return { token: null, usuario: null }
  }

  try {
    return { token, usuario: JSON.parse(usuario) as Usuario }
  } catch {
    localStorage.removeItem('token')
    localStorage.removeItem('usuario')
    return { token: null, usuario: null }
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [authState, setAuthState] = useState(getStoredAuth)

  function login(token: string, usuario: Usuario) {
    localStorage.setItem('token', token)
    localStorage.setItem('usuario', JSON.stringify(usuario))
    setAuthState({ token, usuario })
  }

  function logout() {
    localStorage.removeItem('token')
    localStorage.removeItem('usuario')
    setAuthState({ token: null, usuario: null })
  }

  return (
    <AuthContext.Provider
      value={{
        usuario: authState.usuario,
        token: authState.token,
        login,
        logout,
        isAuthenticated: !!authState.token,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)
