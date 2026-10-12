import { Link } from 'react-router-dom'
import { useApiResource } from '../../../hooks/useApiResource'
import type { AlertasComerciais } from '../../../types/comercial'
import { dataHora } from '../../../utils/crm'
import { Feedback } from '../../../components/Feedback'
import { Spinner } from '../../../components/Spinner/Spinner'
import { ComercialLayout } from './ComercialLayout'
import styles from './Comercial.module.css'

export function Alertas() {
  const query = useApiResource<AlertasComerciais>('/crm/alertas')
  const data = query.data
  return <ComercialLayout titulo="Alertas e acompanhamento" descricao="Priorize o estoque e os próximos atendimentos." acao={<button className="ui-button" disabled={query.carregando} onClick={query.recarregar}>Atualizar alertas</button>}>
    <p className={styles.hint}>Alertas calculados ao consultar, com até 100 registros por lista. Atividades respeitam sua carteira. Não são notificações externas nem mensagens automáticas.</p>
    {query.carregando ? <Spinner /> : query.erro ? <Feedback mensagem={query.erro} onRetry={query.recarregar} /> : data && <>
      <div className={styles.grid}><section className={styles.panel}><h2>Atividades vencidas ({data.atividades.length})</h2>{!data.atividades.length ? <p className={styles.empty}>Nenhuma atividade vencida.</p> : <ul className={styles.list}>{data.atividades.map(item => <li key={item.id}><Link to={`/admin/leads?lead=${encodeURIComponent(item.id)}`}>{item.nome}</Link><span>{dataHora(item.proximaAtividadeEm)}</span><span className={styles.hint}>{item.telefone} · {item.responsavel?.nome ?? 'Sem responsável'}</span></li>)}</ul>}</section><section className={styles.panel}><h2>Sem acompanhamento recente ({data.semContato.length})</h2>{!data.semContato.length ? <p className={styles.empty}>Nenhuma oportunidade sem acompanhamento recente.</p> : <ul className={styles.list}>{data.semContato.map(item => <li key={item.id}><Link to={`/admin/leads?lead=${encodeURIComponent(item.id)}`}>{item.nome}</Link><span className={styles.hint}>Criada em {dataHora(item.criadoEm)}</span></li>)}</ul>}</section></div>
      <section className={styles.panel}><h2>Estoque antigo ({data.estoque.length})</h2>{!data.estoque.length ? <p className={styles.empty}>Nenhum veículo acima do limiar de estoque.</p> : <ul className={styles.list}>{data.estoque.map(item => <li key={item.id}><Link to={`/admin/estoque?busca=${encodeURIComponent(`${item.modelo}`)}`}>{item.marca} {item.modelo} {item.ano}</Link><strong>{item.diasEmEstoque} dias em estoque</strong><span className={styles.hint}>{item.motivos.join(' · ')}</span><Link to={`/veiculo/${item.id}`}>Ver anúncio</Link></li>)}</ul>}</section>
    </>}
  </ComercialLayout>
}
