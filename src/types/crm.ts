export type Etapa = 'NOVO' | 'CONTATO' | 'QUALIFICADO' | 'PROPOSTA' | 'NEGOCIACAO' | 'GANHO' | 'PERDIDO'
export type Origem = 'SITE' | 'WHATSAPP' | 'INDICACAO' | 'OUTRO'
export type TipoLead = 'INTERESSE' | 'VENDER_CARRO' | 'FINANCIAMENTO'
export type TipoHistorico = 'NOTA' | 'CONTATO' | 'ATIVIDADE'
export type StatusProposta = 'RASCUNHO' | 'ENVIADA' | 'ACEITA' | 'RECUSADA' | 'EXPIRADA'
export type CanalProposta = 'WHATSAPP' | 'EMAIL' | 'MANUAL'

export interface UsuarioCRM {
  id: string
  nome: string
  role: 'ADMIN' | 'VENDEDOR'
}

export interface VeiculoCRM {
  id: string
  marca: string
  modelo: string
  ano: number
  preco: number
}

export interface HistoricoCRM {
  id: string
  tipo: string
  descricao: string
  criadoEm: string
  autor?: Pick<UsuarioCRM, 'id' | 'nome'> | null
}

export interface Proposta {
  id: string
  numero: string | number
  status: StatusProposta
  valor: number
  entrada?: number | null
  trocaDescricao?: string | null
  trocaValor?: number | null
  observacoes?: string | null
  validadeEm: string
  criadoEm: string
  veiculo?: VeiculoCRM | null
  leadId: string
  veiculoId: string
  canal?: CanalProposta | null
  compartilhadaEm?: string | null
  envioEmailStatus?: 'PENDENTE' | 'ENVIADO' | 'FALHOU' | null
}

export interface LeadCRM {
  id: string
  nome: string
  telefone: string
  email?: string | null
  tipo: TipoLead
  dados?: Record<string, unknown> | null
  lido?: boolean
  criadoEm: string
  responsavelId?: string | null
  responsavel?: UsuarioCRM | null
  veiculoId?: string | null
  veiculo?: VeiculoCRM | null
  etapa: Etapa
  origem: Origem
  ultimoContatoEm?: string | null
  proximaAtividadeEm?: string | null
  motivoPerda?: string | null
  valorVenda?: number | null
  fechadoEm?: string | null
}

export interface LeadDetalhe extends LeadCRM {
  historico: HistoricoCRM[]
  propostas: Proposta[]
}

export interface PaginaLeads {
  items: LeadCRM[]
  total: number
  page: number
  pageSize: number
  etapas: Record<Etapa, number>
}

export interface NovoLead {
  nome: string
  telefone: string
  email?: string
  tipo: TipoLead
  origem: Origem
  veiculoId?: string
  dados?: Record<string, unknown>
}

export interface AtualizarLead {
  nome?: string
  telefone?: string
  email?: string | null
  etapa?: Etapa
  responsavelId?: string | null
  veiculoId?: string | null
  proximaAtividadeEm?: string | null
  motivoPerda?: string
  valorVenda?: number
}

export interface NovaProposta {
  veiculoId: string
  valor: number
  entrada?: number
  trocaDescricao?: string
  trocaValor?: number
  observacoes?: string
  validadeEm: string
}
