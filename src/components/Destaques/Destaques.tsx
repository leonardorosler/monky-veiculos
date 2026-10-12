import styles from './Destaques.module.css'
import type { Veiculo } from '../../types'
import api from '../../api/axios'
import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { CardVeiculo } from '../CardVeiculo/CardVeiculo'
import { ArrowRight, BadgeDollarSign, KeyRound, Repeat } from 'lucide-react'
import { siteConfig } from '../../config/site'
import type { CSSProperties } from 'react'
import { usePlano } from '../../contexts/PlanoContext'
import { Feedback } from '../Feedback'
import { Spinner } from '../Spinner/Spinner'

const callIcons = [BadgeDollarSign, KeyRound, Repeat]

export function Destaques() {
  const [destaques, setDestaques] = useState<Veiculo[]>([])
  const [carregando, setCarregando] = useState(true)
  const [erro, setErro] = useState('')
  const [tentativa, setTentativa] = useState(0)
  const { possuiRecurso } = usePlano()

  const navigate = useNavigate()

  useEffect(() => {
    const controller = new AbortController()
    api.get<Veiculo[]>('/veiculos/destaques', { signal: controller.signal })
      .then(({ data }) => setDestaques(data))
      .catch(() => { if (!controller.signal.aborted) setErro('Não foi possível carregar os destaques.') })
      .finally(() => { if (!controller.signal.aborted) setCarregando(false) })
    return () => controller.abort()
  }, [tentativa])

  return (
    <section className={styles.secao} style={{ '--dealership-image': `url("${siteConfig.assets.dealership}")` } as CSSProperties}>
      <div className={styles.secaoInner}>
        <div className={styles.topo}>
          <h2 className={styles.secaoTitulo}>
            {siteConfig.home.highlights.title} <span>{siteConfig.home.highlights.titleHighlight}</span>
          </h2>

          <button onClick={() => navigate('/catalogo')} className={styles.linkTopo}>
            {siteConfig.home.highlights.viewAll}
            <ArrowRight size={16} />
          </button>
        </div>

        {carregando ? <Spinner /> : erro ? <Feedback mensagem={erro} onRetry={() => { setErro(''); setCarregando(true); setTentativa(value => value + 1) }} /> : destaques.length === 0 ? <p>Confira todas as opções disponíveis em nosso catálogo.</p> : <div className={styles.grid}>
          {destaques.map((veiculo) => (
            <CardVeiculo key={veiculo.id} veiculo={veiculo} />
          ))}
        </div>}

        <div className={styles.chamadas}>
          {siteConfig.home.highlights.calls.map((call, index) => {
            if (index < 2 && !possuiRecurso('LEADS')) return null
            const Icon = callIcons[index]
            return (
              <button
                key={call.title}
                className={index === 1 ? styles.chamadaClara : styles.chamadaEscura}
                onClick={() => navigate(call.route)}
              >
                <Icon size={30} />
                <strong>{call.title}</strong>
                <span>{call.description}</span>
                <small>{call.action}<ArrowRight size={14} /></small>
              </button>
            )
          })}
        </div>
      </div>
    </section>
  )
}
