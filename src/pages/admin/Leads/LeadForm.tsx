import { useState, type FormEvent } from 'react'
import { FormField } from '../../../components/FormField'
import { Feedback } from '../../../components/Feedback'
import type { AtualizarLead, LeadCRM, NovoLead, Origem, TipoLead, VeiculoCRM } from '../../../types/crm'
import { nomeVeiculo, ORIGENS, telefoneValido, TIPOS } from '../../../utils/crm'
import styles from './Leads.module.css'

type Props = {
  lead?: LeadCRM
  veiculos: VeiculoCRM[]
  veiculosIndisponiveis?: boolean
  ocupado: boolean
  erro: string
  onCancel: () => void
  onSubmit: (dados: NovoLead | AtualizarLead) => Promise<void>
}

export function LeadForm({ lead, veiculos, veiculosIndisponiveis = false, ocupado, erro, onCancel, onSubmit }: Props) {
  const [nome, setNome] = useState(lead?.nome ?? '')
  const [telefone, setTelefone] = useState(lead?.telefone ?? '')
  const [email, setEmail] = useState(lead?.email ?? '')
  const [tipo, setTipo] = useState<TipoLead>(lead?.tipo ?? 'INTERESSE')
  const [origem, setOrigem] = useState<Origem>('OUTRO')
  const [veiculoId, setVeiculoId] = useState('')
  const [errors, setErrors] = useState<Record<string, string>>({})

  async function submit(event: FormEvent) {
    event.preventDefault()
    if (ocupado) return
    const next: Record<string, string> = {}
    if (nome.trim().length < 2) next.nome = 'Informe um nome com pelo menos 2 caracteres.'
    if (!telefoneValido(telefone)) next.telefone = 'Informe um telefone brasileiro válido com DDD.'
    if (email.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) next.email = 'Informe um e-mail válido.'
    setErrors(next)
    if (Object.keys(next).length) {
      const first = Object.keys(next)[0]
      document.getElementById(`lead-${first}`)?.focus()
      return
    }
    const contato = { nome: nome.trim(), telefone: telefone.trim() }
    const endereco = email.trim()
    await onSubmit(lead
      ? { ...contato, email: endereco || null }
      : { ...contato, ...(endereco ? { email: endereco } : {}), tipo, origem, ...(veiculoId ? { veiculoId } : {}) })
  }

  const invalid = (field: string) => ({ 'aria-invalid': Boolean(errors[field]), 'aria-describedby': errors[field] ? `lead-${field}-erro` : undefined })
  return <form onSubmit={submit} className={styles.form} noValidate aria-busy={ocupado}>
    {erro && <Feedback mensagem={erro} />}
    <fieldset disabled={ocupado} className={styles.fieldset}>
      <FormField id="lead-nome" label="Nome *" erro={errors.nome}>
        <input id="lead-nome" value={nome} onChange={e => setNome(e.target.value)} maxLength={120} autoComplete="name" required autoFocus {...invalid('nome')} />
      </FormField>
      <FormField id="lead-telefone" label="Telefone com DDD *" erro={errors.telefone}>
        <input id="lead-telefone" type="tel" value={telefone} onChange={e => setTelefone(e.target.value)} maxLength={20} autoComplete="tel" required {...invalid('telefone')} />
      </FormField>
      <FormField id="lead-email" label="E-mail" erro={errors.email}>
        <input id="lead-email" type="email" value={email} onChange={e => setEmail(e.target.value)} maxLength={254} autoComplete="email" {...invalid('email')} />
      </FormField>
      {!lead && <>
        <div className={styles.formGrid}>
          <FormField id="lead-tipo" label="Tipo de interesse *"><select id="lead-tipo" value={tipo} onChange={e => setTipo(e.target.value as TipoLead)}>{TIPOS.map(t => <option key={t.valor} value={t.valor}>{t.label}</option>)}</select></FormField>
          <FormField id="lead-origem" label="Origem *"><select id="lead-origem" value={origem} onChange={e => setOrigem(e.target.value as Origem)}>{ORIGENS.map(o => <option key={o.valor} value={o.valor}>{o.label}</option>)}</select></FormField>
        </div>
        <FormField id="lead-veiculo" label="Veículo de interesse"><select id="lead-veiculo" value={veiculoId} disabled={veiculosIndisponiveis} onChange={e => setVeiculoId(e.target.value)}><option value="">Sem veículo</option>{veiculos.map(v => <option key={v.id} value={v.id}>{nomeVeiculo(v)}</option>)}</select></FormField>
        <p className={styles.hint}>O responsável inicial será definido pelo servidor conforme seu plano e usuário.</p>
      </>}
    </fieldset>
    <div className={styles.actions}>
      <button type="button" className="ui-button" disabled={ocupado} onClick={onCancel}>Cancelar</button>
      <button type="submit" className="ui-button ui-button-primary" disabled={ocupado}>{ocupado ? 'Salvando…' : lead ? 'Salvar contato' : 'Criar lead'}</button>
    </div>
  </form>
}
