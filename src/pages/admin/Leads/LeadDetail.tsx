import { useEffect, useState, type FormEvent } from 'react'
import { Download, MessageCircle, Mail, Plus, Pencil } from 'lucide-react'
import api from '../../../api/axios'
import { Modal } from '../../../components/Modal'
import { Spinner } from '../../../components/Spinner/Spinner'
import { Feedback } from '../../../components/Feedback'
import { FormField } from '../../../components/FormField'
import type { AtualizarLead, CanalProposta, Etapa, LeadDetalhe, NovaProposta, Proposta, TipoHistorico, UsuarioCRM, VeiculoCRM } from '../../../types/crm'
import { dataFuturaISO, dataHora, dinheiro, erroCRM, ETAPAS, inputData, nomeVeiculo, ORIGENS, parseDinheiro, propostaExpirada, resumoProposta, STATUS_PROPOSTA, TIPOS, whatsappUrl } from '../../../utils/crm'
import { LeadForm } from './LeadForm'
import { ProposalForm } from './ProposalForm'
import { useCrmMutation } from './useCrmMutation'
import styles from './Leads.module.css'
import { useAuth } from '../../../contexts/AuthContext'

type Props = {
  id: string
  usuarios: UsuarioCRM[]
  veiculos: VeiculoCRM[]
  funil: boolean
  propostas: boolean
  podeAtribuir: boolean
  carregandoOpcoes: boolean
  erroOpcoes: string
  onRetryOpcoes: () => void
  onClose: () => void
  onChange: () => void
}
type Decisao = { proposta: Proposta; status: 'ENVIADA' | 'ACEITA' | 'RECUSADA' }

export function LeadDetail({ id, usuarios, veiculos, funil, propostas, podeAtribuir, carregandoOpcoes, erroOpcoes, onRetryOpcoes, onClose, onChange }: Props) {
  const { usuario } = useAuth()
  const [versao, setVersao] = useState(0)
  const [snapshot, setSnapshot] = useState<{ versao: number; lead?: LeadDetalhe; erro?: string } | null>(null)
  const [painel, setPainel] = useState<'contato' | 'gestao' | 'historico' | 'proposta' | null>(null)
  const [encerramento, setEncerramento] = useState<'GANHO' | 'PERDIDO' | null>(null)
  const [decisao, setDecisao] = useState<Decisao | null>(null)
  const [etapaEscolhida, setEtapaEscolhida] = useState<Etapa | ''>('')
  const [agora, setAgora] = useState(Date.now)
  const mutation = useCrmMutation()

  useEffect(() => {
    const controller = new AbortController()
    api.get<LeadDetalhe>(`/crm/leads/${encodeURIComponent(id)}`, { signal: controller.signal })
      .then(({ data }) => { if (!controller.signal.aborted) setSnapshot({ versao, lead: data }) })
      .catch(error => { if (!controller.signal.aborted) setSnapshot({ versao, erro: erroCRM(error, 'Não foi possível carregar este lead.') }) })
    return () => controller.abort()
  }, [id, versao])

  useEffect(() => {
    const timer = window.setInterval(() => setAgora(Date.now()), 30_000)
    return () => window.clearInterval(timer)
  }, [])

  const carregando = snapshot?.versao !== versao
  const lead = carregando ? undefined : snapshot?.lead
  const encerrado = lead?.etapa === 'GANHO' || lead?.etapa === 'PERDIDO'
  const close = () => { if (!mutation.ocupado) onClose() }

  function atualizar() {
    setPainel(null)
    setEncerramento(null)
    setDecisao(null)
    setEtapaEscolhida('')
    setVersao(v => v + 1)
    onChange()
  }

  async function patch(dados: AtualizarLead, mensagem = 'Lead atualizado.') {
    const ok = await mutation.executar(async () => {
      await api.patch(`/crm/leads/${encodeURIComponent(id)}`, dados)
    }, mensagem)
    if (ok) atualizar()
  }

  async function mudarEtapa() {
    if (!etapaEscolhida || etapaEscolhida === lead?.etapa) return
    if (etapaEscolhida === 'GANHO' || etapaEscolhida === 'PERDIDO') setEncerramento(etapaEscolhida)
    else await patch({ etapa: etapaEscolhida }, 'Etapa atualizada.')
  }

  async function criarProposta(dados: NovaProposta) {
    const ok = await mutation.executar(async () => {
      await api.post(`/crm/leads/${encodeURIComponent(id)}/propostas`, dados)
    }, 'Proposta criada como rascunho.')
    if (ok) atualizar()
  }

  async function registrarHistorico(dados: { tipo: TipoHistorico; descricao: string; proximaAtividadeEm?: string }) {
    const ok = await mutation.executar(async () => {
      await api.post(`/crm/leads/${encodeURIComponent(id)}/historico`, dados)
    }, 'Registro salvo no histórico.')
    if (ok) atualizar()
  }

  async function confirmarProposta(canal: CanalProposta) {
    if (!decisao) return
    const { proposta, status } = decisao
    const ok = await mutation.executar(async () => {
      await api.patch(`/crm/propostas/${encodeURIComponent(proposta.id)}`, { status, ...(status === 'ENVIADA' ? { canal } : {}) })
    }, status === 'ENVIADA' ? 'O operador registrou o envio da proposta. Consulte o histórico para detalhes.' : 'Status da proposta atualizado.')
    if (ok) atualizar()
    else {
      // Email failures can occur after the commercial record has committed.
      setVersao(value => value + 1)
      onChange()
    }
  }

  async function baixar(proposta: Proposta) {
    await mutation.executar(async () => {
      const { data } = await api.get<Blob>(`/crm/propostas/${encodeURIComponent(proposta.id)}/documento`, { responseType: 'blob' })
      const url = URL.createObjectURL(data)
      const link = document.createElement('a')
      link.href = url
      link.download = `proposta-${String(proposta.numero).replace(/[^a-zA-Z0-9_-]/g, '-')}.html`
      document.body.appendChild(link)
      link.click()
      link.remove()
      window.setTimeout(() => URL.revokeObjectURL(url), 30_000)
    }, 'Documento baixado. Abra o HTML para imprimir ou salvar como PDF e compartilhar.')
  }

  const wa = lead ? whatsappUrl(lead.telefone) : null
  return <Modal titulo={lead ? lead.nome : 'Detalhes do lead'} ampla onClose={close}>
    <div className={styles.detail} aria-busy={carregando || mutation.ocupado}>
      {!painel && !encerramento && !decisao && mutation.erro && <Feedback mensagem={mutation.erro} />}
      {mutation.sucesso && <Feedback mensagem={mutation.sucesso} tipo="sucesso" />}
      {carregando ? <Spinner /> : snapshot?.erro ? <Feedback mensagem={snapshot.erro} onRetry={() => setVersao(v => v + 1)} /> : lead && <>
        <div className={styles.detailSummary}>
          <div className={styles.chips}>
            <span className={styles.stage} data-stage={lead.etapa}>{ETAPAS.find(e => e.valor === lead.etapa)?.label ?? lead.etapa}</span>
            <span className={styles.chip}>{TIPOS.find(t => t.valor === lead.tipo)?.label ?? lead.tipo}</span>
            <span className={styles.chip}>{ORIGENS.find(o => o.valor === lead.origem)?.label ?? lead.origem}</span>
          </div>
          <p>{lead.telefone}{lead.email ? ` · ${lead.email}` : ''}</p>
          <div className={styles.actions}>
            {wa && <a className="ui-button" href={wa} target="_blank" rel="noreferrer"><MessageCircle size={18} aria-hidden="true" />WhatsApp</a>}
            {lead.email && <a className="ui-button" href={`mailto:${lead.email}`}><Mail size={18} aria-hidden="true" />E-mail</a>}
            {!encerrado && <button className="ui-button" disabled={mutation.ocupado} onClick={() => setPainel('contato')}><Pencil size={18} aria-hidden="true" />Editar contato</button>}
          </div>
          <p className={styles.hint}>Abrir um canal não registra contato nem confirma entrega. Registre a interação no histórico.</p>
        </div>

        <div className={styles.detailGrid}>
          <section className={styles.section} aria-labelledby="crm-negociacao">
            <div className={styles.sectionHeader}><h3 id="crm-negociacao">Negociação</h3>{!encerrado && <button className="ui-button" onClick={() => setPainel('gestao')} disabled={mutation.ocupado}>Editar</button>}</div>
            {!encerrado && !lead.responsavelId && usuario?.role === 'ADMIN' && <button className="ui-button" disabled={mutation.ocupado} onClick={() => void patch({ responsavelId: usuario.id }, 'Oportunidade atribuída a você.')}>Assumir atendimento</button>}
            {encerrado && <p className={styles.hint}>Oportunidade encerrada. O histórico é preservado e ainda permite notas internas.</p>}
            <dl className={styles.facts}>
              <div><dt>Responsável</dt><dd>{lead.responsavel?.nome ?? 'Não atribuído'}</dd></div>
              <div><dt>Veículo</dt><dd>{nomeVeiculo(lead.veiculo)}</dd></div>
              <div><dt>Criado em</dt><dd>{dataHora(lead.criadoEm)}</dd></div>
              <div><dt>Último contato</dt><dd>{dataHora(lead.ultimoContatoEm)}</dd></div>
              <div><dt>Próxima atividade</dt><dd className={lead.proximaAtividadeEm && new Date(lead.proximaAtividadeEm).getTime() < agora ? styles.overdue : ''}>{dataHora(lead.proximaAtividadeEm)}{lead.proximaAtividadeEm && new Date(lead.proximaAtividadeEm).getTime() < agora ? ' · Atrasada' : ''}</dd></div>
              {lead.etapa === 'GANHO' && <div><dt>Valor de venda</dt><dd>{dinheiro(lead.valorVenda)}</dd></div>}
              {lead.etapa === 'PERDIDO' && <div><dt>Motivo da perda</dt><dd>{lead.motivoPerda}</dd></div>}
            </dl>
            {funil && !encerrado && <div className={styles.stageControl}>
              <FormField id="crm-mudar-etapa" label="Mover para etapa"><select id="crm-mudar-etapa" value={etapaEscolhida || lead.etapa} disabled={mutation.ocupado} onChange={e => setEtapaEscolhida(e.target.value as Etapa)}>{ETAPAS.map(e => <option key={e.valor} value={e.valor}>{e.label}</option>)}</select></FormField>
              <button className="ui-button ui-button-primary" disabled={mutation.ocupado || !etapaEscolhida || etapaEscolhida === lead.etapa} onClick={() => void mudarEtapa()}>Aplicar etapa</button>
            </div>}
            {!funil && <p className={styles.hint}>Funil e atividades disponíveis nos planos com Funil de atendimento.</p>}
          </section>

          <section className={styles.section} aria-labelledby="crm-dados">
            <h3 id="crm-dados">Dados recebidos</h3>
            {lead.dados && Object.keys(lead.dados).length ? <dl className={styles.facts}>{Object.entries(lead.dados).map(([chave, valor]) => <div key={chave}><dt>{chave.replace(/([A-Z])/g, ' $1').replace(/_/g, ' ')}</dt><dd>{valor == null || valor === '' ? 'Não informado' : typeof valor === 'object' ? JSON.stringify(valor) : String(valor)}</dd></div>)}</dl> : <p className={styles.hint}>Nenhum dado adicional recebido.</p>}
          </section>
        </div>

        {funil && <section className={styles.section} aria-labelledby="crm-historico">
          <div className={styles.sectionHeader}><h3 id="crm-historico">Histórico e atividades</h3><button className="ui-button" disabled={mutation.ocupado} onClick={() => setPainel('historico')}><Plus size={18} aria-hidden="true" />Adicionar registro</button></div>
          {lead.historico?.length ? <ol className={styles.timeline}>{[...lead.historico].sort((a, b) => new Date(b.criadoEm).getTime() - new Date(a.criadoEm).getTime()).map(item => <li key={item.id}>
            <div className={styles.timelineMeta}><strong>{({ NOTA: 'Nota', CONTATO: 'Contato', ATIVIDADE: 'Atividade' } as Record<string, string>)[item.tipo] ?? item.tipo.replace(/_/g, ' ')}</strong><span>{dataHora(item.criadoEm)} · {item.autor?.nome ?? 'Sistema'}</span></div>
            <p className={styles.prewrap}>{item.descricao}</p>
          </li>)}</ol> : <p className={styles.hint}>Nenhuma interação registrada.</p>}
        </section>}

        <section className={styles.section} aria-labelledby="crm-propostas">
          <div className={styles.sectionHeader}><h3 id="crm-propostas">Propostas comerciais</h3>{propostas && !encerrado && <button className="ui-button ui-button-primary" disabled={mutation.ocupado || carregandoOpcoes || Boolean(erroOpcoes)} onClick={() => setPainel('proposta')}><Plus size={18} aria-hidden="true" />Nova proposta</button>}</div>
          {carregandoOpcoes && <p className={styles.hint} role="status">Carregando veículos e responsáveis…</p>}
          {erroOpcoes && <Feedback mensagem={erroOpcoes} onRetry={onRetryOpcoes} />}
          {!propostas ? <p className={styles.hint}>Disponível nos planos com Propostas comerciais.</p> : lead.propostas?.length ? <div className={styles.proposalList}>{lead.propostas.map(proposta => {
            const expirada = propostaExpirada(proposta, agora)
            const encerrada = proposta.status === 'ACEITA' || proposta.status === 'RECUSADA'
            const waProposta = whatsappUrl(lead.telefone, resumoProposta(proposta))
            return <article key={proposta.id} className={styles.proposal}>
              <div className={styles.sectionHeader}><h4>Proposta #{proposta.numero}</h4><span className={styles.stage} data-stage={proposta.status === 'ACEITA' ? 'GANHO' : proposta.status === 'RECUSADA' || expirada ? 'PERDIDO' : 'PROPOSTA'}>{expirada && !encerrada ? 'Expirada' : STATUS_PROPOSTA[proposta.status]}</span></div>
              <p>{nomeVeiculo(proposta.veiculo)}</p><p className={styles.proposalValue}>{dinheiro(proposta.valor)}</p>
              <dl className={styles.facts}><div><dt>Entrada</dt><dd>{dinheiro(proposta.entrada ?? 0)}</dd></div>{proposta.trocaDescricao && <div><dt>Troca</dt><dd>{proposta.trocaDescricao} · {dinheiro(proposta.trocaValor ?? 0)}</dd></div>}<div><dt>Validade</dt><dd>{dataHora(proposta.validadeEm)}</dd></div></dl>
              {proposta.observacoes && <p className={styles.prewrap}>{proposta.observacoes}</p>}
              <div className={styles.actions}>
                <button className="ui-button" disabled={mutation.ocupado} onClick={() => void baixar(proposta)}><Download size={18} aria-hidden="true" />Baixar / imprimir</button>
                {waProposta && <a href={waProposta} target="_blank" rel="noreferrer" className="ui-button"><MessageCircle size={18} aria-hidden="true" />Resumo no WhatsApp</a>}
                {!encerrada && !encerrado && <>
                  {(proposta.status === 'RASCUNHO' || proposta.envioEmailStatus === 'FALHOU' || proposta.envioEmailStatus === 'PENDENTE') && <button className="ui-button" disabled={mutation.ocupado || expirada} onClick={() => setDecisao({ proposta, status: 'ENVIADA' })}>{proposta.envioEmailStatus === 'FALHOU' ? 'Tentar e-mail novamente' : proposta.envioEmailStatus === 'PENDENTE' ? 'Recuperar envio de e-mail' : 'Registrar envio'}</button>}
                  <button className="ui-button" disabled={mutation.ocupado || expirada} onClick={() => setDecisao({ proposta, status: 'ACEITA' })}>Registrar aceite</button>
                  <button className="ui-button" disabled={mutation.ocupado || expirada} onClick={() => setDecisao({ proposta, status: 'RECUSADA' })}>Registrar recusa</button>
                </>}
              </div>
              {proposta.compartilhadaEm && <p className={styles.hint}>Compartilhamento: {proposta.canal} · {dataHora(proposta.compartilhadaEm)}. {proposta.envioEmailStatus === 'FALHOU' ? 'E-mail falhou; nova tentativa disponível.' : proposta.envioEmailStatus === 'PENDENTE' ? 'E-mail pendente. Recuperação disponível após 5 minutos.' : proposta.envioEmailStatus === 'ENVIADO' ? 'E-mail aceito pelo provedor; entrega não confirmada.' : 'Registro realizado pelo operador; entrega não confirmada.'}</p>}
              <p className={styles.hint}>O resumo contém a referência da proposta. Para compartilhar o documento, baixe o arquivo. O envio só entra no histórico ao registrá-lo explicitamente.</p>
            </article>
          })}</div> : <p className={styles.hint}>Nenhuma proposta criada para este lead.</p>}
        </section>

        {painel === 'contato' && <Modal titulo="Editar contato" onClose={() => { if (!mutation.ocupado) setPainel(null) }}><div className={styles.detail}><LeadForm lead={lead} veiculos={veiculos} ocupado={mutation.ocupado} erro={mutation.erro} onCancel={() => setPainel(null)} onSubmit={dados => patch(dados, 'Contato atualizado.')} /></div></Modal>}
        {painel === 'gestao' && <Modal titulo="Editar negociação" onClose={() => { if (!mutation.ocupado) setPainel(null) }}><div className={styles.detail}><ManagementForm lead={lead} usuarios={usuarios} veiculos={veiculos} funil={funil} podeAtribuir={podeAtribuir} ocupado={mutation.ocupado} erro={mutation.erro} carregandoOpcoes={carregandoOpcoes} erroOpcoes={erroOpcoes} onRetryOpcoes={onRetryOpcoes} onCancel={() => setPainel(null)} onSubmit={patch} /></div></Modal>}
        {painel === 'historico' && <Modal titulo="Registrar interação / atividade" onClose={() => { if (!mutation.ocupado) setPainel(null) }}><div className={styles.detail}><HistoryForm encerrado={encerrado} ocupado={mutation.ocupado} erro={mutation.erro} onCancel={() => setPainel(null)} onSubmit={registrarHistorico} /></div></Modal>}
        {painel === 'proposta' && <Modal titulo="Nova proposta comercial" onClose={() => { if (!mutation.ocupado) setPainel(null) }}><div className={styles.detail}><ProposalForm veiculos={veiculos} veiculoInicial={lead.veiculoId} ocupado={mutation.ocupado} erro={mutation.erro} onCancel={() => setPainel(null)} onSubmit={criarProposta} /></div></Modal>}
        {encerramento && <Modal titulo={encerramento === 'GANHO' ? 'Confirmar venda ganha' : 'Confirmar negociação perdida'} onClose={() => { if (!mutation.ocupado) setEncerramento(null) }}><div className={styles.detail}><ClosingForm etapa={encerramento} lead={lead} veiculos={veiculos} ocupado={mutation.ocupado} erro={mutation.erro} onCancel={() => setEncerramento(null)} onSubmit={dados => patch(dados, encerramento === 'GANHO' ? 'Venda registrada como ganha.' : 'Negociação encerrada como perdida.')} /></div></Modal>}
        {decisao && <Modal titulo={`${decisao.status === 'ENVIADA' ? 'Registrar envio' : decisao.status === 'ACEITA' ? 'Confirmar aceite' : 'Confirmar recusa'} · #${decisao.proposta.numero}`} onClose={() => { if (!mutation.ocupado) setDecisao(null) }}><div className={styles.detail}><ProposalDecision decisao={decisao} ocupado={mutation.ocupado} erro={mutation.erro} onCancel={() => setDecisao(null)} onSubmit={confirmarProposta} /></div></Modal>}
      </>}
    </div>
  </Modal>
}

function ManagementForm({ lead, usuarios, veiculos, funil, podeAtribuir, ocupado, erro, carregandoOpcoes, erroOpcoes, onRetryOpcoes, onCancel, onSubmit }: {
  lead: LeadDetalhe; usuarios: UsuarioCRM[]; veiculos: VeiculoCRM[]; funil: boolean; podeAtribuir: boolean; ocupado: boolean; erro: string; carregandoOpcoes: boolean; erroOpcoes: string
  onRetryOpcoes: () => void; onCancel: () => void; onSubmit: (dados: AtualizarLead) => Promise<void>
}) {
  const [responsavelId, setResponsavelId] = useState(lead.responsavelId ?? '')
  const [veiculoId, setVeiculoId] = useState(lead.veiculoId ?? '')
  const [atividade, setAtividade] = useState(inputData(lead.proximaAtividadeEm))
  const [erroData, setErroData] = useState('')
  const [erroVeiculo, setErroVeiculo] = useState('')
  async function submit(event: FormEvent) {
    event.preventDefault()
    if (ocupado) return
    const dados: AtualizarLead = {}
    if (podeAtribuir && responsavelId !== (lead.responsavelId ?? '')) dados.responsavelId = responsavelId || null
    if (veiculoId !== (lead.veiculoId ?? '')) dados.veiculoId = veiculoId || null
    if (lead.etapa === 'GANHO' && !veiculoId) {
      setErroVeiculo('Uma venda ganha precisa manter um veículo vinculado.')
      document.getElementById('gestao-veiculo')?.focus(); return
    }
    setErroVeiculo('')
    if (funil && atividade !== inputData(lead.proximaAtividadeEm)) {
      const iso = atividade ? dataFuturaISO(atividade) : null
      if (atividade && !iso) { setErroData('Escolha uma data e hora válidas no futuro.'); document.getElementById('gestao-atividade')?.focus(); return }
      dados.proximaAtividadeEm = iso
    }
    setErroData('')
    await onSubmit(dados)
  }
  const todosVeiculos = lead.veiculo && !veiculos.some(v => v.id === lead.veiculo?.id) ? [lead.veiculo, ...veiculos] : veiculos
  const todosUsuarios = lead.responsavel && !usuarios.some(u => u.id === lead.responsavel?.id) ? [lead.responsavel, ...usuarios] : usuarios
  return <form className={styles.form} onSubmit={submit} noValidate>
    {erro && <Feedback mensagem={erro} />}{carregandoOpcoes && <p className={styles.hint} role="status">Carregando veículos e responsáveis…</p>}{erroOpcoes && <Feedback mensagem={erroOpcoes} onRetry={onRetryOpcoes} />}
    <fieldset className={styles.fieldset} disabled={ocupado}>
      {podeAtribuir ? <FormField id="gestao-responsavel" label="Responsável"><select id="gestao-responsavel" value={responsavelId} disabled={carregandoOpcoes || Boolean(erroOpcoes)} onChange={e => setResponsavelId(e.target.value)}><option value="">Não atribuído</option>{lead.responsavelId && !todosUsuarios.some(u => u.id === lead.responsavelId) && <option value={lead.responsavelId}>Responsável atual</option>}{todosUsuarios.map(u => <option key={u.id} value={u.id}>{u.nome}</option>)}</select></FormField> : <p className={styles.hint}>A atribuição a outros usuários é exclusiva de administradores com Distribuição de leads.</p>}
      <FormField id="gestao-veiculo" label="Veículo de interesse" erro={erroVeiculo}><select id="gestao-veiculo" value={veiculoId} disabled={carregandoOpcoes || Boolean(erroOpcoes)} onChange={e => setVeiculoId(e.target.value)} aria-invalid={Boolean(erroVeiculo)} aria-describedby={erroVeiculo ? 'gestao-veiculo-erro' : undefined}><option value="">Sem veículo</option>{lead.veiculoId && !todosVeiculos.some(v => v.id === lead.veiculoId) && <option value={lead.veiculoId}>Veículo vinculado (indisponível)</option>}{todosVeiculos.map(v => <option key={v.id} value={v.id}>{nomeVeiculo(v)}</option>)}</select></FormField>
      {funil && <FormField id="gestao-atividade" label="Próxima atividade (horário local)" erro={erroData}><input id="gestao-atividade" type="datetime-local" value={atividade} onChange={e => setAtividade(e.target.value)} aria-invalid={Boolean(erroData)} aria-describedby={erroData ? 'gestao-atividade-erro' : undefined} /><p className={styles.hint}>Deixe em branco para remover o agendamento.</p></FormField>}
    </fieldset>
    <div className={styles.actions}><button className="ui-button" type="button" disabled={ocupado} onClick={onCancel}>Cancelar</button><button className="ui-button ui-button-primary" disabled={ocupado}>{ocupado ? 'Salvando…' : 'Salvar negociação'}</button></div>
  </form>
}

function HistoryForm({ encerrado, ocupado, erro, onCancel, onSubmit }: { encerrado: boolean; ocupado: boolean; erro: string; onCancel: () => void; onSubmit: (dados: { tipo: TipoHistorico; descricao: string; proximaAtividadeEm?: string }) => Promise<void> }) {
  const [tipo, setTipo] = useState<TipoHistorico>('NOTA')
  const [descricao, setDescricao] = useState('')
  const [atividade, setAtividade] = useState('')
  const [errors, setErrors] = useState<Record<string, string>>({})
  async function submit(event: FormEvent) {
    event.preventDefault()
    if (ocupado) return
    const next: Record<string, string> = {}
    if (!descricao.trim()) next.descricao = 'Descreva a interação ou a atividade.'
    const iso = atividade ? dataFuturaISO(atividade) : null
    if ((tipo === 'ATIVIDADE' || atividade) && !iso) next.atividade = 'Escolha uma data e hora válidas no futuro.'
    setErrors(next)
    if (Object.keys(next).length) { document.getElementById(`historico-${Object.keys(next)[0]}`)?.focus(); return }
    await onSubmit({ tipo, descricao: descricao.trim(), ...(iso ? { proximaAtividadeEm: iso } : {}) })
  }
  return <form className={styles.form} onSubmit={submit} noValidate>
    {erro && <Feedback mensagem={erro} />}
    <fieldset className={styles.fieldset} disabled={ocupado}>
      <FormField id="historico-tipo" label="Tipo de registro"><select id="historico-tipo" value={tipo} disabled={encerrado} onChange={e => setTipo(e.target.value as TipoHistorico)}><option value="NOTA">Nota interna</option>{!encerrado && <><option value="CONTATO">Contato realizado</option><option value="ATIVIDADE">Agendar atividade</option></>}</select></FormField>
      <FormField id="historico-descricao" label="Descrição *" erro={errors.descricao}><textarea id="historico-descricao" value={descricao} rows={4} maxLength={4000} autoFocus onChange={e => setDescricao(e.target.value)} required aria-invalid={Boolean(errors.descricao)} aria-describedby={errors.descricao ? 'historico-descricao-erro' : undefined} /></FormField>
      {!encerrado && <FormField id="historico-atividade" label={`Próxima atividade (horário local)${tipo === 'ATIVIDADE' ? ' *' : ''}`} erro={errors.atividade}><input id="historico-atividade" type="datetime-local" value={atividade} onChange={e => setAtividade(e.target.value)} required={tipo === 'ATIVIDADE'} aria-invalid={Boolean(errors.atividade)} aria-describedby={errors.atividade ? 'historico-atividade-erro' : undefined} /></FormField>}
      <p className={styles.hint}>{tipo === 'CONTATO' ? 'Registre somente interações realmente realizadas. Este registro atualiza o último contato.' : 'O agendamento organiza o próximo atendimento; não envia mensagens automaticamente.'}</p>
    </fieldset>
    <div className={styles.actions}><button type="button" className="ui-button" disabled={ocupado} onClick={onCancel}>Cancelar</button><button className="ui-button ui-button-primary" disabled={ocupado}>{ocupado ? 'Salvando…' : 'Salvar registro'}</button></div>
  </form>
}

function ClosingForm({ etapa, lead, veiculos, ocupado, erro, onCancel, onSubmit }: { etapa: 'GANHO' | 'PERDIDO'; lead: LeadDetalhe; veiculos: VeiculoCRM[]; ocupado: boolean; erro: string; onCancel: () => void; onSubmit: (dados: AtualizarLead) => Promise<void> }) {
  const [veiculoId, setVeiculoId] = useState(lead.veiculoId ?? '')
  const [valor, setValor] = useState(lead.valorVenda ? String(lead.valorVenda).replace('.', ',') : '')
  const [motivo, setMotivo] = useState(lead.motivoPerda ?? '')
  const [errors, setErrors] = useState<Record<string, string>>({})
  const options = lead.veiculo && !veiculos.some(v => v.id === lead.veiculo?.id) ? [lead.veiculo, ...veiculos] : veiculos
  async function submit(event: FormEvent) {
    event.preventDefault()
    if (ocupado) return
    const next: Record<string, string> = {}
    const venda = parseDinheiro(valor)
    if (etapa === 'GANHO') {
      if (!veiculoId) next.veiculo = 'Selecione o veículo vendido.'
      if (venda === null || venda <= 0) next.valor = 'Informe o valor real da venda, maior que zero.'
    } else if (!motivo.trim()) next.motivo = 'Informe o motivo da perda.'
    setErrors(next)
    if (Object.keys(next).length) { document.getElementById(`encerrar-${Object.keys(next)[0]}`)?.focus(); return }
    await onSubmit(etapa === 'GANHO' ? { etapa, veiculoId, valorVenda: venda! } : { etapa, motivoPerda: motivo.trim() })
  }
  return <form className={styles.form} onSubmit={submit} noValidate>
    {erro && <Feedback mensagem={erro} />}
    <p>{etapa === 'GANHO' ? 'Confirme o veículo e o valor efetivamente vendido para encerrar esta negociação como ganha.' : 'O motivo será salvo no histórico da negociação.'}</p>
    <fieldset className={styles.fieldset} disabled={ocupado}>
      {etapa === 'GANHO' ? <>
        <FormField id="encerrar-veiculo" label="Veículo vendido *" erro={errors.veiculo}><select id="encerrar-veiculo" value={veiculoId} onChange={e => setVeiculoId(e.target.value)} required aria-invalid={Boolean(errors.veiculo)} aria-describedby={errors.veiculo ? 'encerrar-veiculo-erro' : undefined}><option value="">Selecione</option>{lead.veiculoId && !options.some(v => v.id === lead.veiculoId) && <option value={lead.veiculoId}>Veículo vinculado (indisponível)</option>}{options.map(v => <option key={v.id} value={v.id}>{nomeVeiculo(v)}</option>)}</select></FormField>
        <FormField id="encerrar-valor" label="Valor de venda (R$) *" erro={errors.valor}><input id="encerrar-valor" inputMode="decimal" value={valor} onChange={e => setValor(e.target.value)} required aria-invalid={Boolean(errors.valor)} aria-describedby={errors.valor ? 'encerrar-valor-erro' : undefined} /></FormField>
      </> : <FormField id="encerrar-motivo" label="Motivo da perda *" erro={errors.motivo}><textarea id="encerrar-motivo" value={motivo} maxLength={2000} rows={4} onChange={e => setMotivo(e.target.value)} required aria-invalid={Boolean(errors.motivo)} aria-describedby={errors.motivo ? 'encerrar-motivo-erro' : undefined} /></FormField>}
    </fieldset>
    <div className={styles.actions}><button type="button" className="ui-button" disabled={ocupado} onClick={onCancel}>Cancelar</button><button className="ui-button ui-button-primary" disabled={ocupado}>{ocupado ? 'Encerrando…' : etapa === 'GANHO' ? 'Confirmar venda ganha' : 'Confirmar perda'}</button></div>
  </form>
}

function ProposalDecision({ decisao, ocupado, erro, onCancel, onSubmit }: { decisao: Decisao; ocupado: boolean; erro: string; onCancel: () => void; onSubmit: (canal: CanalProposta) => Promise<void> }) {
  const [canal, setCanal] = useState<CanalProposta>(decisao.proposta.envioEmailStatus ? 'EMAIL' : 'WHATSAPP')
  const [erroValidade, setErroValidade] = useState('')
  async function submit(event: FormEvent) {
    event.preventDefault()
    if (ocupado) return
    if (propostaExpirada(decisao.proposta)) { setErroValidade('Esta proposta expirou. Crie uma nova proposta com validade futura.'); return }
    await onSubmit(canal)
  }
  return <form className={styles.form} onSubmit={submit}>
    {erro && <Feedback mensagem={erro} />}{erroValidade && <Feedback mensagem={erroValidade} />}
    {decisao.status === 'ENVIADA' ? <>
      <p>Confirme somente após realizar o envio. O registro manual informa que o operador enviou a proposta; não comprova entrega ao cliente.</p>
      <FormField id="proposta-canal" label="Canal de envio"><select id="proposta-canal" value={canal} disabled={ocupado} onChange={e => setCanal(e.target.value as CanalProposta)}><option value="WHATSAPP">WhatsApp — envio realizado pelo operador</option><option value="EMAIL">E-mail — integração configurada</option><option value="MANUAL">Outro / entrega manual</option></select></FormField>
      {canal === 'EMAIL' && <p className={styles.hint}>O servidor realiza o envio pelo provedor configurado. Se falhar, o registro comercial permanece e permite nova tentativa. E-mail pendente pode ser recuperado após 5 minutos.</p>}
    </> : <p>{decisao.status === 'ACEITA' ? 'O aceite encerrará automaticamente a oportunidade como ganha e marcará o veículo como vendido pelo valor desta proposta.' : 'Confirme que o cliente recusou esta proposta. O encerramento do lead pode ser registrado separadamente.'}</p>}
    <div className={styles.actions}><button type="button" className="ui-button" disabled={ocupado} onClick={onCancel}>Cancelar</button><button className="ui-button ui-button-primary" disabled={ocupado}>{ocupado ? 'Registrando…' : 'Confirmar registro'}</button></div>
  </form>
}
