import { useEffect, useRef, useState } from 'react'
import { erroCRM } from '../../../utils/crm'

export function useCrmMutation() {
  const lock = useRef(false)
  const mounted = useRef(true)
  const [ocupado, setOcupado] = useState(false)
  const [erro, setErro] = useState('')
  const [sucesso, setSucesso] = useState('')

  useEffect(() => {
    mounted.current = true
    return () => { mounted.current = false }
  }, [])

  async function executar(action: () => Promise<void>, mensagem: string): Promise<boolean> {
    if (lock.current) return false
    lock.current = true
    setOcupado(true)
    setErro('')
    setSucesso('')
    try {
      await action()
      if (mounted.current) setSucesso(mensagem)
      return mounted.current
    } catch (error) {
      if (mounted.current) setErro(erroCRM(error))
      return false
    } finally {
      lock.current = false
      if (mounted.current) setOcupado(false)
    }
  }

  return { ocupado, erro, sucesso, executar }
}
