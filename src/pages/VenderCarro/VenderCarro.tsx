import { useState, type CSSProperties } from 'react'

import { useNavigate } from 'react-router-dom'

import { ArrowRight, BadgeCheck, CircleCheckBig, Clock3, Loader2, ShieldCheck, Sparkles } from 'lucide-react'

import api from '../../api/axios'
import { siteConfig } from '../../config/site'

import { NavBar } from '../../components/NavBar/NavBar'
import { Footer } from '../../components/Footer/Footer'

import styles from './VenderCarro.module.css'

const benefitIcons = [Clock3, BadgeCheck, Sparkles]

export function VenderCarro() {
  const [form, setForm] = useState({
    nome: '',
    telefone: '',
    email: '',
    marca: '',
    modelo: '',
    ano: '',
    km: '',
    condicao: siteConfig.sellCar.defaultCondition,
    observacoes: '',
  })

  const [enviado, setEnviado] = useState(false)

  const [erro, setErro] = useState('')

  const [carregando, setCarregando] = useState(false)

  const navigate = useNavigate()

  function formatarTelefone(valor: string) {
    return valor
      .replace(/\D/g, '')
      .replace(/^(\d{2})(\d)/g, '($1) $2')
      .replace(/(\d{5})(\d)/, '$1-$2')
      .slice(0, 15)
  }

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) {
    const { name, value } = e.target

    if (name === 'telefone') {
      return setForm((p) => ({
        ...p,
        telefone: formatarTelefone(value),
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
      await api.post('/leads/vender-carro', form)

      setEnviado(true)
    } catch {
      setErro('Erro ao enviar. Tente novamente.')
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

          <h2>{siteConfig.sellCar.successTitle}</h2>

          <p>{siteConfig.sellCar.successText}</p>

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
          <span className={styles.eyebrow}>{siteConfig.sellCar.eyebrow}</span>
          <h1 className={styles.titulo}>{siteConfig.sellCar.title} <span>{siteConfig.sellCar.titleHighlight}</span></h1>

          <p className={styles.descricao}>{siteConfig.sellCar.description}</p>
        </div>

        <div className={styles.layout}>
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
            </div>
          </fieldset>

          <fieldset className={styles.fieldset}>
            <legend className={styles.legend}>Dados do veículo</legend>

            <div className={styles.grid}>
              <div className={styles.campo}>
                <label className={styles.label}>Marca *</label>

                <input name="marca" value={form.marca} onChange={handleChange} className={styles.input} placeholder="Ex: Toyota" required />
              </div>

              <div className={styles.campo}>
                <label className={styles.label}>Modelo *</label>

                <input name="modelo" value={form.modelo} onChange={handleChange} className={styles.input} placeholder="Ex: Corolla" required />
              </div>

              <div className={styles.campo}>
                <label className={styles.label}>Ano *</label>

                <input name="ano" value={form.ano} onChange={handleChange} className={styles.input} placeholder="Ex: 2020" required />
              </div>

              <div className={styles.campo}>
                <label className={styles.label}>Quilometragem *</label>

                <input name="km" value={form.km} onChange={handleChange} className={styles.input} placeholder="Ex: 65000" required />
              </div>

              <div className={styles.campo}>
                <label className={styles.label}>Condição *</label>

                <select name="condicao" value={form.condicao} onChange={handleChange} className={styles.input}>
                  {siteConfig.sellCar.conditions.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className={styles.campo}>
              <label className={styles.label}>Observações</label>

              <textarea
                name="observacoes"
                value={form.observacoes}
                onChange={handleChange}
                className={`${styles.input} ${styles.textarea}`}
                placeholder="Informe detalhes importantes sobre o veículo."
              />
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
                Enviar proposta
                <ArrowRight size={18} />
              </>
            )}
          </button>
        </form>

        <section className={styles.info}>
          <div className={styles.cardInfo}>
            <h2 className={styles.cardTitulo}>{siteConfig.sellCar.sectionTitle}</h2>

            <div className={styles.listaVantagens}>
              {siteConfig.sellCar.benefits.map((benefit, index) => {
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

              <span>{siteConfig.sellCar.privacy}</span>
            </div>
          </div>
        </section>
        </div>
      </main>
      <Footer />
    </div>
  )
}
