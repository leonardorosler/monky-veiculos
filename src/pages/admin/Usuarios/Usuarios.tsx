import { useEffect, useState, type FormEvent } from 'react'
import { Plus, Users } from 'lucide-react'
import api from '../../../api/axios'
import type { PlanoAdministrativo, Usuario } from '../../../types'
import { AdminNavBar } from '../../../components/AdminNavBar/AdminNavBar'
import { AdminVoltar } from '../../../components/AdminVoltar/AdminVoltar'
import { Spinner } from '../../../components/Spinner/Spinner'
import { Feedback } from '../../../components/Feedback'
import { Modal, ConfirmDialog } from '../../../components/Modal'
import { FormField } from '../../../components/FormField'
import { useAuth } from '../../../contexts/AuthContext'
import { AdminPageHeader } from '../../../components/AdminPageHeader'
import styles from './Usuarios.module.css'

const formInicial = { nome: '', email: '', senha: '', role: 'VENDEDOR' as Usuario['role'] }

export function Usuarios() {
  const [usuarios, setUsuarios] = useState<Usuario[]>([])
  const [plano, setPlano] = useState<PlanoAdministrativo | null>(null)
  const [carregando, setCarregando] = useState(true)
  const [salvando, setSalvando] = useState(false)
  const [erro, setErro] = useState('')
  const [erroForm, setErroForm] = useState('')
  const [sucesso, setSucesso] = useState('')
  const [tentativa, setTentativa] = useState(0)
  const [aberto, setAberto] = useState(false)
  const [remover, setRemover] = useState<Usuario | null>(null)
  const [alterarAcesso, setAlterarAcesso] = useState<Usuario | null>(null)
  const [form, setForm] = useState(formInicial)
  const { usuario: atual } = useAuth()

  useEffect(() => {
    const controller = new AbortController()
    Promise.all([api.get<Usuario[]>('/admin/usuarios', { signal: controller.signal }), api.get<PlanoAdministrativo>('/admin/plano', { signal: controller.signal })])
      .then(([usuariosResponse, planoResponse]) => { setUsuarios(usuariosResponse.data); setPlano(planoResponse.data) })
      .catch(() => { if (!controller.signal.aborted) setErro('Não foi possível carregar a equipe e os limites do plano.') })
      .finally(() => { if (!controller.signal.aborted) setCarregando(false) })
    return () => controller.abort()
  }, [tentativa])

  function mensagemErro(error: unknown, fallback: string) {
    const apiError = error as { response?: { data?: { message?: string } } }
    return apiError.response?.data?.message ?? fallback
  }

  async function criar(event: FormEvent) {
    event.preventDefault()
    if (salvando) return
    setErroForm(''); setSalvando(true)
    try {
      const { data } = await api.post<Usuario>('/admin/usuarios', { ...form, nome: form.nome.trim(), email: form.email.trim() })
      setUsuarios(current => [...current, data])
      setPlano(current => current ? { ...current, uso: { ...current.uso, usuarios: current.uso.usuarios + 1 } } : current)
      setForm(formInicial); setAberto(false); setSucesso('Usuário adicionado à equipe.')
    } catch (error) { setErroForm(mensagemErro(error, 'Não foi possível criar o usuário.')) }
    finally { setSalvando(false) }
  }

  async function confirmarRemocao() {
    if (!remover || salvando) return
    setSalvando(true); setErro(''); setSucesso('')
    try {
      await api.delete(`/admin/usuarios/${remover.id}`)
      setUsuarios(current => current.filter(usuario => usuario.id !== remover.id))
      setPlano(current => current ? { ...current, uso: { ...current.uso, usuarios: current.uso.usuarios - 1 } } : current)
      setSucesso('Usuário removido da equipe.')
    } catch (error) { setErro(mensagemErro(error, 'Não foi possível remover o usuário.')) }
    finally { setSalvando(false); setRemover(null) }
  }

  const limite = plano?.limites.usuarios ?? null
  const limiteAtingido = limite !== null && usuarios.length >= limite

  async function confirmarAcesso() {
    if (!alterarAcesso || salvando) return
    setSalvando(true); setErro(''); setSucesso('')
    try {
      const { data } = await api.patch<Usuario>(`/admin/usuarios/${alterarAcesso.id}/ativo`, { ativo: alterarAcesso.ativo === false })
      setUsuarios(current => current.map(item => item.id === data.id ? data : item))
      setSucesso(data.ativo ? 'Acesso reativado.' : 'Conta desativada. O histórico comercial foi preservado e o acesso revogado.')
    } catch (error) { setErro(mensagemErro(error, 'Não foi possível alterar o acesso.')) }
    finally { setSalvando(false); setAlterarAcesso(null) }
  }

  return (
    <div className={`${styles.container} admin-shell`}>
      <AdminNavBar />
      <main id="conteudo-admin" className={`${styles.main} admin-content`}>
        <AdminPageHeader contexto="Administração" titulo="Equipe" descricao={carregando ? 'Consultando sua equipe e os limites do plano…' : limite === null ? `${usuarios.length} usuários no plano ${plano?.nome ?? ''}, sem limite de contas.` : `${usuarios.length} de ${limite} usuários no plano ${plano?.nome ?? ''}. Gerencie acessos e preserve o histórico.`} acoes={<><AdminVoltar /><button className="ui-button ui-button-primary" disabled={carregando || !plano || limiteAtingido} onClick={() => { setErroForm(''); setAberto(true) }}><Plus size={18} aria-hidden="true" />Adicionar usuário</button></>} />
        {erro && <Feedback mensagem={erro} onRetry={() => { setErro(''); setCarregando(true); setTentativa(value => value + 1) }} />}
        {sucesso && <Feedback mensagem={sucesso} tipo="sucesso" />}
        {limiteAtingido && <p className={styles.aviso}>Você atingiu o limite de usuários deste plano.</p>}
        <section className={styles.metrics} aria-label="Resumo da equipe" aria-busy={carregando}>{[{ label: 'Usuários cadastrados', value: usuarios.length }, { label: 'Contas ativas', value: usuarios.filter(u => u.ativo !== false).length }, { label: 'Vendedores ativos', value: usuarios.filter(u => u.role === 'VENDEDOR' && u.ativo !== false).length }].map(item => <article key={item.label}><span>{item.label}</span><strong>{carregando || !plano ? '—' : item.value}</strong></article>)}</section>
        <p className={styles.ajuda}>Desativar revoga o acesso e preserva o histórico. Contas inativas continuam no limite total de usuários; a carteira não é redistribuída automaticamente.</p>
        {carregando ? <Spinner /> : <div className={styles.lista}>
          {usuarios.map(usuario => {
            const protegido = usuario.id === atual?.id || (usuario.role === 'ADMIN' && usuario.ativo !== false && usuarios.filter(item => item.role === 'ADMIN' && item.ativo !== false).length <= 1)
            return <article className={styles.usuario} key={usuario.id}><div className={styles.identidade}><span className={styles.avatar} aria-hidden="true">{usuario.nome.trim().split(/\s+/).slice(0, 2).map(p => p[0]).join('').toUpperCase()}</span><div><h2>{usuario.nome}{usuario.id === atual?.id && <small>Você</small>}</h2><span>{usuario.email}</span><span className={usuario.ativo === false ? styles.inativo : styles.ativo}>{usuario.ativo === false ? 'Conta inativa' : 'Conta ativa'}</span>{protegido && <p className={styles.protegido}>Conta protegida: sua conta ou último administrador ativo.</p>}</div></div><span className={styles.role}>{usuario.role === 'ADMIN' ? 'Administrador' : 'Vendedor'}</span><div className={styles.acoesUsuario}><button type="button" className="ui-button" disabled={salvando || protegido} aria-label={`${usuario.ativo === false ? 'Reativar' : 'Desativar'} acesso de ${usuario.nome}`} onClick={() => setAlterarAcesso(usuario)}>{usuario.ativo === false ? 'Reativar acesso' : 'Desativar acesso'}</button><button type="button" className={`ui-button ${styles.remover}`} disabled={salvando || protegido} title={protegido ? 'Sua conta e o último administrador ativo não podem ser removidos.' : undefined} onClick={() => setRemover(usuario)} aria-label={`Remover ${usuario.nome} da equipe`}>Remover</button></div></article>
          })}
          {usuarios.length === 0 && !erro && <div className={styles.vazio}><Users size={30} aria-hidden="true" /><p>Adicione usuários para formar sua equipe.</p></div>}
        </div>}
      </main>
      {aberto && <Modal titulo="Adicionar usuário" onClose={() => { if (!salvando) setAberto(false) }}>
        <form className={styles.form} onSubmit={criar} aria-busy={salvando}>
          {erroForm && <Feedback mensagem={erroForm} />}
          <FormField id="usuario-nome" label="Nome"><input id="usuario-nome" autoComplete="name" autoFocus required minLength={2} value={form.nome} onChange={event => setForm({ ...form, nome: event.target.value })} disabled={salvando} /></FormField>
          <FormField id="usuario-email" label="Email"><input id="usuario-email" required type="email" autoComplete="email" value={form.email} onChange={event => setForm({ ...form, email: event.target.value })} disabled={salvando} /></FormField>
          <FormField id="usuario-senha" label="Senha inicial"><input id="usuario-senha" required minLength={8} type="password" autoComplete="new-password" aria-describedby="senha-ajuda" value={form.senha} onChange={event => setForm({ ...form, senha: event.target.value })} disabled={salvando} /><p id="senha-ajuda" className={styles.formHint}>Use pelo menos 8 caracteres.</p></FormField>
          <FormField id="usuario-role" label="Perfil de acesso"><select id="usuario-role" value={form.role} onChange={event => setForm({ ...form, role: event.target.value as Usuario['role'] })} disabled={salvando}><option value="VENDEDOR">Vendedor</option><option value="ADMIN">Administrador</option></select></FormField>
          <div className="dialog-actions"><button className="ui-button" type="button" onClick={() => setAberto(false)} disabled={salvando}>Cancelar</button><button className="ui-button ui-button-primary" type="submit" disabled={salvando || limiteAtingido}>{salvando ? 'Adicionando...' : 'Adicionar à equipe'}</button></div>
        </form>
      </Modal>}
      {remover && <ConfirmDialog titulo="Remover usuário?" mensagem={`${remover.nome} perderá acesso ao painel desta revenda.`} ocupado={salvando} onClose={() => setRemover(null)} onConfirm={() => void confirmarRemocao()} />}
      {alterarAcesso && <ConfirmDialog titulo={alterarAcesso.ativo === false ? 'Reativar acesso?' : 'Desativar acesso?'} confirmar={alterarAcesso.ativo === false ? 'Reativar acesso' : 'Desativar acesso'} mensagem={`${alterarAcesso.nome}: o histórico e os vínculos comerciais serão preservados.`} ocupado={salvando} onClose={() => setAlterarAcesso(null)} onConfirm={() => void confirmarAcesso()} />}
    </div>
  )
}
