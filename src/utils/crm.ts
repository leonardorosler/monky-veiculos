import { isAxiosError } from 'axios'
import type { Etapa, Origem, Proposta, TipoLead, VeiculoCRM } from '../types/crm'

export const ETAPAS: { valor: Etapa; label: string }[] = [
  { valor: 'NOVO', label: 'Novo' },
  { valor: 'CONTATO', label: 'Contato' },
  { valor: 'QUALIFICADO', label: 'Qualificado' },
  { valor: 'PROPOSTA', label: 'Proposta' },
  { valor: 'NEGOCIACAO', label: 'Negociação' },
  { valor: 'GANHO', label: 'Ganho' },
  { valor: 'PERDIDO', label: 'Perdido' },
]
export const ORIGENS: { valor: Origem; label: string }[] = [
  { valor: 'SITE', label: 'Site' }, { valor: 'WHATSAPP', label: 'WhatsApp' },
  { valor: 'INDICACAO', label: 'Indicação' }, { valor: 'OUTRO', label: 'Outro' },
]
export const TIPOS: { valor: TipoLead; label: string }[] = [
  { valor: 'INTERESSE', label: 'Interesse em veículo' },
  { valor: 'VENDER_CARRO', label: 'Vender carro' },
  { valor: 'FINANCIAMENTO', label: 'Financiamento' },
]
export const STATUS_PROPOSTA = {
  RASCUNHO: 'Rascunho', ENVIADA: 'Envio registrado', ACEITA: 'Aceita',
  RECUSADA: 'Recusada', EXPIRADA: 'Expirada',
}

/** Accepts BRL notation or an ungrouped decimal; never silently drops invalid characters. */
export function parseDinheiro(texto: string): number | null {
  const valor = texto.trim().replace(/^R\$\s*/, '')
  if (!valor) return null
  let normalizado: string
  if (/^\d{1,3}(\.\d{3})+(,\d{1,2})?$/.test(valor)) {
    normalizado = valor.replace(/\./g, '').replace(',', '.')
  } else if (/^\d+([,.]\d{1,2})?$/.test(valor)) {
    normalizado = valor.replace(',', '.')
  } else return null
  const numero = Number(normalizado)
  return Number.isFinite(numero) && numero >= 0 && numero <= 1_000_000_000 ? numero : null
}

export function dinheiro(valor?: number | null): string {
  return valor == null ? 'Não informado' : new Intl.NumberFormat('pt-BR', {
    style: 'currency', currency: 'BRL',
  }).format(Number(valor))
}

export function telefoneValido(telefone: string): boolean {
  if (!/^[\d\s()+.-]+$/.test(telefone)) return false
  const digitos = telefone.replace(/\D/g, '')
  const nacional = digitos.length > 11 && digitos.startsWith('55') ? digitos.slice(2) : digitos
  return /^[1-9]\d[2-9]\d{7,8}$/.test(nacional) && !/^(\d)\1+$/.test(nacional)
}

export function whatsappUrl(telefone: string, texto?: string): string | null {
  if (!telefoneValido(telefone)) return null
  const digitos = telefone.replace(/\D/g, '')
  return `https://wa.me/${digitos.length <= 11 ? `55${digitos}` : digitos}${texto ? `?text=${encodeURIComponent(texto)}` : ''}`
}

/** Round-trip local calendar fields to reject rollover dates and nonexistent local times. */
export function dataLocalISO(texto: string): string | null {
  const match = /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})$/.exec(texto)
  if (!match) return null
  const [ano, mes, dia, hora, minuto] = match.slice(1).map(Number)
  if (ano < 1900 || ano > 2100) return null
  const data = new Date(ano, mes - 1, dia, hora, minuto)
  if (data.getFullYear() !== ano || data.getMonth() !== mes - 1 || data.getDate() !== dia ||
      data.getHours() !== hora || data.getMinutes() !== minuto) return null
  return data.toISOString()
}

export function dataFuturaISO(texto: string, agora = Date.now()): string | null {
  const iso = dataLocalISO(texto)
  return iso && new Date(iso).getTime() > agora ? iso : null
}

export function inputData(iso?: string | null): string {
  if (!iso) return ''
  const data = new Date(iso)
  if (!Number.isFinite(data.getTime())) return ''
  const pad = (n: number) => String(n).padStart(2, '0')
  return `${data.getFullYear()}-${pad(data.getMonth() + 1)}-${pad(data.getDate())}T${pad(data.getHours())}:${pad(data.getMinutes())}`
}

export function dataHora(iso?: string | null): string {
  if (!iso) return 'Não informado'
  const data = new Date(iso)
  return Number.isFinite(data.getTime()) ? data.toLocaleString('pt-BR', { dateStyle: 'short', timeStyle: 'short' }) : 'Data inválida'
}

export function propostaExpirada(proposta: Pick<Proposta, 'status' | 'validadeEm'>, agora = Date.now()): boolean {
  const validade = new Date(proposta.validadeEm).getTime()
  return proposta.status === 'EXPIRADA' || !Number.isFinite(validade) || validade <= agora
}

export function nomeVeiculo(veiculo?: VeiculoCRM | null): string {
  return veiculo ? `${veiculo.marca} ${veiculo.modelo} · ${veiculo.ano}` : 'Sem veículo vinculado'
}

export function resumoProposta(proposta: Proposta): string {
  return [
    `Proposta #${proposta.numero}`, nomeVeiculo(proposta.veiculo),
    `Valor: ${dinheiro(proposta.valor)}`, `Entrada: ${dinheiro(proposta.entrada ?? 0)}`,
    proposta.trocaDescricao ? `Troca: ${proposta.trocaDescricao} (${dinheiro(proposta.trocaValor ?? 0)})` : '',
    `Validade: ${dataHora(proposta.validadeEm)}`, proposta.observacoes ?? '',
  ].filter(Boolean).join('\n')
}

export function erroCRM(erro: unknown, fallback = 'Não foi possível salvar. Tente novamente.'): string {
  if (isAxiosError(erro)) {
    const mensagem = erro.response?.data?.message ?? erro.response?.data?.erro ?? erro.response?.data?.error
    if (typeof mensagem === 'string') return mensagem
    if (Array.isArray(mensagem) && mensagem.every(item => typeof item === 'string')) return mensagem.join(' ')
  }
  return fallback
}
