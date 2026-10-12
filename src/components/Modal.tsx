import { useEffect, useId, useRef, type KeyboardEventHandler, type ReactNode } from 'react'
import { X } from 'lucide-react'

export function Modal({ titulo, children, onClose, ampla = false, onKeyDown }: { titulo: string; children: ReactNode; onClose: () => void; ampla?: boolean; onKeyDown?: KeyboardEventHandler<HTMLDialogElement> }) {
  const ref = useRef<HTMLDialogElement>(null)
  const titleId = useId()

  useEffect(() => {
    const dialog = ref.current
    const previousOverflow = document.body.style.overflow
    dialog?.showModal()
    document.body.style.overflow = 'hidden'
    return () => {
      dialog?.close()
      document.body.style.overflow = previousOverflow
    }
  }, [])

  return (
    <dialog ref={ref} className={`ui-dialog ${ampla ? 'ui-dialog-wide' : ''}`} aria-labelledby={titleId} onKeyDown={onKeyDown} onCancel={event => { event.preventDefault(); onClose() }} onClick={event => {
      if (event.target === event.currentTarget) {
        const rect = event.currentTarget.getBoundingClientRect()
        if (event.clientX < rect.left || event.clientX > rect.right || event.clientY < rect.top || event.clientY > rect.bottom) onClose()
      }
    }}>
      <div className="dialog-header">
        <h2 id={titleId}>{titulo}</h2>
        <button type="button" className="dialog-close" onClick={onClose} aria-label="Fechar janela"><X size={20} /></button>
      </div>
      {children}
    </dialog>
  )
}

export function ConfirmDialog({ titulo, mensagem, ocupado, onConfirm, onClose, confirmar = 'Remover' }: { titulo: string; mensagem: string; ocupado: boolean; onConfirm: () => void; onClose: () => void; confirmar?: string }) {
  return (
    <Modal titulo={titulo} onClose={() => { if (!ocupado) onClose() }}>
      <p>{mensagem}</p>
      <div className="dialog-actions">
        <button className="ui-button" type="button" autoFocus disabled={ocupado} onClick={onClose}>Cancelar</button>
        <button className="ui-button ui-button-danger" type="button" disabled={ocupado} onClick={onConfirm}>{ocupado ? 'Aguarde…' : confirmar}</button>
      </div>
    </Modal>
  )
}
