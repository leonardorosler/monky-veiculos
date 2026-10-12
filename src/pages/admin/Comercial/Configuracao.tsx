import { useState, type FormEvent } from 'react'
import { Link } from 'react-router-dom'
import api from '../../../api/axios'
import { useSite } from '../../../contexts/SiteContext'
import { useApiResource } from '../../../hooks/useApiResource'
import type { ConfiguracaoComercial } from '../../../types/comercial'
import { erroCRM } from '../../../utils/crm'
import { resolvePersonalizacao, safeLogo } from '../../../utils/personalizacao'
import { Feedback } from '../../../components/Feedback'
import { FormField } from '../../../components/FormField'
import { Spinner } from '../../../components/Spinner/Spinner'
import { ComercialLayout } from './ComercialLayout'
import styles from './Comercial.module.css'

export function Configuracao() {
  const query = useApiResource<ConfiguracaoComercial>('/crm/configuracao')
  const site = useSite()
  const [sucesso, setSucesso] = useState('')
  return <ComercialLayout titulo="Configuração comercial" descricao="Automações, alertas e identidade da vitrine." acao={<Link className="ui-button" to="/" target="_blank" rel="noreferrer">Abrir vitrine</Link>}>
    {sucesso && <Feedback mensagem={sucesso} tipo="sucesso" />}
    {query.carregando ? <Spinner /> : query.erro ? <Feedback mensagem={query.erro} onRetry={query.recarregar} /> : query.data && <ConfigForm inicial={query.data} onSaved={() => { setSucesso('Configuração salva. A identidade será aplicada à vitrine sem rebuild.'); site.recarregar(); query.recarregar() }} />}
  </ComercialLayout>
}

function ConfigForm({ inicial, onSaved }: { inicial: ConfiguracaoComercial; onSaved: () => void }) {
  const [form, setForm] = useState(inicial)
  const [salvando, setSalvando] = useState(false)
  const [erro, setErro] = useState('')
  const [errors, setErrors] = useState<Record<string, string>>({})
  const preview = resolvePersonalizacao(form.personalizacao)
  function personalizar(key: keyof ConfiguracaoComercial['personalizacao'], value: string) {
    setForm(current => ({ ...current, personalizacao: { ...current.personalizacao, [key]: value || null } }))
  }
  async function salvar(event: FormEvent) {
    event.preventDefault()
    if (salvando) return
    const next: Record<string, string> = {}
    const p = form.personalizacao
    if (p.corPrimaria && !/^#[0-9a-f]{6}$/i.test(p.corPrimaria)) next.cor = 'Informe uma cor no formato #RRGGBB ou deixe em branco.'
    if (p.logoUrl && !safeLogo(p.logoUrl)) next.logo = 'Informe uma URL HTTPS sem usuário e senha.'
    for (const [key, value, max] of [['retorno', form.retornoAutomaticoHoras, 8760], ['estoque', form.diasEstoqueAlerta, 3650], ['contato', form.diasSemContatoAlerta, 365]] as const) {
      if (value !== null && (!Number.isInteger(value) || value < 1 || value > max)) next[key] = `Informe um inteiro entre 1 e ${max}.`
    }
    setErrors(next)
    if (Object.keys(next).length) { document.getElementById(`config-${Object.keys(next)[0]}`)?.focus(); return }
    setSalvando(true); setErro('')
    try { await api.put('/crm/configuracao', form); onSaved() }
    catch (error) { setErro(erroCRM(error, 'Não foi possível salvar. Seus ajustes foram preservados.')) }
    finally { setSalvando(false) }
  }
  return <form className={styles.form} onSubmit={salvar}>
    {erro && <Feedback mensagem={erro} />}
    <fieldset disabled={salvando}>
      <div className={styles.grid}>
        <section className={styles.panel}><h2>Distribuição e agenda</h2><div className={styles.form}>
          <label className={styles.checkbox}><input type="checkbox" checked={form.distribuicaoAutomatica} onChange={e => setForm({ ...form, distribuicaoAutomatica: e.target.checked })} />Distribuir novos leads pela menor carteira aberta</label>
          <p className={styles.hint}>Usa vendedores cadastrados. Leads criados por um vendedor ficam com ele. Alterar as regras não redistribui oportunidades existentes.</p>
          <FormField id="config-retorno" label="Prazo de retorno automático (horas)" erro={errors.retorno}><input id="config-retorno" type="number" min={1} max={8760} step={1} value={form.retornoAutomaticoHoras ?? ''} onChange={e => setForm({ ...form, retornoAutomaticoHoras: e.target.value === '' ? null : Number(e.target.value) })} aria-invalid={!!errors.retorno} aria-describedby={errors.retorno ? 'config-retorno-erro' : 'config-retorno-ajuda'} /><p id="config-retorno-ajuda" className={styles.hint}>Em branco desativa. Agenda a próxima atividade ao criar o lead; não envia mensagens ao cliente.</p></FormField>
          <Link className="ui-button" to="/admin/usuarios">Gerenciar vendedores</Link>
        </div></section>
        <section className={styles.panel}><h2>Limiares dos alertas</h2><div className={styles.form}>
          <FormField id="config-estoque" label="Estoque antigo após (dias)" erro={errors.estoque}><input id="config-estoque" type="number" min={1} max={3650} step={1} required value={form.diasEstoqueAlerta} onChange={e => setForm({ ...form, diasEstoqueAlerta: Number(e.target.value) })} aria-invalid={!!errors.estoque} aria-describedby={errors.estoque ? 'config-estoque-erro' : undefined} /></FormField>
          <FormField id="config-contato" label="Sem acompanhamento após (dias)" erro={errors.contato}><input id="config-contato" type="number" min={1} max={365} step={1} required value={form.diasSemContatoAlerta} onChange={e => setForm({ ...form, diasSemContatoAlerta: Number(e.target.value) })} aria-invalid={!!errors.contato} aria-describedby={errors.contato ? 'config-contato-erro' : undefined} /></FormField>
          <p className={styles.hint}>Os alertas são recalculados ao abrir ou atualizar a página.</p><Link className="ui-button" to="/admin/alertas">Ver alertas</Link>
        </div></section>
      </div>
      <div className={styles.grid}>
        <section className={styles.panel}><h2>Personalização da vitrine</h2><div className={styles.form}>
          <FormField id="config-nome" label="Nome de exibição"><input id="config-nome" maxLength={120} value={form.personalizacao.nomeExibicao ?? ''} onChange={e => personalizar('nomeExibicao', e.target.value)} /></FormField>
          <FormField id="config-cor" label="Cor principal (#RRGGBB)" erro={errors.cor}><input id="config-cor" maxLength={7} placeholder="#b91c1c" value={form.personalizacao.corPrimaria ?? ''} onChange={e => personalizar('corPrimaria', e.target.value)} aria-invalid={!!errors.cor} aria-describedby={errors.cor ? 'config-cor-erro' : undefined} /><p className={styles.hint}>Os tons são ajustados automaticamente para manter o contraste do texto.</p></FormField>
          <FormField id="config-logo" label="URL HTTPS do logo" erro={errors.logo}><input id="config-logo" type="url" maxLength={2048} placeholder="https://..." value={form.personalizacao.logoUrl ?? ''} onChange={e => personalizar('logoUrl', e.target.value)} aria-invalid={!!errors.logo} aria-describedby={errors.logo ? 'config-logo-erro' : undefined} /></FormField>
          <FormField id="config-mensagem" label="Mensagem de abertura"><textarea id="config-mensagem" rows={4} maxLength={300} value={form.personalizacao.mensagemHero ?? ''} onChange={e => personalizar('mensagemHero', e.target.value)} /></FormField>
          <p className={styles.hint}>Deixe os campos em branco para restaurar a identidade base.</p><button className="ui-button" type="button" onClick={() => setForm({ ...form, personalizacao: { nomeExibicao: null, corPrimaria: null, logoUrl: null, mensagemHero: null } })}>Restaurar identidade base</button>
        </div></section>
        <section className={styles.panel}><h2>Prévia da identidade</h2><div className={styles.preview} style={preview.tema}><img src={preview.logo} alt="Logo da prévia" onError={e => { e.currentTarget.style.visibility = 'hidden' }} onLoad={e => { e.currentTarget.style.visibility = 'visible' }} /><strong>{preview.nomeCompleto}</strong><h3>Seu próximo <span style={{ color: 'var(--accent-display)' }}>carro</span> está aqui.</h3><p>{preview.mensagem}</p><span className={styles.previewCta}>Ver estoque</span></div><p className={styles.hint}>Prévia local. As alterações só serão publicadas na vitrine ao salvar.</p></section>
      </div>
    </fieldset>
    <div className={styles.actions}><button className="ui-button ui-button-primary" disabled={salvando}>{salvando ? 'Salvando…' : 'Salvar configuração'}</button></div>
  </form>
}
