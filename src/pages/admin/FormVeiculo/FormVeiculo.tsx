import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import api from '../../../api/axios'
import type { Veiculo } from '../../../types'
import { NavBar } from '../../../components/NavBar/NavBar'
import styles from './FormVeiculo.module.css'
import { AdminNavBar } from '../../../components/AdminNavBar/AdminNavBar'
import { AdminVoltar } from '../../../components/AdminVoltar/AdminVoltar'

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
}

const formInicial: FormData = {
  marca: '',
  modelo: '',
  ano: '',
  preco: '',
  km: '',
  combustivel: 'FLEX',
  cambio: 'MANUAL',
  cor: '',
  descricao: '',
}

export function FormVeiculo() {
  const [form, setForm] = useState<FormData>(formInicial)
  const [fotos, setFotos] = useState<File[]>([])
  const [carregando, setCarregando] = useState(false)
  const [erro, setErro] = useState('')
  const { id } = useParams()
  const navigate = useNavigate()
  const editando = !!id

  useEffect(() => {
    if (editando) {
      api.get<Veiculo>(`/veiculos/${id}`).then(({ data }) => {
        setForm({
          marca: data.marca,
          modelo: data.modelo,
          ano: String(data.ano),
          preco: String(data.preco),
          km: String(data.km),
          combustivel: data.combustivel,
          cambio: data.cambio,
          cor: data.cor,
          descricao: data.descricao ?? '',
        })
      })
    }
  }, [id])

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) {
    setForm((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()

    setErro('')
    setCarregando(true)

    try {
      const dados = {
        ...form,
        ano: Number(form.ano),
        preco: Number(form.preco),
        km: Number(form.km),
      }
      let veiculoId = id
      if (editando) {
        await api.put(`/veiculos/${id}`, dados)
      } else {
        const { data } = await api.post<Veiculo>('/veiculos', dados)
        veiculoId = data.id
      }

      for (const foto of fotos) {
        const formData = new FormData()
        formData.append('foto', foto)

        await api.post(`/veiculos/${veiculoId}/fotos`, formData, {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        })
      }

      navigate('/admin/estoque')
    } catch {
      setErro('Erro ao salvar veículo. Verifique os dados.')
    } finally {
      setCarregando(false)
    }
  }

  return (
    <div className={styles.container}>
      <AdminNavBar />
      <AdminVoltar />
      <main className={styles.main}>
        <div className={styles.topo}>
          <h1 className={styles.titulo}>{editando ? 'Editar Veículo' : 'Novo Veículo'}</h1>
        </div>

        <form onSubmit={handleSubmit} className={styles.form}>
          {erro && <p className={styles.erro}>{erro}</p>}

          <div className={styles.grid}>
            <div className={styles.campo}>
              <label className={styles.label}>Marca</label>

              <input name="marca" value={form.marca} onChange={handleChange} className={styles.input} required />
            </div>

            <div className={styles.campo}>
              <label className={styles.label}>Modelo</label>

              <input name="modelo" value={form.modelo} onChange={handleChange} className={styles.input} required />
            </div>

            <div className={styles.campo}>
              <label className={styles.label}>Ano</label>

              <input name="ano" type="number" value={form.ano} onChange={handleChange} className={styles.input} required />
            </div>

            <div className={styles.campo}>
              <label className={styles.label}>Preço (R$)</label>

              <input name="preco" type="number" value={form.preco} onChange={handleChange} className={styles.input} required />
            </div>

            <div className={styles.campo}>
              <label className={styles.label}>KM</label>

              <input name="km" type="number" value={form.km} onChange={handleChange} className={styles.input} required />
            </div>

            <div className={styles.campo}>
              <label className={styles.label}>Cor</label>

              <input name="cor" value={form.cor} onChange={handleChange} className={styles.input} required />
            </div>

            <div className={styles.campo}>
              <label className={styles.label}>Combustível</label>

              <select name="combustivel" value={form.combustivel} onChange={handleChange} className={styles.input}>
                {combustiveis.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>

            <div className={styles.campo}>
              <label className={styles.label}>Câmbio</label>

              <select name="cambio" value={form.cambio} onChange={handleChange} className={styles.input}>
                {cambios.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className={styles.campo}>
            <label className={styles.label}>Descrição</label>

            <textarea name="descricao" value={form.descricao} onChange={handleChange} className={`${styles.input} ${styles.textarea}`} />
          </div>

          <div className={styles.campo}>
            <label className={styles.label}>Fotos</label>

            <input type="file" accept="image/*" multiple onChange={(e) => setFotos(Array.from(e.target.files ?? []))} className={styles.input} />

            {fotos.length > 0 && <p className={styles.infoFotos}>{fotos.length} foto(s) selecionada(s)</p>}
          </div>

          <button type="submit" disabled={carregando} className={styles.botaoPrimario}>
            {carregando ? 'Salvando...' : editando ? 'Salvar Alterações' : 'Cadastrar Veículo'}
          </button>
        </form>
      </main>
    </div>
  )
}
