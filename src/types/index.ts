export interface Tenant {
  id: string
  nome: string
  slug: string
  whatsapp?: string
}

export interface Usuario {
  id: string
  nome: string
  email: string
  role: 'ADMIN' | 'VENDEDOR'
  criadoEm?: string
  ativo?: boolean
}

export interface Foto {
  id: string
  url: string
  ordem: number
  capa: boolean
}

export interface Veiculo {
  id: string
  marca: string
  modelo: string
  ano: number
  preco: number
  km: number
  combustivel: 'GASOLINA' | 'ETANOL' | 'FLEX' | 'DIESEL' | 'ELETRICO' | 'HIBRIDO'
  cambio: 'MANUAL' | 'AUTOMATICO' | 'CVT'
  cor: string
  descricao?: string
  categoria?: string | null
  opcionais?: string[]
  destaque: boolean
  vendido: boolean
  fotos: Foto[]
  criadoEm: string
}

export interface Dashboard {
  total: number
  ativos: number
  vendidos: number
  destaques: number
}

export interface AuthResponse {
  token: string
  usuario: Usuario
}

export type PlanoNome = 'BASICO' | 'PROFISSIONAL' | 'PREMIUM'

export type RecursoPlano =
  | 'SITE_CATALOGO'
  | 'WHATSAPP_ANUNCIOS'
  | 'GESTAO_ESTOQUE'
  | 'LEADS'
  | 'FUNIL_ATENDIMENTO'
  | 'PROPOSTAS'
  | 'AVALIACAO_TROCA'
  | 'DISTRIBUICAO_LEADS'
  | 'GESTAO_VENDEDORES'
  | 'RELATORIOS_CONVERSAO'
  | 'PERSONALIZACAO_AVANCADA'
  | 'AUTOMACOES_COMERCIAIS'

export interface PlanoPublico {
  plano: PlanoNome
  nome: string
  recursos: Record<RecursoPlano, {
    incluido: boolean
    implementado: boolean
  }>
}

export interface PlanoAdministrativo extends PlanoPublico {
  limites: {
    veiculos: number | null
    usuarios: number | null
  }
  uso: {
    veiculos: number
    usuarios: number
  }
}
