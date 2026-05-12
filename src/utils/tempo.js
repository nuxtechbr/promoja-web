export function calcularTempoRestante(validade) {
  if (!validade) {
    return 'Sem validade'
  }

  const agora = new Date()
  const fim = new Date(validade)

  if (Number.isNaN(fim.getTime())) {
    return 'Data inválida'
  }

  const diferenca = fim.getTime() - agora.getTime()

  if (diferenca <= 0) {
    return 'Expirada'
  }

  const minutosTotais = Math.floor(diferenca / (1000 * 60))
  const horas = Math.floor(minutosTotais / 60)
  const minutos = minutosTotais % 60

  if (horas <= 0) {
    return `${minutos}min`
  }

  return `${horas}h ${minutos}min`
}