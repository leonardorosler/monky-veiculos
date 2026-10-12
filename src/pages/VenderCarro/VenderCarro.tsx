import { useState, type CSSProperties, type ChangeEvent, type FormEvent } from 'react'
import { Link } from 'react-router-dom'
import { BadgeCheck, CircleCheckBig, Clock3, Loader2, ShieldCheck, Sparkles } from 'lucide-react'
import api from '../../api/axios'
import { siteConfig } from '../../config/site'
import { Feedback } from '../../components/Feedback'
import { FormField } from '../../components/FormField'
import { focarPrimeiroErro, formatarTelefone, validarContato } from '../../utils/formValidation'
import styles from './VenderCarro.module.css'

const benefitIcons = [Clock3, BadgeCheck, Sparkles]

export function VenderCarro() {
  const [form, setForm] = useState({ nome: '', telefone: '', email: '', marca: '', modelo: '', ano: '', km: '', condicao: String(siteConfig.sellCar.defaultCondition), observacoes: '' })
  const [enviado, setEnviado] = useState(false)
  const [erro, setErro] = useState('')
  const [errosCampos, setErrosCampos] = useState<Record<string, string>>({})
  const [carregando, setCarregando] = useState(false)

  function alterar(event: ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) {
    const { name, value } = event.target
    setForm(current => ({ ...current, [name]: name === 'telefone' ? formatarTelefone(value) : value }))
    setErrosCampos(current => ({ ...current, [name]: '' }))
  }

  async function enviar(event: FormEvent) {
    event.preventDefault()
    if (carregando) return
    const erros = validarContato(form)
    if (!form.marca.trim()) erros.marca = 'Informe a marca do veículo.'
    if (!form.modelo.trim()) erros.modelo = 'Informe o modelo do veículo.'
    if (!form.ano || !Number.isInteger(Number(form.ano)) || Number(form.ano) < 1900 || Number(form.ano) > new Date().getFullYear() + 1) erros.ano = 'Informe um ano válido para o veículo.'
    if (!form.km || !Number.isFinite(Number(form.km)) || Number(form.km) < 0) erros.km = 'Informe uma quilometragem igual ou maior que zero.'
    setErrosCampos(erros)
    setErro('')
    if (Object.keys(erros).length) { setErro('Confira os campos destacados antes de enviar.'); focarPrimeiroErro(erros); return }
    setCarregando(true)
    try { await api.post('/leads/vender-carro', form); setEnviado(true) }
    catch { setErro('Não foi possível enviar sua avaliação. Seus dados foram mantidos para tentar novamente.') }
    finally { setCarregando(false) }
  }

  const atributos = (name: keyof typeof form) => ({ id: name, name, value: form[name], onChange: alterar, 'aria-invalid': !!errosCampos[name], 'aria-describedby': errosCampos[name] ? `${name}-erro` : undefined, className: styles.input })

  if (enviado) return <main className={styles.sucesso} aria-labelledby="avaliacao-sucesso"><CircleCheckBig size={64} aria-hidden="true" /><h1 id="avaliacao-sucesso">{siteConfig.sellCar.successTitle}</h1><p role="status">{siteConfig.sellCar.successText}</p><Link className="ui-button ui-button-primary" to="/catalogo">Explorar o estoque</Link></main>

  return (
    <main className={styles.main} style={{ '--hero-image': `url("${siteConfig.assets.hero}")`, '--dealership-image': `url("${siteConfig.assets.dealership}")` } as CSSProperties}>
      <div className={styles.hero}><span className={styles.eyebrow}>{siteConfig.sellCar.eyebrow}</span><h1 className={styles.titulo}>{siteConfig.sellCar.title} <span>{siteConfig.sellCar.titleHighlight}</span></h1><p className={styles.descricao}>{siteConfig.sellCar.description}</p></div>
      <div className={styles.layout}>
        <form onSubmit={enviar} className={styles.form} noValidate aria-busy={carregando}>
          {erro && <Feedback mensagem={erro} />}
          <fieldset className={styles.fieldset} disabled={carregando}><legend className={styles.legend}>Seus dados</legend><p className={styles.ajuda}>Os campos com * são obrigatórios.</p><div className={styles.grid}>
            <FormField id="nome" label="Nome *" erro={errosCampos.nome}><input {...atributos('nome')} autoComplete="name" required minLength={2} /></FormField>
            <FormField id="telefone" label="Telefone com DDD *" erro={errosCampos.telefone}><input {...atributos('telefone')} type="tel" autoComplete="tel-national" placeholder="(11) 99999-9999" required /></FormField>
            <FormField id="email" label="Email" erro={errosCampos.email}><input {...atributos('email')} type="email" autoComplete="email" /></FormField>
          </div></fieldset>
          <fieldset className={styles.fieldset} disabled={carregando}><legend className={styles.legend}>Seu veículo</legend><div className={styles.grid}>
            <FormField id="marca" label="Marca *" erro={errosCampos.marca}><input {...atributos('marca')} placeholder="Ex: Toyota" required /></FormField>
            <FormField id="modelo" label="Modelo *" erro={errosCampos.modelo}><input {...atributos('modelo')} placeholder="Ex: Corolla" required /></FormField>
            <FormField id="ano" label="Ano *" erro={errosCampos.ano}><input {...atributos('ano')} type="number" inputMode="numeric" min="1900" max={new Date().getFullYear() + 1} required /></FormField>
            <FormField id="km" label="Quilometragem *" erro={errosCampos.km}><input {...atributos('km')} type="number" inputMode="numeric" min="0" required /></FormField>
            <FormField id="condicao" label="Estado de conservação"><select {...atributos('condicao')}>{siteConfig.sellCar.conditions.map(item => <option key={item} value={item}>{item}</option>)}</select></FormField>
          </div><FormField id="observacoes" label="Observações"><textarea {...atributos('observacoes')} className={`${styles.input} ${styles.textarea}`} placeholder="Conte detalhes que podem ajudar na avaliação." /></FormField></fieldset>
          <button type="submit" className={styles.botao} disabled={carregando}>{carregando && <Loader2 size={18} className={styles.spinner} />}{carregando ? 'Enviando dados...' : 'Solicitar avaliação do veículo'}</button>
        </form>
        <aside className={styles.info}><div className={styles.cardInfo}><h2 className={styles.cardTitulo}>{siteConfig.sellCar.sectionTitle}</h2><div className={styles.listaVantagens}>{siteConfig.sellCar.benefits.map((item, index) => { const Icon = benefitIcons[index]; return <div key={item.title} className={styles.vantagem}><Icon size={20} /><div><strong>{item.title}</strong><p>{item.description}</p></div></div> })}</div><div className={styles.seguro}><ShieldCheck size={18} /><span>{siteConfig.sellCar.privacy}</span></div></div></aside>
      </div>
    </main>
  )
}
