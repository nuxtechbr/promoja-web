export function calcularTempoRestante(validade) {
  const agora = new Date();
  const fim = new Date(validade);
  const diferenca = fim - agora;

  if (diferenca <= 0) {
    return "Expirada";
  }

  const horas = Math.floor(
    diferenca / (1000 * 60 * 60)
  );

  const minutos = Math.floor(
    (diferenca / (1000 * 60)) % 60
  );

  if (horas > 0) {
    return `${horas}h ${minutos}min`;
  }

  return `${minutos}min`;
}