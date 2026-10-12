import { useEffect, useState } from 'react'
import api from '../api/axios'
import { erroCRM } from '../utils/crm'

export function useApiResource<T>(url: string) {
  const [versao, setVersao] = useState(0)
  const chave = `${versao}:${url}`
  const [snapshot, setSnapshot] = useState<{ chave: string; data?: T; erro?: string } | null>(null)
  useEffect(() => {
    const controller = new AbortController()
    api.get<T>(url, { signal: controller.signal })
      .then(({ data }) => { if (!controller.signal.aborted) setSnapshot({ chave, data }) })
      .catch(error => { if (!controller.signal.aborted) setSnapshot({ chave, erro: erroCRM(error, 'Não foi possível carregar os dados. Tente novamente.') }) })
    return () => controller.abort()
  }, [url, chave])
  const carregando = snapshot?.chave !== chave
  return { data: carregando ? undefined : snapshot?.data, erro: carregando ? '' : snapshot?.erro, carregando, recarregar: () => setVersao(value => value + 1) }
}
