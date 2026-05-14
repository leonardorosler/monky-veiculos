import { useState } from 'react'

import { useNavigate } from 'react-router-dom'

import { BadgeCheck, CircleCheckBig, Clock3, Loader2, ShieldCheck, Sparkles } from 'lucide-react'

import api from '../../api/axios'

import { NavBar } from '../../components/NavBar/NavBar'

import styles from './VenderCarro.module.css'

const condicoes = ['Excelente', 'Bom', 'Regular']

export function VenderCarro() {
  const [form, setForm] = useState({
    nome: '',
    telefone: '',
    email: '',
    marca: '',
    modelo: '',
    ano: '',
    km: '',
    condicao: 'Bom',
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

          <h2>Recebemos seu veículo!</h2>

          <p>Nossa equipe analisará as informações enviadas e entrará em contato com você em breve.</p>

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
          <h1 className={styles.titulo}>Venda seu carro com segurança</h1>

          <p className={styles.descricao}>Preencha os dados abaixo para receber uma avaliação rápida do seu veículo.</p>
        </div>

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
                  {condicoes.map((c) => (
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
              'Enviar proposta'
            )}
          </button>
        </form>

        <section className={styles.info}>
          <div className={styles.cardInfo}>
            <h2 className={styles.cardTitulo}>Por que vender conosco?</h2>

            <div className={styles.listaVantagens}>
              <div className={styles.vantagem}>
                <Clock3 size={20} />

                <div>
                  <strong>Avaliação rápida</strong>

                  <p>Retorno rápido para análise do seu veículo.</p>
                </div>
              </div>

              <div className={styles.vantagem}>
                <BadgeCheck size={20} />

                <div>
                  <strong>Processo seguro</strong>

                  <p>Negociação transparente e sem burocracia.</p>
                </div>
              </div>

              <div className={styles.vantagem}>
                <Sparkles size={20} />

                <div>
                  <strong>Melhor valorização</strong>

                  <p>Buscamos a melhor proposta para seu carro.</p>
                </div>
              </div>
            </div>

            <div className={styles.seguro}>
              <ShieldCheck size={18} />

              <span>Seus dados são protegidos e utilizados apenas para contato e avaliação do veículo.</span>
            </div>
          </div>
        </section>
      </main>
    </div>
  )
}
