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