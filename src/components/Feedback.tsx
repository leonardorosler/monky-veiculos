export function Feedback({ mensagem, tipo = 'erro', onRetry }: { mensagem: string; tipo?: 'erro' | 'sucesso'; onRetry?: () => void }) {
  return (
    <div className={`feedback feedback-${tipo === 'erro' ? 'error' : 'success'}`} role={tipo === 'erro' ? 'alert' : 'status'}>
      <p>{mensagem}</p>
      {onRetry && <button type="button" onClick={onRetry}>Tentar novamente</button>}
    </div>
  )
}
