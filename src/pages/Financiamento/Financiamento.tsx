import { useState } from 'react'
import { useNavigate } from 'react-router-dom'

import { BadgeCheck, CircleCheckBig, Clock3, ShieldCheck, WalletCards, Loader2 } from 'lucide-react'

import api from '../../api/axios'

import { NavBar } from '../../components/NavBar/NavBar'

import styles from './Financiamento.module.css'

const prazos = ['12', '24', '36', '48', '60']

export function Financiamento() {
  const [form, setForm] = useState({
    nome: '',
    telefone: '',
    email: '',
    cpf: '',
    veiculoInteresse: '',
    valorEntrada: '',
    prazo: '36',
    rendaMensal: '',
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

          <h2>Simulação recebida!</h2>

          <p>Nossa equipe analisará seu perfil e entrará em contato com as melhores condições disponíveis.</p>

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

      <main className={styles.main}>
        <div className={styles.hero}>
          <h1 className={styles.titulo}>Simule seu financiamento</h1>

          <p className={styles.descricao}>Receba uma análise rápida e descubra as melhores condições para conquistar seu próximo veículo.</p>
        </div>

        <div className={styles.layout}>
          <aside className={styles.sidebar}>
            <div className={styles.cardInfo}>
              <h2 className={styles.cardTitulo}>Por que financiar conosco?</h2>

              <div className={styles.listaVantagens}>
                <div className={styles.vantagem}>
                  <Clock3 size={20} />

                  <div>
                    <strong>Aprovação rápida</strong>

                    <p>Retorno ágil para sua análise de crédito.</p>
                  </div>
                </div>

                <div className={styles.vantagem}>
                  <WalletCards size={20} />

                  <div>
                    <strong>Parcelas flexíveis</strong>

                    <p>Opções adaptadas ao seu orçamento.</p>
                  </div>
                </div>

                <div className={styles.vantagem}>
                  <BadgeCheck size={20} />

                  <div>
                    <strong>Atendimento personalizado</strong>

                    <p>Nossa equipe ajuda você durante todo o processo.</p>
                  </div>
                </div>
              </div>

              <div className={styles.seguro}>
                <ShieldCheck size={18} />

                <span>Seus dados são protegidos e usados apenas para análise de crédito.</span>
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
                      {prazos.map((p) => (
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
                  'Solicitar simulação'
                )}
              </button>
            </form>
          </section>
        </div>
      </main>
    </div>
  )
}
