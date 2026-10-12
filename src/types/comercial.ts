import type { Etapa, Origem } from './crm'

export interface Personalizacao {
  nomeExibicao: string | null
  corPrimaria: string | null
  logoUrl: string | null
  mensagemHero: string | null
}
export interface ConfiguracaoComercial {
  distribuicaoAutomatica: boolean
  retornoAutomaticoHoras: number | null
  diasEstoqueAlerta: number
  diasSemContatoAlerta: number
  personalizacao: Personalizacao
}
export interface RelatorioComercial {
  periodo: { inicio: string; fim: string }
  resumo: { leads: number; ganhos: number; perdidos: number; conversao: number; receita: number }
  porOrigem: { origem: Origem; total: number; ganhos: number; conversao: number }[]
  porVendedor: { id: string | null; nome: string; total: number; ganhos: number; receita: number; conversao: number }[]
  porEtapa: { etapa: Etapa; total: number }[]
  porDia: { data: string; total: number; ganhos: number }[]
}
export interface AlertasComerciais {
  estoque: { id: string; marca: string; modelo: string; ano: number; diasEmEstoque: number; motivos: string[] }[]
  atividades: { id: string; nome: string; telefone: string; responsavel: { id: string; nome: string } | null; proximaAtividadeEm: string }[]
  semContato: { id: string; nome: string; criadoEm: string }[]
}
