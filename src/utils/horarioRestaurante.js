export function restauranteAberto(horarios = []) {
  if (!Array.isArray(horarios) || horarios.length === 0) {
    return false
  }

  const agora = new Date()
  const diaSemana = agora.getDay()

  const horarioHoje = horarios.find(
    (item) =>
      Number(item.dia_semana) === diaSemana &&
      item.ativo === true
  )

  if (!horarioHoje) {
    return false
  }

  const horaAtual =
    String(agora.getHours()).padStart(2, '0') +
    ':' +
    String(agora.getMinutes()).padStart(2, '0')

  const abre = horarioHoje.abre_em?.slice(0, 5)
  const fecha = horarioHoje.fecha_em?.slice(0, 5)

  if (!abre || !fecha) {
    return false
  }

  if (abre < fecha) {
    return horaAtual >= abre && horaAtual <= fecha
  }

  return horaAtual >= abre || horaAtual <= fecha
}