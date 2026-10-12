import { useEffect, useState, type CSSProperties, type ChangeEvent, type FormEvent } from 'react'
import { Link, useLocation, useSearchParams } from 'react-router-dom'
import { BadgeCheck, CircleCheckBig, Clock3, ShieldCheck, WalletCards, Loader2 } from 'lucide-react'
import api from '../../api/axios'
import type { Veiculo } from '../../types'
import { siteConfig } from '../../config/site'
import { Feedback } from '../../components/Feedback'
import { FormField } from '../../components/FormField'
import { cpfValido, focarPrimeiroErro, formatarTelefone, validarContato } from '../../utils/formValidation'
import styles from './Financiamento.module.css'

const benefitIcons = [Clock3, WalletCards, BadgeCheck]

export function Financiamento() {
  const [searchParams] = useSearchParams()
  const location = useLocation()
  const interesseInicial = (location.state as { veiculoInteresse?: string } | null)?.veiculoInteresse ?? ''
  const [form, setForm] = useState({ nome: '', telefone: '', email: '', cpf: '', veiculoInteresse: interesseInicial, valorEntrada: '', prazo: String(siteConfig.financing.defaultTerm), rendaMensal: '' })
  const [enviado, setEnviado] = useState(false)
  const [erro, setErro] = useState('')
  const [errosCampos, setErrosCampos] = useState<Record<string, string>>({})
  const [carregando, setCarregando] = useState(false)

  useEffect(() => {
    const id = searchParams.get('veiculo')
    if (!id || interesseInicial) return
    const controller = new AbortController()
    api.get<Veiculo>(`/veiculos/${id}`, { signal: controller.signal }).then(({ data }) => {
      setForm(current => ({ ...current, veiculoInteresse: current.veiculoInteresse || `${data.marca} ${data.modelo} ${data.ano} — ${data.preco.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}` }))
    }).catch(() => { /* The visitor can enter the vehicle manually. */ })
    return () => controller.abort()
  }, [searchParams, interesseInicial])

  function alterar(event: ChangeEvent<HTMLInputElement | HTMLSelectElement>) {
    const { name, value } = event.target
    let valor = value
    if (name === 'telefone') valor = formatarTelefone(value)
    if (name === 'cpf') valor = value.replace(/\D/g, '').slice(0, 11).replace(/(\d{3})(\d)/, '$1.$2').replace(/(\d{3})(\d)/, '$1.$2').replace(/(\d{3})(\d{1,2})$/, '$1-$2')
    setForm(current => ({ ...current, [name]: valor }))
    setErrosCampos(current => ({ ...current, [name]: '' }))
  }

  async function enviar(event: FormEvent) {
    event.preventDefault()
    if (carregando) return
    const erros = validarContato(form)
    if (form.cpf && !cpfValido(form.cpf)) erros.cpf = 'Confira os dígitos do CPF informado.'
    if (!form.veiculoInteresse.trim()) erros.veiculoInteresse = 'Informe o veículo que deseja financiar.'
    if (!form.valorEntrada || !Number.isFinite(Number(form.valorEntrada)) || Number(form.valorEntrada) < 0) erros.valorEntrada = 'Informe uma entrada igual ou maior que zero.'
    if (form.rendaMensal && (!Number.isFinite(Number(form.rendaMensal)) || Number(form.rendaMensal) < 0)) erros.rendaMensal = 'Informe uma renda igual ou maior que zero.'
    setErrosCampos(erros)
    setErro('')
    if (Object.keys(erros).length) { setErro('Confira os campos destacados antes de enviar.'); focarPrimeiroErro(erros); return }
    setCarregando(true)
    try { await api.post('/leads/financiamento', form); setEnviado(true) }
    catch { setErro('Não foi possível enviar sua solicitação. Seus dados foram mantidos para tentar novamente.') }
    finally { setCarregando(false) }
  }

  const atributos = (name: keyof typeof form) => ({ id: name, name, value: form[name], onChange: alterar, 'aria-invalid': !!errosCampos[name], 'aria-describedby': errosCampos[name] ? `${name}-erro` : undefined, className: styles.input })

  if (enviado) return <main className={styles.sucesso} tabIndex={-1} aria-labelledby="financiamento-sucesso"><CircleCheckBig size={64} aria-hidden="true" /><h1 id="financiamento-sucesso">{siteConfig.financing.successTitle}</h1><p role="status">{siteConfig.financing.successText}</p><Link className="ui-button ui-button-primary" to="/catalogo">Continuar explorando o estoque</Link></main>

  return (
    <main className={styles.main} style={{ '--hero-image': `url("${siteConfig.assets.hero}")`, '--dealership-image': `url("${siteConfig.assets.dealership}")` } as CSSProperties}>
      <div className={styles.hero}><span className={styles.eyebrow}>{siteConfig.financing.eyebrow}</span><h1 className={styles.titulo}>{siteConfig.financing.title} <span>{siteConfig.financing.titleHighlight}</span></h1><p className={styles.descricao}>{siteConfig.financing.description}</p></div>
      <div className={styles.layout}>
        <aside className={styles.sidebar}><div className={styles.cardInfo}><h2 className={styles.cardTitulo}>{siteConfig.financing.sectionTitle}</h2><div className={styles.listaVantagens}>{siteConfig.financing.benefits.map((item, index) => { const Icon = benefitIcons[index]; return <div key={item.title} className={styles.vantagem}><Icon size={20} /><div><strong>{item.title}</strong><p>{item.description}</p></div></div> })}</div><div className={styles.seguro}><ShieldCheck size={18} /><span>{siteConfig.financing.privacy}</span></div></div></aside>
        <section className={styles.formArea} aria-label="Solicitação de financiamento">
          <form onSubmit={enviar} className={styles.form} noValidate aria-busy={carregando}>
            {erro && <Feedback mensagem={erro} />}
            <fieldset className={styles.fieldset} disabled={carregando}><legend className={styles.legend}>Seus dados</legend><p className={styles.ajuda}>Os campos com * são obrigatórios.</p><div className={styles.grid}>
              <FormField id="nome" label="Nome *" erro={errosCampos.nome}><input {...atributos('nome')} autoComplete="name" required minLength={2} /></FormField>
              <FormField id="telefone" label="Telefone com DDD *" erro={errosCampos.telefone}><input {...atributos('telefone')} type="tel" autoComplete="tel-national" placeholder="(11) 99999-9999" required /></FormField>
              <FormField id="email" label="Email" erro={errosCampos.email}><input {...atributos('email')} type="email" autoComplete="email" placeholder="seuemail@email.com" /></FormField>
              <FormField id="cpf" label="CPF" erro={errosCampos.cpf}><input {...atributos('cpf')} inputMode="numeric" placeholder="000.000.000-00" /></FormField>
            </div></fieldset>
            <fieldset className={styles.fieldset} disabled={carregando}><legend className={styles.legend}>Dados do financiamento</legend><div className={styles.grid}>
              <FormField id="veiculoInteresse" label="Veículo de interesse *" erro={errosCampos.veiculoInteresse}><input {...atributos('veiculoInteresse')} placeholder="Ex: Honda Civic 2022" required /></FormField>
              <FormField id="valorEntrada" label="Entrada (R$) *" erro={errosCampos.valorEntrada}><input {...atributos('valorEntrada')} type="number" inputMode="decimal" min="0" step="0.01" required /></FormField>
              <FormField id="prazo" label="Prazo *"><select {...atributos('prazo')}>{siteConfig.financing.terms.map(prazo => <option key={prazo} value={prazo}>{prazo} meses</option>)}</select></FormField>
              <FormField id="rendaMensal" label="Renda mensal (R$)" erro={errosCampos.rendaMensal}><input {...atributos('rendaMensal')} type="number" inputMode="decimal" min="0" step="0.01" /></FormField>
            </div></fieldset>
            <p className={styles.ajuda}>Ao enviar, nossa equipe entrará em contato para analisar as condições disponíveis.</p>
            <button type="submit" disabled={carregando} className={styles.botao}>{carregando && <Loader2 size={18} className={styles.spinner} />}{carregando ? 'Enviando solicitação...' : 'Solicitar análise de financiamento'}</button>
          </form>
        </section>
      </div>
    </main>
  )
}
