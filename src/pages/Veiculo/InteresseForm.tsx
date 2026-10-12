import { useState, type FormEvent } from 'react'
import api from '../../api/axios'
import { getWhatsAppUrl, siteConfig } from '../../config/site'
import type { Veiculo } from '../../types'
import { FormField } from '../../components/FormField'
import { Feedback } from '../../components/Feedback'
import { erroCRM } from '../../utils/crm'
import styles from './Veiculos.module.css'

export function InteresseForm({ veiculo, continuarWhatsApp }: { veiculo: Veiculo; continuarWhatsApp: boolean }) {
  const [form, setForm] = useState({ nome: '', telefone: '', email: '' })
  const [salvando, setSalvando] = useState(false)
  const [erro, setErro] = useState('')
  const [salvo, setSalvo] = useState(false)
  const whatsapp = getWhatsAppUrl(`Olá! Sou ${form.nome.trim()} e registrei meu interesse no ${veiculo.marca} ${veiculo.modelo} ${veiculo.ano}. ${window.location.href}`)
  async function submit(event: FormEvent) {
    event.preventDefault()
    if (salvando || salvo) return
    setSalvando(true); setErro('')
    try {
      await api.post('/leads/interesse', { nome: form.nome.trim(), telefone: form.telefone.trim(), ...(form.email.trim() ? { email: form.email.trim() } : {}), veiculoId: veiculo.id, origem: continuarWhatsApp ? 'WHATSAPP' : 'SITE' })
      setSalvo(true)
    } catch (error) { setErro(erroCRM(error, 'Não foi possível registrar seu interesse. Seus dados foram preservados.')) }
    finally { setSalvando(false) }
  }
  if (salvo) return <div className={styles.interesseForm}><Feedback mensagem="Interesse registrado! Nossa equipe recebeu seus dados para atendimento." tipo="sucesso" />{continuarWhatsApp && siteConfig.contact.whatsapp && <a className="ui-button ui-button-primary" href={whatsapp} target="_blank" rel="noreferrer">Continuar no WhatsApp</a>}<p>Abrir o WhatsApp não confirma o envio da mensagem.</p></div>
  return <form className={styles.interesseForm} onSubmit={submit} aria-busy={salvando}>
    <p>Informe seus dados para a loja acompanhar seu interesse neste veículo.</p>
    {erro && <Feedback mensagem={erro} />}
    <fieldset disabled={salvando}>
      <FormField id="interesse-nome" label="Nome"><input id="interesse-nome" required autoComplete="name" maxLength={120} value={form.nome} onChange={e => setForm({ ...form, nome: e.target.value })} /></FormField>
      <FormField id="interesse-telefone" label="Telefone / WhatsApp"><input id="interesse-telefone" type="tel" required autoComplete="tel" minLength={8} maxLength={20} value={form.telefone} onChange={e => setForm({ ...form, telefone: e.target.value })} /></FormField>
      <FormField id="interesse-email" label="E-mail (opcional)"><input id="interesse-email" type="email" autoComplete="email" maxLength={254} value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} /></FormField>
    </fieldset>
    <p>Seus dados serão usados pela revenda para atender esta solicitação.</p>
    <button className="ui-button ui-button-primary" disabled={salvando}>{salvando ? 'Registrando…' : continuarWhatsApp ? 'Registrar e continuar para o WhatsApp' : 'Registrar interesse'}</button>
    {siteConfig.contact.whatsapp && <a className="ui-button" href={getWhatsAppUrl(`Olá! Tenho interesse no ${veiculo.marca} ${veiculo.modelo} ${veiculo.ano}. ${window.location.href}`)} target="_blank" rel="noreferrer">Acessar WhatsApp diretamente</a>}
  </form>
}
