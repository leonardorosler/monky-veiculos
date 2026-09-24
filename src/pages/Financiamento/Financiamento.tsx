import { useEffect, useState, type CSSProperties } from 'react'
import { useLocation, useNavigate, useSearchParams } from 'react-router-dom'

import { ArrowRight, BadgeCheck, CircleCheckBig, Clock3, ShieldCheck, WalletCards, Loader2 } from 'lucide-react'

import api from '../../api/axios'
import type { Veiculo } from '../../types'
import { siteConfig } from '../../config/site'

import { NavBar } from '../../components/NavBar/NavBar'
import { Footer } from '../../components/Footer/Footer'

import styles from './Financiamento.module.css'

const benefitIcons = [Clock3, WalletCards, BadgeCheck]

type FinanciamentoLocationState = {
  veiculoInteresse?: string
}

export function Financiamento() {
  const [searchParams] = useSearchParams()
  const location = useLocation()
  const veiculoInteresseInicial = (location.state as FinanciamentoLocationState | null)?.veiculoInteresse ?? ''

  const [form, setForm] = useState({
    nome: '',
    telefone: '',
    email: '',
    cpf: '',
    veiculoInteresse: veiculoInteresseInicial,
    valorEntrada: '',
    prazo: siteConfig.financing.defaultTerm,
    rendaMensal: '',
  })

  const [enviado, setEnviado] = useState(false)

  const [erro, setErro] = useState('')

  const [carregando, setCarregando] = useState(false)

  const navigate = useNavigate()

  useEffect(() => {
    const veiculoId = searchParams.get('veiculo')

    if (!veiculoId || veiculoInteresseInicial) return

    let ativo = true

    api.get<Veiculo>(`/veiculos/${veiculoId}`)
      .then(({ data }) => {
        if (!ativo) return

        const preco = data.preco.toLocaleString('pt-BR', {
          style: 'currency',
          currency: 'BRL',
          maximumFractionDigits: 0,
        })

        setForm((formAtual) => ({
          ...formAtual,
          veiculoInteresse: formAtual.veiculoInteresse || `${data.marca} ${data.modelo} ${data.ano} - ${preco}`,
        }))
      })
      .catch(() => {
        // O formulário continua disponível para preenchimento manual.
      })

    return () => {
      ativo = false
    }
  }, [searchParams, veiculoInteresseInicial])

  function formatarTelefone(valor: string) {
    return valor
      .replace(/\D/g, '')
      .replace(/^(\d{2})(\d)/g, '($1) $2')
      .replace(/(\d{5})(\d)/, '$1-$2')
      .slice(0, 15)
  }

  function formatarCPF(valor: string) {
    return valor
      .replace(/\D/g, '')
      .replace(/(\d{3})(\d)/, '$1.$2')
      .replace(/(\d{3})(\d)/, '$1.$2')
      .replace(/(\d{3})(\d{1,2})$/, '$1-$2')
      .slice(0, 14)
  }

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) {
    const { name, value } = e.target

    if (name === 'telefone') {
      return setForm((p) => ({
        ...p,
        telefone: formatarTelefone(value),
      }))
    }

    if (name === 'cpf') {
      return setForm((p) => ({
        ...p,
        cpf: formatarCPF(value),
      }))
    }

    setForm((p) => ({
      ...p,
      [name]: value,
    }))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()

    setErro('')
    setCarregando(true)

    try {
      await api.post('/leads/financiamento', form)

      setEnviado(true)
    } catch {
      setErro('Erro ao enviar solicitação. Tente novamente.')
    } finally {
      setCarregando(false)
    }
  }

  if (enviado) {
    return (
      <div className={styles.container}>
        <NavBar />

        <div className={styles.sucesso}>
          <CircleCheckBig size={64} />

          <h2>{siteConfig.financing.successTitle}</h2>

          <p>{siteConfig.financing.successText}</p>

          <button onClick={() => navigate('/')} className={styles.botao}>
            Voltar ao início
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className={styles.container}>
      <NavBar />

      <main
        className={styles.main}
        style={{
          '--hero-image': `url("${siteConfig.assets.hero}")`,
          '--dealership-image': `url("${siteConfig.assets.dealership}")`,
        } as CSSProperties}
      >
        <div className={styles.hero}>
          <span className={styles.eyebrow}>{siteConfig.financing.eyebrow}</span>
          <h1 className={styles.titulo}>{siteConfig.financing.title} <span>{siteConfig.financing.titleHighlight}</span></h1>

          <p className={styles.descricao}>{siteConfig.financing.description}</p>
        </div>

        <div className={styles.layout}>
          <aside className={styles.sidebar}>
            <div className={styles.cardInfo}>
              <h2 className={styles.cardTitulo}>{siteConfig.financing.sectionTitle}</h2>

              <div className={styles.listaVantagens}>
                {siteConfig.financing.benefits.map((benefit, index) => {
                  const Icon = benefitIcons[index]
                  return (
                    <div className={styles.vantagem} key={benefit.title}>
                      <Icon size={20} />
                      <div><strong>{benefit.title}</strong><p>{benefit.description}</p></div>
                    </div>
                  )
                })}
              </div>

              <div className={styles.seguro}>
                <ShieldCheck size={18} />

                <span>{siteConfig.financing.privacy}</span>
              </div>
            </div>
          </aside>

          <section className={styles.formArea}>
            <form onSubmit={handleSubmit} className={styles.form}>
              {erro && <p className={styles.erro}>{erro}</p>}

              <fieldset className={styles.fieldset}>
                <legend className={styles.legend}>Seus dados</legend>

                <div className={styles.grid}>
                  <div className={styles.campo}>
                    <label className={styles.label}>Nome *</label>

                    <input name="nome" value={form.nome} onChange={handleChange} className={styles.input} required />
                  </div>

                  <div className={styles.campo}>
                    <label className={styles.label}>Telefone *</label>

                    <input
                      name="telefone"
                      value={form.telefone}
                      onChange={handleChange}
                      className={styles.input}
                      placeholder="(11) 99999-9999"
                      required
                    />
                  </div>

                  <div className={styles.campo}>
                    <label className={styles.label}>Email</label>

                    <input
                      name="email"
                      type="email"
                      value={form.email}
                      onChange={handleChange}
                      className={styles.input}
                      placeholder="seuemail@email.com"
                    />
                  </div>

                  <div className={styles.campo}>
                    <label className={styles.label}>CPF</label>

                    <input name="cpf" value={form.cpf} onChange={handleChange} className={styles.input} placeholder="000.000.000-00" />
                  </div>
                </div>
              </fieldset>

              <fieldset className={styles.fieldset}>
                <legend className={styles.legend}>Dados do financiamento</legend>

                <div className={styles.grid}>
                  <div className={styles.campo}>
                    <label className={styles.label}>Veículo de interesse *</label>

                    <input
                      name="veiculoInteresse"
                      placeholder="Ex: Honda Civic 2022"
                      value={form.veiculoInteresse}
                      onChange={handleChange}
                      className={styles.input}
                      required
                    />
                  </div>

                  <div className={styles.campo}>
                    <label className={styles.label}>Entrada (R$) *</label>

                    <input name="valorEntrada" type="number" value={form.valorEntrada} onChange={handleChange} className={styles.input} required />
                  </div>

                  <div className={styles.campo}>
                    <label className={styles.label}>Prazo *</label>

                    <select name="prazo" value={form.prazo} onChange={handleChange} className={styles.input}>
                      {siteConfig.financing.terms.map((p) => (
                        <option key={p} value={p}>
                          {p} meses
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className={styles.campo}>
                    <label className={styles.label}>Renda mensal</label>

                    <input
                      name="rendaMensal"
                      type="number"
                      value={form.rendaMensal}
                      onChange={handleChange}
                      className={styles.input}
                      placeholder="Ex: 5000"
                    />
                  </div>
                </div>
              </fieldset>

              <button type="submit" disabled={carregando} className={styles.botao}>
                {carregando ? (
                  <>
                    <Loader2 size={18} className={styles.spinner} />
                    Enviando...
                  </>
                ) : (
                  <>
                    Solicitar simulação
                    <ArrowRight size={18} />
                  </>
                )}
              </button>
            </form>
          </section>
        </div>
      </main>
      <Footer />
    </div>
  )
}
