import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'

import { Heart, MessageCircle, BadgeDollarSign, Fuel, Gauge, Palette, ChevronLeft, ChevronRight } from 'lucide-react'

import api from '../../api/axios'

import type { Veiculo as VeiculoType } from '../../types'

import { Spinner } from '../../components/Spinner/Spinner'
import { NavBar } from '../../components/NavBar/NavBar'
import { CardVeiculo } from '../../components/CardVeiculo/CardVeiculo'

import styles from './Veiculos.module.css'

const SESSION_KEY = 'catalogo_session_id'

function getSessionId() {
  let id = localStorage.getItem(SESSION_KEY)

  if (!id) {
    id = crypto.randomUUID()
    localStorage.setItem(SESSION_KEY, id)
  }

  return id
}

export function Veiculo() {
  const [veiculo, setVeiculo] = useState<VeiculoType | null>(null)

  const [relacionados, setRelacionados] = useState<VeiculoType[]>([])

  const [fotoAtiva, setFotoAtiva] = useState(0)

  const [favoritado, setFavoritado] = useState(false)

  const { id } = useParams()

  const sessionId = getSessionId()

  const navigate = useNavigate()

  useEffect(() => {
    carregarVeiculo()
    carregarFavoritos()
  }, [id])

  async function carregarVeiculo() {
    const { data } = await api.get<VeiculoType>(`/veiculos/${id}`)

    setVeiculo(data)

    const relacionadosResponse = await api.get<VeiculoType[]>('/veiculos', {
      params: {
        marca: data.marca,
      },
    })

    setRelacionados(relacionadosResponse.data.filter((v) => v.id !== data.id).slice(0, 3))
  }

  async function carregarFavoritos() {
    try {
      const { data } = await api.get<VeiculoType[]>(`/favoritos?sessionId=${sessionId}`)

      setFavoritado(data.some((v) => v.id === id))
    } catch {}
  }

  async function handleFavoritar() {
    if (favoritado) {
      await api.delete(`/favoritos/${id}`, {
        data: { sessionId },
      })

      setFavoritado(false)
    } else {
      await api.post('/favoritos', {
        sessionId,
        veiculoId: id,
      })

      setFavoritado(true)
    }
  }

  function handleWhatsApp() {
    if (!veiculo) return

    const texto = `Olá! Tenho interesse no ${veiculo.marca} ${veiculo.modelo} ${veiculo.ano}.`

    const numero = import.meta.env.VITE_WHATSAPP ?? ''

    window.open(`https://wa.me/${numero}?text=${encodeURIComponent(texto)}`, '_blank')
  }

  function proximaFoto() {
    if (!veiculo) return

    setFotoAtiva((prev) => (prev === veiculo.fotos.length - 1 ? 0 : prev + 1))
  }

  function fotoAnterior() {
    if (!veiculo) return

    setFotoAtiva((prev) => (prev === 0 ? veiculo.fotos.length - 1 : prev - 1))
  }

  if (!veiculo) {
    return <Spinner />
  }

  return (
    <div className={styles.container}>
      <NavBar />

      <main className={styles.main}>
        <div className={styles.layout}>
          <section className={styles.galeria}>
            <div className={styles.fotoGrande}>
              {veiculo.fotos.length > 0 ? (
                <>
                  <img src={veiculo.fotos[fotoAtiva].url} alt={`${veiculo.marca} ${veiculo.modelo}`} className={styles.imagemGrande} />

                  {veiculo.fotos.length > 1 && (
                    <>
                      <button onClick={fotoAnterior} className={`${styles.seta} ${styles.setaEsquerda}`}>
                        <ChevronLeft size={22} />
                      </button>

                      <button onClick={proximaFoto} className={`${styles.seta} ${styles.setaDireita}`}>
                        <ChevronRight size={22} />
                      </button>
                    </>
                  )}
                </>
              ) : (
                <div className={styles.semFoto}>Sem fotos</div>
              )}
            </div>

            {veiculo.fotos.length > 1 && (
              <div className={styles.miniaturas}>
                {veiculo.fotos.map((foto, i) => (
                  <img
                    key={foto.id}
                    src={foto.url}
                    onClick={() => setFotoAtiva(i)}
                    className={`${styles.miniatura} ${i === fotoAtiva ? styles.miniaturaAtiva : ''}`}
                  />
                ))}
              </div>
            )}
          </section>

          <section className={styles.detalhes}>
            <div className={styles.cabecalho}>
              <div>
                <h1 className={styles.nomeVeiculo}>
                  {veiculo.marca} {veiculo.modelo}
                </h1>

                <p className={styles.anoKm}>
                  {veiculo.ano} · {veiculo.km.toLocaleString('pt-BR')} km
                </p>
              </div>

              <button onClick={handleFavoritar} className={styles.botaoFavorito}>
                <Heart size={22} fill={favoritado ? '#ef4444' : 'none'} color={favoritado ? '#ef4444' : '#0f172a'} />
              </button>
            </div>

            <p className={styles.preco}>
              {veiculo.preco.toLocaleString('pt-BR', {
                style: 'currency',
                currency: 'BRL',
              })}
            </p>

            <div className={styles.specs}>
              <div className={styles.spec}>
                <Fuel size={18} />

                <div>
                  <span className={styles.specLabel}>Combustível</span>

                  <span className={styles.specValor}>{veiculo.combustivel}</span>
                </div>
              </div>

              <div className={styles.spec}>
                <Gauge size={18} />

                <div>
                  <span className={styles.specLabel}>Câmbio</span>

                  <span className={styles.specValor}>{veiculo.cambio}</span>
                </div>
              </div>

              <div className={styles.spec}>
                <Palette size={18} />

                <div>
                  <span className={styles.specLabel}>Cor</span>

                  <span className={styles.specValor}>{veiculo.cor}</span>
                </div>
              </div>

              <div className={styles.spec}>
                <BadgeDollarSign size={18} />

                <div>
                  <span className={styles.specLabel}>Aceita troca</span>

                  <span className={styles.specValor}>Consultar</span>
                </div>
              </div>
            </div>

            {veiculo.descricao && (
              <div className={styles.descricao}>
                <h2 className={styles.descricaoTitulo}>Sobre o veículo</h2>

                <p className={styles.descricaoTexto}>{veiculo.descricao}</p>
              </div>
            )}

            <div className={styles.ctas}>
              <button onClick={handleWhatsApp} className={styles.botaoWhatsApp}>
                <MessageCircle size={20} />
                Falar no WhatsApp
              </button>

              <button className={styles.botaoFinanciamento} onClick={() => navigate('/financiamento')}>Simular financiamento</button>
            </div>
          </section>
        </div>

        {relacionados.length > 0 && (
          <section className={styles.relacionados}>
            <div className={styles.relacionadosTopo}>
              <h2 className={styles.relacionadosTitulo}>Veículos relacionados</h2>

              <p className={styles.relacionadosTexto}>Outros veículos que podem te interessar</p>
            </div>

            <div className={styles.relacionadosGrid}>
              {relacionados.map((v) => (
                <CardVeiculo key={v.id} veiculo={v} />
              ))}
            </div>
          </section>
        )}
      </main>
    </div>
  )
}
