export function validarContato(form: { nome: string; telefone: string; email: string }) {
  const erros: Record<string, string> = {}
  if (form.nome.trim().length < 2) erros.nome = 'Informe seu nome com pelo menos 2 caracteres.'
  if (!/^\d{10,11}$/.test(form.telefone.replace(/\D/g, ''))) erros.telefone = 'Informe um telefone com DDD e 10 ou 11 dígitos.'
  if (form.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) erros.email = 'Informe um email válido.'
  return erros
}

export function cpfValido(valor: string) {
  const cpf = valor.replace(/\D/g, '')
  if (!/^\d{11}$/.test(cpf) || /^(\d)\1{10}$/.test(cpf)) return false
  for (let tamanho = 9; tamanho <= 10; tamanho++) {
    let soma = 0
    for (let index = 0; index < tamanho; index++) soma += Number(cpf[index]) * (tamanho + 1 - index)
    const digito = (soma * 10) % 11 % 10
    if (digito !== Number(cpf[tamanho])) return false
  }
  return true
}

export function formatarTelefone(valor: string) {
  const digits = valor.replace(/\D/g, '').slice(0, 11)
  return digits.replace(/^(\d{2})(\d)/, '($1) $2').replace(/(\d{4,5})(\d{4})$/, '$1-$2')
}

export function focarPrimeiroErro(erros: Record<string, string>) {
  document.getElementById(Object.keys(erros)[0])?.focus()
}
