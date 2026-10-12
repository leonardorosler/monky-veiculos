import { useState, type FormEvent } from 'react'
import { FormField } from '../../../components/FormField'
import { Feedback } from '../../../components/Feedback'
import type { NovaProposta, VeiculoCRM } from '../../../types/crm'
import { dataFuturaISO, dinheiro, nomeVeiculo, parseDinheiro } from '../../../utils/crm'
import styles from './Leads.module.css'

export function ProposalForm({ veiculos, veiculoInicial, ocupado, erro, onCancel, onSubmit }: {
  veiculos: VeiculoCRM[]; veiculoInicial?: string | null; ocupado: boolean; erro: string
  onCancel: () => void; onSubmit: (dados: NovaProposta) => Promise<void>
}) {
  const initial = veiculos.find(v => v.id === veiculoInicial)
  const [veiculoId, setVeiculoId] = useState(initial?.id ?? '')
  const [valor, setValor] = useState(initial ? String(initial.preco).replace('.', ',') : '')
  const [entrada, setEntrada] = useState('')
  const [trocaDescricao, setTrocaDescricao] = useState('')
  const [trocaValor, setTrocaValor] = useState('')
  const [observacoes, setObservacoes] = useState('')
  const [validade, setValidade] = useState('')
  const [errors, setErrors] = useState<Record<string, string>>({})

  async function submit(event: FormEvent) {
    event.preventDefault()
    if (ocupado) return
    const next: Record<string, string> = {}
    const total = parseDinheiro(valor)
    const sinal = entrada.trim() ? parseDinheiro(entrada) : 0
    const troca = trocaValor.trim() ? parseDinheiro(trocaValor) : 0
    const iso = dataFuturaISO(validade)
    if (!veiculos.some(v => v.id === veiculoId)) next.veiculo = 'Selecione um veículo disponível.'
    if (total === null || total <= 0) next.valor = 'Informe um valor maior que zero (ex.: 85.000,00).'
    if (sinal === null) next.entrada = 'Informe um valor monetário válido.'
    else if (total !== null && sinal > total) next.entrada = 'A entrada não pode superar o valor da proposta.'
    if (troca === null) next.trocaValor = 'Informe um valor monetário válido.'
    if (troca !== null && troca > 0 && !trocaDescricao.trim()) next.trocaDescricao = 'Descreva o veículo oferecido na troca.'
    if (trocaDescricao.trim() && (!troca || troca <= 0)) next.trocaValor = 'Informe o valor da troca.'
    if (total !== null && sinal !== null && troca !== null && sinal + troca > total) next.entrada = 'Entrada e troca juntas não podem superar o valor da proposta.'
    if (!iso) next.validade = 'Escolha uma data e hora válidas no futuro.'
    setErrors(next)
    if (Object.keys(next).length) { document.getElementById(`proposta-${Object.keys(next)[0]}`)?.focus(); return }
    await onSubmit({ veiculoId, valor: total!, entrada: sinal!, trocaValor: troca!,
      trocaDescricao: trocaDescricao.trim() || undefined, observacoes: observacoes.trim() || undefined, validadeEm: iso! })
  }

  const invalid = (field: string) => ({ 'aria-invalid': Boolean(errors[field]), 'aria-describedby': errors[field] ? `proposta-${field}-erro` : undefined })
  return <form className={styles.form} onSubmit={submit} noValidate aria-busy={ocupado}>
    {erro && <Feedback mensagem={erro} />}
    <p className={styles.hint}>Valores em reais. A proposta será criada como rascunho; o envio é registrado em uma ação separada.</p>
    <fieldset className={styles.fieldset} disabled={ocupado}>
      <FormField id="proposta-veiculo" label="Veículo disponível *" erro={errors.veiculo}>
        <select id="proposta-veiculo" value={veiculoId} autoFocus {...invalid('veiculo')} onChange={e => {
          setVeiculoId(e.target.value)
          const veiculo = veiculos.find(v => v.id === e.target.value)
          if (veiculo) setValor(String(veiculo.preco).replace('.', ','))
        }}><option value="">Selecione</option>{veiculos.map(v => <option key={v.id} value={v.id}>{nomeVeiculo(v)} — {dinheiro(v.preco)}</option>)}</select>
      </FormField>
      <div className={styles.formGrid}>
        <FormField id="proposta-valor" label="Valor da proposta (R$) *" erro={errors.valor}><input id="proposta-valor" inputMode="decimal" value={valor} onChange={e => setValor(e.target.value)} required {...invalid('valor')} /></FormField>
        <FormField id="proposta-entrada" label="Entrada (R$)" erro={errors.entrada}><input id="proposta-entrada" inputMode="decimal" value={entrada} onChange={e => setEntrada(e.target.value)} {...invalid('entrada')} /></FormField>
      </div>
      <FormField id="proposta-trocaDescricao" label="Veículo na troca" erro={errors.trocaDescricao}><input id="proposta-trocaDescricao" value={trocaDescricao} maxLength={500} onChange={e => setTrocaDescricao(e.target.value)} {...invalid('trocaDescricao')} /></FormField>
      <div className={styles.formGrid}>
        <FormField id="proposta-trocaValor" label="Valor da troca (R$)" erro={errors.trocaValor}><input id="proposta-trocaValor" inputMode="decimal" value={trocaValor} onChange={e => setTrocaValor(e.target.value)} {...invalid('trocaValor')} /></FormField>
        <FormField id="proposta-validade" label="Válida até (horário local) *" erro={errors.validade}><input id="proposta-validade" type="datetime-local" value={validade} onChange={e => setValidade(e.target.value)} required {...invalid('validade')} /></FormField>
      </div>
      <FormField id="proposta-observacoes" label="Observações"><textarea id="proposta-observacoes" rows={3} maxLength={3000} value={observacoes} onChange={e => setObservacoes(e.target.value)} /></FormField>
    </fieldset>
    <div className={styles.actions}><button type="button" className="ui-button" disabled={ocupado} onClick={onCancel}>Cancelar</button><button type="submit" className="ui-button ui-button-primary" disabled={ocupado}>{ocupado ? 'Criando…' : 'Criar proposta'}</button></div>
  </form>
}
