import { useNavigate } from "react-router-dom"
import styles from './AdminVoltar.module.css'

export function AdminVoltar(){

    const navigate = useNavigate()

    return(
        <button onClick={() => navigate('/admin')} className={styles.botaoVoltar}>
            ← Voltar
          </button>

    )
}