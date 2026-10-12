import { useEffect, useRef, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { CarFront, ImagePlus, ListChecks } from 'lucide-react'
import api from '../../../api/axios'
import type { Veiculo, Foto } from '../../../types'
import styles from './FormVeiculo.module.css'
import { AdminNavBar } from '../../../components/AdminNavBar/AdminNavBar'
import { AdminVoltar } from '../../../components/AdminVoltar/AdminVoltar'
import { Feedback } from '../../../components/Feedback'
import { Spinner } from '../../../components/Spinner/Spinner'
import { ConfirmDialog } from '../../../components/Modal'
import { siteConfig } from '../../../config/site'
import { AdminPageHeader } from '../../../components/AdminPageHeader'

const combustiveis = ['GASOLINA', 'ETANOL', 'FLEX', 'DIESEL', 'ELETRICO', 'HIBRIDO']
const cambios = ['MANUAL', 'AUTOMATICO', 'CVT']

interface FormData {
  marca: string
  modelo: string
  ano: string
  preco: string
  km: string
  combustivel: string
  cambio: string
  cor: string
  descricao: string
  categoria: string
  opcionais: string
}

const formInicial: FormData = {
  marca: '', modelo: '', ano: '', preco: '', km: '',
  combustivel: 'FLEX', cambio: 'MANUAL', cor: '', descricao: '',
  categoria: '', opcionais: '',
}

export function FormVeiculo() {
  const { id } = useParams()
  return <FormVeiculoConteudo key={id ?? 'novo'} />
}

function FormVeiculoConteudo() {
  const [form, setForm] = useState<FormData>(formInicial)
  const [arquivos, setArquivos] = useState<File[]>([])
  const [previews, setPreviews] = useState<string[]>([])
  const [capaIndex, setCapaIndex] = useState(0)
  const [fotosExistentes, setFotosExistentes] = useState<Foto[]>([])
  const [carregando, setCarregando] = useState(false)
  const [erro, setErro] = useState('')
  const [erroFotos, setErroFotos] = useState('')
  const [erroOpcionais, setErroOpcionais] = useState('')
  const { id } = useParams()
  const navigate = useNavigate()
  const editando = !!id
  const [carregandoDados, setCarregandoDados] = useState(editando)
  const [erroCarga, setErroCarga] = useState('')
  const [tentativa, setTentativa] = useState(0)
  const [fotoRemover, setFotoRemover] = useState<string | null>(null)
  const [fotoOcupada, setFotoOcupada] = useState<string | null>(null)
  const [progresso, setProgresso] = useState('')
  const veiculoSalvo = useRef<string | undefined>(id)
  const arquivosEnviados = useRef(new Set<File>())

  useEffect(() => {
    const controller = new AbortController()
    if (editando) {
      api.get<Veiculo>(`/veiculos/${id}`, { signal: controller.signal }).then(({ data }) => {
        setForm({
          marca: data.marca, modelo: data.modelo, ano: String(data.ano),
          preco: String(data.preco), km: String(data.km),
          combustivel: data.combustivel, cambio: data.cambio,
          cor: data.cor, descricao: data.descricao ?? '',
          categoria: data.categoria ?? '', opcionais: (data.opcionais ?? []).join('\n'),
        })
        setFotosExistentes(data.fotos)
      })
        .catch(() => { if (!controller.signal.aborted) setErroCarga('Não foi possível carregar os dados do veículo.') })
        .finally(() => { if (!controller.signal.aborted) setCarregandoDados(false) })
    }
    return () => controller.abort()
  }, [id, editando, tentativa])

  useEffect(() => () => { previews.forEach(url => URL.revokeObjectURL(url)) }, [previews])

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) {
    if (e.target.name === 'opcionais') setErroOpcionais('')
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }))
  }

  function handleArquivos(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files ?? [])
    if (files.some(file => file.size > 5 * 1024 * 1024)) {
      setErroFotos('Cada foto deve ter no máximo 5 MB. Escolha arquivos menores e tente novamente.')
      e.target.value = ''
      return
    }
    setErro('')
    setErroFotos('')
    setArquivos(files)
    arquivosEnviados.current.clear()
    setCapaIndex(0)
    setPreviews(files.map(f => URL.createObjectURL(f)))
  }

  async function handleDefinirCapa(fotoId: string) {
    setFotoOcupada(fotoId)
    setErro('')
    try {
      await api.patch(`/fotos/${fotoId}/capa`)
      setFotosExistentes(prev => prev.map(f => ({ ...f, capa: f.id === fotoId })))
    } catch { setErro('Não foi possível definir a capa. Tente novamente.') }
    finally { setFotoOcupada(null) }
  }

  async function handleDeletarFoto(fotoId: string) {
    setFotoOcupada(fotoId)
    setErro('')
    try {
      await api.delete(`/fotos/${fotoId}`)
      setFotosExistentes(prev => prev.filter(f => f.id !== fotoId))
    } catch { setErro('Não foi possível remover a foto. Tente novamente.') }
    finally { setFotoOcupada(null); setFotoRemover(null) }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (carregando || fotoOcupada) return
    const opcionais = [...new Set(form.opcionais.split('\n').map(value => value.trim()).filter(Boolean))]
    if (opcionais.length > 60 || opcionais.some(value => value.length > 100)) {
      setErroOpcionais('Use até 60 opcionais, com no máximo 100 caracteres em cada linha.')
      document.getElementById('veiculo-opcionais')?.focus()
      return
    }
    setErroOpcionais('')
    setErro('')
    setCarregando(true)
    let salvouDados = false

    try {
      const dados = {
        ...form,
        ano: Number(form.ano),
        preco: Number(form.preco),
        km: Number(form.km),
        categoria: form.categoria.trim() || null,
        opcionais,
      }

      let veiculoId = veiculoSalvo.current

      if (veiculoId) {
        await api.put(`/veiculos/${veiculoId}`, dados)
      } else {
        const { data } = await api.post<Veiculo>('/veiculos', dados)
        veiculoId = data.id
        veiculoSalvo.current = data.id
      }
      salvouDados = true

      for (let i = 0; i < arquivos.length; i++) {
        if (arquivosEnviados.current.has(arquivos[i])) continue
        setProgresso(`Enviando foto ${i + 1} de ${arquivos.length}...`)
        const formData = new FormData()
        formData.append('foto', arquivos[i])
        formData.append('capa', String(i === capaIndex))
        await api.post(`/veiculos/${veiculoId}/fotos`, formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        })
        arquivosEnviados.current.add(arquivos[i])
      }

      navigate('/admin/estoque')
    } catch (error: unknown) {
      const apiError = error as { response?: { data?: { message?: string } } }
      setErro(apiError.response?.data?.message ?? (salvouDados && arquivos.length ? 'O veículo foi salvo, mas o envio das fotos não terminou. Tente salvar novamente para enviar as fotos restantes.' : 'Erro ao salvar veículo. Verifique os dados.'))
      requestAnimationFrame(() => document.getElementById('erro-veiculo')?.focus())
    } finally {
      setCarregando(false)
      setProgresso('')
    }
  }

  return (
    <div className={`${styles.container} admin-shell`}>
      <AdminNavBar />
      <main id="conteudo-admin" className={`${styles.main} admin-content`}>
        <AdminPageHeader contexto="Estoque / anúncio" titulo={editando ? 'Editar Veículo' : 'Novo Veículo'} descricao="Preencha os dados, prepare a apresentação e escolha a foto de capa." acoes={<AdminVoltar to="/admin/estoque" label="Voltar ao estoque" />} />

        {carregandoDados ? <Spinner /> : erroCarga ? <Feedback mensagem={erroCarga} onRetry={() => { setErroCarga(''); setCarregandoDados(true); setTentativa(value => value + 1) }} /> : <div className={styles.formLayout}><form onSubmit={handleSubmit} className={styles.form} aria-busy={carregando}>
          {erro && <div id="erro-veiculo" tabIndex={-1} className={styles.erroResumo}><Feedback mensagem={erro} /></div>}
          {progresso && <p role="status">{progresso}</p>}

          <section className={styles.section} aria-labelledby="dados-veiculo"><div className={styles.sectionTitle}><CarFront size={20} aria-hidden="true" /><h2 id="dados-veiculo">Dados do veículo</h2></div><p className={styles.sectionHint}>Campos com * são obrigatórios. Use os dados que serão exibidos no anúncio.</p><div className={styles.grid}>
            <div className={styles.campo}>
              <label htmlFor="veiculo-marca" className={styles.label}>Marca *</label>
              <input id="veiculo-marca" name="marca" maxLength={80} value={form.marca} onChange={handleChange} className={styles.input} disabled={carregando} required />
            </div>
            <div className={styles.campo}>
              <label htmlFor="veiculo-modelo" className={styles.label}>Modelo *</label>
              <input id="veiculo-modelo" name="modelo" maxLength={120} value={form.modelo} onChange={handleChange} className={styles.input} disabled={carregando} required />
            </div>
            <div className={styles.campo}>
              <label htmlFor="veiculo-ano" className={styles.label}>Ano *</label>
              <input id="veiculo-ano" name="ano" type="number" inputMode="numeric" min="1886" max={new Date().getFullYear() + 1} value={form.ano} onChange={handleChange} className={styles.input} disabled={carregando} required />
            </div>
            <div className={styles.campo}>
              <label htmlFor="veiculo-preco" className={styles.label}>Preço (R$) *</label>
              <input id="veiculo-preco" name="preco" type="number" inputMode="decimal" min="0" max="100000000" step="0.01" value={form.preco} onChange={handleChange} className={styles.input} disabled={carregando} required />
            </div>
            <div className={styles.campo}>
              <label htmlFor="veiculo-km" className={styles.label}>Quilometragem *</label>
              <input id="veiculo-km" name="km" type="number" inputMode="numeric" min="0" max="10000000" value={form.km} onChange={handleChange} className={styles.input} disabled={carregando} required />
            </div>
            <div className={styles.campo}>
              <label htmlFor="veiculo-cor" className={styles.label}>Cor *</label>
              <input id="veiculo-cor" name="cor" maxLength={50} value={form.cor} onChange={handleChange} className={styles.input} disabled={carregando} required />
            </div>
            <div className={styles.campo}>
              <label htmlFor="veiculo-combustivel" className={styles.label}>Combustível</label>
              <select id="veiculo-combustivel" name="combustivel" value={form.combustivel} onChange={handleChange} className={styles.input} disabled={carregando}>
                {combustiveis.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div className={styles.campo}>
              <label htmlFor="veiculo-cambio" className={styles.label}>Câmbio</label>
              <select id="veiculo-cambio" name="cambio" value={form.cambio} onChange={handleChange} className={styles.input} disabled={carregando}>
                {cambios.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
          </div></section>

          <section className={styles.section} aria-labelledby="apresentacao-veiculo"><div className={styles.sectionTitle}><ListChecks size={20} aria-hidden="true" /><h2 id="apresentacao-veiculo">Apresentação do anúncio</h2></div>
          <div className={styles.campo}><label htmlFor="veiculo-categoria" className={styles.label}>Categoria</label><select id="veiculo-categoria" name="categoria" value={form.categoria} onChange={handleChange} className={styles.input} disabled={carregando}><option value="">Não informada</option>{siteConfig.catalog.categories.map(item => <option key={item} value={item}>{item}</option>)}{form.categoria && !siteConfig.catalog.categories.some(item => item === form.categoria) && <option value={form.categoria}>{form.categoria}</option>}</select></div>
          <div className={styles.campo}><label htmlFor="veiculo-opcionais" className={styles.label}>Opcionais (um por linha)</label><textarea id="veiculo-opcionais" name="opcionais" rows={5} value={form.opcionais} onChange={handleChange} className={`${styles.input} ${styles.textarea}`} disabled={carregando} aria-invalid={!!erroOpcionais} aria-describedby={erroOpcionais ? 'opcionais-erro opcionais-ajuda' : 'opcionais-ajuda'} /><p id="opcionais-ajuda" className={styles.dica}>Até 60 itens, com 100 caracteres por item. Ex.: ar-condicionado, câmera de ré.</p>{erroOpcionais && <p id="opcionais-erro" role="alert" className="field-error">{erroOpcionais}</p>}</div>
          <div className={styles.campo}>
              <label htmlFor="veiculo-descricao" className={styles.label}>Descrição</label>
              <textarea id="veiculo-descricao" name="descricao" maxLength={5000} value={form.descricao} disabled={carregando} onChange={handleChange}
              className={`${styles.input} ${styles.textarea}`} />
          </div>
          </section>

          <section className={styles.section} aria-labelledby="fotos-veiculo"><div className={styles.sectionTitle}><ImagePlus size={20} aria-hidden="true" /><h2 id="fotos-veiculo">Fotos do veículo</h2></div><p className={styles.sectionHint}>Imagens nítidas ajudam no atendimento. A capa é a foto exibida nos cards da vitrine.</p>
          {/* Fotos existentes (edição) */}
          {editando && fotosExistentes.length > 0 && (
            <div className={styles.campo}>
              <h3 className={styles.label}>Fotos cadastradas</h3>
              <p className={styles.dica}>Clique em "Definir capa" para escolher a foto exibida no card.</p>
              <div className={styles.gridFotos}>
                {fotosExistentes.map(foto => (
                  <div
                    key={foto.id}
                    className={`${styles.fotoItem} ${foto.capa ? styles.fotoItemCapa : ''}`}
                  >
                    <img src={foto.url} alt={`Foto de ${form.marca} ${form.modelo}`} loading="lazy" className={styles.fotoImg} />
                    {foto.capa && <span className={styles.tagCapa}>✓ Capa</span>}
                    <div className={styles.fotoBotoes}>
                      {!foto.capa && (
                          <button type="button" disabled={!!fotoOcupada || carregando} onClick={() => void handleDefinirCapa(foto.id)} className={styles.botaoDefinirCapa}>
                          Definir capa
                        </button>
                      )}
                      <button type="button" disabled={!!fotoOcupada || carregando} onClick={() => setFotoRemover(foto.id)} className={styles.botaoDeletar}>
                        Remover
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Upload de novas fotos */}
          <div className={styles.campo}>
            <label htmlFor="veiculo-fotos" className={styles.label}>
              {editando ? 'Adicionar mais fotos' : 'Fotos'}
            </label>
            <input id="veiculo-fotos" type="file" accept="image/*" multiple disabled={carregando} onChange={handleArquivos} className={styles.input} aria-invalid={!!erroFotos} aria-describedby={erroFotos ? 'fotos-erro fotos-ajuda' : 'fotos-ajuda'} />
            <p id="fotos-ajuda" className={styles.dica}>Cada arquivo deve ter até 5 MB. Você pode selecionar várias fotos de uma vez.</p>
            {erroFotos && <p id="fotos-erro" role="alert" className="field-error">{erroFotos}</p>}

            {previews.length > 0 && (
              <>
                <p className={styles.dica}>Clique na foto para definir como capa do card.</p>
                <div className={styles.gridFotos}>
                  {previews.map((src, i) => (
                    <button type="button"
                      key={i}
                      onClick={() => setCapaIndex(i)}
                      aria-label={`Definir foto ${i + 1} como capa`}
                      aria-pressed={i === capaIndex}
                      disabled={carregando}
                      className={`${styles.fotoItem} ${i === capaIndex ? styles.fotoItemCapa : ''}`}
                    >
                      <img src={src} alt={`Prévia da foto ${i + 1}`} className={styles.fotoImg} />
                      {i === capaIndex && <span className={styles.tagCapa}>✓ Capa</span>}
                    </button>
                  ))}
                </div>
              </>
            )}
          </div>
          </section>

          <div className={styles.formActions}><Link className="ui-button" to="/admin/estoque">Cancelar</Link>
          <button type="submit" disabled={carregando || !!fotoOcupada} className={styles.botaoPrimario}>
            {carregando ? 'Salvando...' : editando ? 'Salvar Alterações' : 'Cadastrar Veículo'}
          </button>
          </div>
        </form><aside className={styles.resumo} aria-labelledby="resumo-anuncio"><span className={styles.resumoIcone}><CarFront size={28} aria-hidden="true" /></span><h2 id="resumo-anuncio">Resumo do anúncio</h2><p className={styles.resumoNome}>{[form.marca, form.modelo].filter(Boolean).join(' ') || 'Identifique seu veículo'}</p><dl><div><dt>Ano</dt><dd>{form.ano || 'Não informado'}</dd></div><div><dt>Preço</dt><dd>{form.preco ? Number(form.preco).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }) : 'Não informado'}</dd></div><div><dt>Quilometragem</dt><dd>{form.km ? `${Number(form.km).toLocaleString('pt-BR')} km` : 'Não informada'}</dd></div><div><dt>Fotos</dt><dd>{fotosExistentes.length + arquivos.length} selecionadas</dd></div></dl><p className={styles.dica}>Confira os dados antes de salvar. O resumo acompanha o que você preenche no formulário.</p></aside></div>}
      </main>
      {fotoRemover && <ConfirmDialog titulo="Remover foto?" mensagem="Esta foto será removida do anúncio do veículo." ocupado={!!fotoOcupada} onClose={() => setFotoRemover(null)} onConfirm={() => void handleDeletarFoto(fotoRemover)} />}
    </div>
  )
}
