import type { ReactNode } from 'react'

export function FormField({ id, label, erro, children }: { id: string; label: string; erro?: string; children: ReactNode }) {
  return <div className="form-field"><label htmlFor={id}>{label}</label>{children}{erro && <p className="field-error" id={`${id}-erro`}>{erro}</p>}</div>
}
