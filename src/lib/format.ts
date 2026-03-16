export function formatPreco(valor: number | null | undefined) {
  if (valor === null || valor === undefined) return 'R$ 0,00';
  return valor.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

export function formatDuracao(minutos: number | null | undefined) {
  if (minutos === null || minutos === undefined) return '0 min';
  if (minutos >= 60) {
    const h = Math.floor(minutos / 60);
    const m = minutos % 60;
    return m > 0 ? `${h}h ${m}min` : `${h}h`;
  }
  return `${minutos} min`;
}
