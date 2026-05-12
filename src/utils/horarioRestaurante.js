export function restauranteAberto(horarios = []) {
  const agora = new Date();

  const diaSemana = agora.getDay();

  const horarioHoje = horarios.find(
    (item) =>
      Number(item.dia_semana) === diaSemana &&
      item.ativo === true
  );

  if (!horarioHoje) {
    return false;
  }

  const horaAtual =
    agora.getHours().toString().padStart(2, "0") +
    ":" +
    agora.getMinutes().toString().padStart(2, "0");

  const abre = horarioHoje.abre_em?.slice(0, 5);
  const fecha = horarioHoje.fecha_em?.slice(0, 5);

  if (!abre || !fecha) {
    return false;
  }

  // horário normal
  if (abre < fecha) {
    return horaAtual >= abre && horaAtual <= fecha;
  }

  // madrugada
  return horaAtual >= abre || horaAtual <= fecha;
}