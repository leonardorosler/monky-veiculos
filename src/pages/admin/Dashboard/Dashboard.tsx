import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../../../api/axios'
import { useAuth } from '../../../contexts/AuthContext'
import type { Dashboard as DashboardType } from '../../../types'
import { Spinner } from '../../../components/Spinner/Spinner'
import { NavBar } from '../../../components/NavBar/NavBar'
import styles from './Dashboard.module.css'
import { AdminNavBar } from '../../../components/AdminNavBar/AdminNavBar'

export function Dashboard() {
  const [dados, setDados] = useState<DashboardType | null>(null)
  const [carregando, setCarregando] = useState(true)
  const { usuario, logout } = useAuth()
  const navigate = useNavigate()

  useEffect(() => {
    api
      .get<DashboardType>('/admin/dashboard')
      .then((res) => setDados(res.data))
      .finally(() => setCarregando(false))
  }, [])

  function handleLogout() {
    logout()

    navigate('/admin/login')
  }

  if (carregando) {
    return <Spinner />
  }

  return (
    <div className={styles.container}>
      <AdminNavBar />

      <main className={styles.main}>
        <div className={styles.topo}>
          <div>
            <h1 className={styles.titulo}>Painel Admin</h1>

            <p className={styles.usuario}>Logado como {usuario?.nome}</p>
          </div>

          <button onClick={handleLogout} className={styles.botaoLogout}>
            Sair
          </button>
        </div>

        <div className={styles.acoes}>
          <button onClick={() => navigate('/admin/estoque')} className={styles.botao}>
            Ver Estoque
          </button>

          <button onClick={() => navigate('/admin/veiculos/novo')} className={styles.botaoPrimario}>
            + Cadastrar Veículo
          </button>

          <button onClick={() => navigate('/admin/leads')} className={styles.botao}>
            Ver Leads
          </button>
        </div>

        <div className={styles.cards}>
          <div className={styles.card}>
            <span className={styles.cardValor}>{dados?.total ?? '-'}</span>

            <span className={styles.cardLabel}>Total de Veículos</span>
          </div>

          <div className={styles.card}>
            <span className={styles.cardValor}>{dados?.ativos ?? '-'}</span>

            <span className={styles.cardLabel}>Disponíveis</span>
          </div>

          <div className={styles.card}>
            <span className={styles.cardValor}>{dados?.vendidos ?? '-'}</span>

            <span className={styles.cardLabel}>Vendidos</span>
          </div>

          <div className={styles.card}>
            <span className={styles.cardValor}>{dados?.destaques ?? '-'}</span>

            <span className={styles.cardLabel}>Destaques</span>
          </div>
        </div>
      </main>
    </div>
  )
}
