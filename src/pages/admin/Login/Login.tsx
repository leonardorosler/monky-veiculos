import { useState } from 'react'
import { Navigate, useNavigate } from 'react-router-dom'
import { useAuth } from '../../../contexts/AuthContext'
import api from '../../../api/axios'
import type { AuthResponse } from '../../../types'
import styles from './Login.module.css'

export function Login() {
  const [email, setEmail] = useState('')
  const [senha, setSenha] = useState('')
  const [erro, setErro] = useState('')
  const [carregando, setCarregando] = useState(false)

  const { login, isAuthenticated } = useAuth()
  const navigate = useNavigate()

  if (isAuthenticated) {
    return <Navigate to="/admin" replace />
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()

    setErro('')
    setCarregando(true)

    try {
      const { data } = await api.post<AuthResponse>('/auth/login', {
        email,
        senha,
      })

      login(data.token, data.usuario)

      navigate('/admin')
    } catch {
      setErro('Email ou senha inválidos')
    } finally {
      setCarregando(false)
    }
  }

  return (
    <div className={styles.container}>
      <div className={styles.card}>
        <h1 className={styles.titulo}>Painel Admin</h1>

        <p className={styles.subtitulo}>Entre com suas credenciais</p>

        {erro && <p className={styles.erro}>{erro}</p>}

        <form onSubmit={handleSubmit} className={styles.form}>
          <div className={styles.campo}>
            <label className={styles.label}>Email</label>

            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className={styles.input}
              placeholder="admin@email.com"
              required
            />
          </div>

          <div className={styles.campo}>
            <label className={styles.label}>Senha</label>

            <input type="password" value={senha} onChange={(e) => setSenha(e.target.value)} className={styles.input} placeholder="••••••" required />
          </div>

          <button type="submit" className={styles.botao} disabled={carregando}>
            {carregando ? 'Entrando...' : 'Entrar'}
          </button>
        </form>
      </div>
    </div>
  )
}
