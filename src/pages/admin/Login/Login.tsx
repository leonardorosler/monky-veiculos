import { useState } from 'react'
import { Link, Navigate, useNavigate } from 'react-router-dom'
import { ArrowLeft, CarFront, Eye, EyeOff, Loader2, Users, Workflow } from 'lucide-react'
import { useAuth } from '../../../contexts/AuthContext'
import api from '../../../api/axios'
import type { AuthResponse } from '../../../types'
import styles from './Login.module.css'
import { Feedback } from '../../../components/Feedback'
import { siteConfig } from '../../../config/site'

export function Login() {
  const [email, setEmail] = useState('')
  const [senha, setSenha] = useState('')
  const [erro, setErro] = useState('')
  const [carregando, setCarregando] = useState(false)
  const [mostrarSenha, setMostrarSenha] = useState(false)

  const { login, isAuthenticated } = useAuth()
  const navigate = useNavigate()

  if (isAuthenticated) {
    return <Navigate to="/admin" replace />
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (carregando) return

    setErro('')
    setCarregando(true)

    try {
      const { data } = await api.post<AuthResponse>('/auth/login', {
        email: email.trim(),
        senha,
      })

      login(data.token, data.usuario)

      navigate('/admin')
    } catch (error: unknown) {
      const apiError = error as { response?: { status?: number } }
      setErro(apiError.response?.status === 401 ? 'Email ou senha inválidos.' : 'Não foi possível entrar. Verifique a conexão e tente novamente.')
    } finally {
      setCarregando(false)
    }
  }

  return (
    <main className={styles.container}>
      <div className={styles.layout}>
      <section className={styles.intro} aria-label="Monky Garage"><div className={styles.brand}><CarFront size={28} aria-hidden="true" /><strong>MONKY <span>GARAGE</span></strong></div><p className={styles.introTitle}>Sua revenda,<br />em boas mãos.</p><p className={styles.introDescription}>Um espaço para organizar o estoque, acompanhar oportunidades e cuidar de cada atendimento.</p><ul><li><CarFront size={19} aria-hidden="true" />Estoque sempre à mão</li><li><Users size={19} aria-hidden="true" />Equipe com acesso organizado</li><li><Workflow size={19} aria-hidden="true" />Atendimentos com histórico</li></ul><Link to="/" className={styles.back}><ArrowLeft size={16} aria-hidden="true" />Voltar à vitrine</Link></section>
      <div className={styles.card}>
        <p className={styles.eyebrow}>Bem-vindo de volta</p>
        <h1 className={styles.titulo}>Acesso à revenda</h1>

        <p className={styles.subtitulo}>{siteConfig.brand.fullName} — entre com suas credenciais.</p>

        {erro && <Feedback mensagem={erro} />}

        <form onSubmit={handleSubmit} className={styles.form} aria-busy={carregando}>
          <div className={styles.campo}>
            <label htmlFor="login-email" className={styles.label}>Email</label>

            <input
              type="email"
              id="login-email"
              autoComplete="username"
              disabled={carregando}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className={styles.input}
              placeholder="admin@email.com"
              required
            />
          </div>

          <div className={styles.campo}>
            <label htmlFor="login-senha" className={styles.label}>Senha</label>

              <div className={styles.password}><input id="login-senha" type={mostrarSenha ? 'text' : 'password'} autoComplete="current-password" disabled={carregando} value={senha} onChange={(e) => setSenha(e.target.value)} className={styles.input} required /><button type="button" disabled={carregando} aria-label={mostrarSenha ? 'Ocultar senha' : 'Mostrar senha'} aria-pressed={mostrarSenha} aria-controls="login-senha" onClick={() => setMostrarSenha(value => !value)}>{mostrarSenha ? <EyeOff size={19} aria-hidden="true" /> : <Eye size={19} aria-hidden="true" />}</button></div>
          </div>

          <button type="submit" className={styles.botao} disabled={carregando}>
              {carregando && <Loader2 size={18} className={styles.loader} aria-hidden="true" />}{carregando ? 'Entrando...' : 'Entrar'}
          </button>
        </form>
        <p className={styles.help}>Use o acesso fornecido pela sua revenda. Precisa de ajuda? Entre em contato com o administrador.</p>
      </div>
      </div>
    </main>
  )
}
