import { useState, type FormEvent } from 'react'
import { useAuth } from '../../../contexts/AuthContext'
import { useApiResource } from '../../../hooks/useApiResource'
import type { RelatorioComercial } from '../../../types/comercial'
import { ETAPAS, ORIGENS, dinheiro } from '../../../utils/crm'
import { Feedback } from '../../../components/Feedback'
import { FormField } from '../../../components/FormField'
import { Spinner } from '../../../components/Spinner/Spinner'
import { ComercialLayout } from './ComercialLayout'
import styles from './Comercial.module.css'

function periodoInicial() {
  const fim = new Date().toISOString().slice(0, 10)
  return { inicio: `${fim.slice(0, 7)}-01`, fim }
}
const porcentagem = (value: number) => `${value.toLocaleString('pt-BR', { maximumFractionDigits: 2 })}%`

export function Relatorios() {
  const { usuario } = useAuth()
  const [filtros, setFiltros] = useState(periodoInicial)
  const [periodo, setPeriodo] = useState(periodoInicial)
  const [erroPeriodo, setErroPeriodo] = useState('')
  const query = useApiResource<RelatorioComercial>(`/crm/relatorios?${new URLSearchParams(periodo)}`)
  function aplicar(event: FormEvent) {
    event.preventDefault()
    const intervalo = (Date.parse(filtros.fim) - Date.parse(filtros.inicio)) / 86400000
    if (!Number.isFinite(intervalo) || intervalo < 0 || intervalo >= 366) { setErroPeriodo('Escolha um intervalo válido de até 366 dias.'); return }
    setErroPeriodo(''); setPeriodo({ ...filtros })
  }
  const data = query.data
  return <ComercialLayout titulo="Relatórios comerciais" descricao={usuario?.role === 'VENDEDOR' ? 'Indicadores exclusivamente da sua carteira.' : 'Origem, conversão e resultados da equipe.'} acao={<button className="ui-button" disabled={query.carregando} onClick={query.recarregar}>Atualizar</button>}>
    <form className={`${styles.panel} ${styles.form}`} onSubmit={aplicar}><div className={styles.periodo}><FormField id="relatorio-inicio" label="Início (UTC)"><input id="relatorio-inicio" type="date" required aria-invalid={!!erroPeriodo} aria-describedby={erroPeriodo ? 'erro-periodo' : undefined} value={filtros.inicio} onChange={e => setFiltros({ ...filtros, inicio: e.target.value })} /></FormField><FormField id="relatorio-fim" label="Fim (UTC)"><input id="relatorio-fim" type="date" required aria-invalid={!!erroPeriodo} aria-describedby={erroPeriodo ? 'erro-periodo' : undefined} value={filtros.fim} onChange={e => setFiltros({ ...filtros, fim: e.target.value })} /></FormField><button className="ui-button ui-button-primary">Aplicar período</button></div>{erroPeriodo && <div id="erro-periodo"><Feedback mensagem={erroPeriodo} /></div>}</form>
    {query.carregando ? <Spinner /> : query.erro ? <Feedback mensagem={query.erro} onRetry={query.recarregar} /> : data && <>
      <div className={styles.metrics}>{[{ label: 'Oportunidades criadas', value: data.resumo.leads }, { label: 'Ganhos / perdidos da coorte', value: `${data.resumo.ganhos} / ${data.resumo.perdidos}` }, { label: 'Conversão da coorte', value: porcentagem(data.resumo.conversao) }, { label: 'Receita no período', value: dinheiro(data.resumo.receita) }].map(item => <article className={`${styles.panel} ${styles.metric}`} key={item.label}><span>{item.label}</span><strong>{item.value}</strong></article>)}</div>
      <section className={styles.panel}><h2>Como interpretar</h2><p className={styles.hint}>Conversão considera oportunidades criadas entre {data.periodo.inicio} e {data.periodo.fim}, com seu estado atual, inclusive vendas posteriores. Receita considera vendas fechadas no período, mesmo de oportunidades mais antigas. A equipe usa o responsável atual; não representa comissões nem atribuição histórica.</p>{!data.resumo.leads && <p className={styles.empty}>Nenhuma oportunidade criada neste intervalo. Ainda pode haver receita de oportunidades anteriores.</p>}</section>
      <div className={styles.grid}><section className={styles.panel}><h2>Origem dos contatos</h2><div className={styles.tableWrap} tabIndex={0} role="region" aria-label="Tabela de origem dos contatos"><table className={styles.table}><thead><tr><th>Origem</th><th>Leads</th><th>Ganhos</th><th>Conversão</th></tr></thead><tbody>{data.porOrigem.map(item => <tr key={item.origem}><td>{ORIGENS.find(o => o.valor === item.origem)?.label}</td><td>{item.total}</td><td>{item.ganhos}</td><td>{porcentagem(item.conversao)}</td></tr>)}</tbody></table></div></section><section className={styles.panel}><h2>Etapas da coorte</h2><div className={styles.bars}>{data.porEtapa.map(item => <div className={styles.bar} key={item.etapa}><span><b>{ETAPAS.find(e => e.valor === item.etapa)?.label}</b><strong>{item.total}</strong></span><meter min={0} max={Math.max(1, data.resumo.leads)} value={item.total} aria-label={`${item.etapa}: ${item.total} oportunidades`} /></div>)}</div></section></div>
      <section className={styles.panel}><h2>Resultados por responsável</h2>{!data.porVendedor.length ? <p className={styles.empty}>Nenhum resultado neste período.</p> : <div className={styles.tableWrap} tabIndex={0} role="region" aria-label="Tabela de resultados por responsável"><table className={styles.table}><thead><tr><th>Responsável</th><th>Leads</th><th>Ganhos da coorte</th><th>Conversão</th><th>Receita por fechamento</th></tr></thead><tbody>{data.porVendedor.map(item => <tr key={item.id ?? 'sem-responsavel'}><td>{item.nome}</td><td>{item.total}</td><td>{item.ganhos}</td><td>{porcentagem(item.conversao)}</td><td>{dinheiro(item.receita)}</td></tr>)}</tbody></table></div>}</section>
      <section className={styles.panel} style={{ marginTop: 24 }}><h2>Evolução diária</h2><details><summary className="ui-button">Ver dados por dia</summary><div className={styles.tableWrap} tabIndex={0} role="region" aria-label="Tabela de evolução diária"><table className={styles.table}><caption>Ganhos agrupados pela data de criação da oportunidade, não pela data de venda.</caption><thead><tr><th>Data (UTC)</th><th>Criados</th><th>Ganhos atuais</th></tr></thead><tbody>{data.porDia.map(item => <tr key={item.data}><td>{item.data.split('-').reverse().join('/')}</td><td>{item.total}</td><td>{item.ganhos}</td></tr>)}</tbody></table></div></details></section>
    </>}
  </ComercialLayout>
}
