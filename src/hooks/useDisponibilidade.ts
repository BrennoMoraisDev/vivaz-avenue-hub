import { useMemo } from 'react';
import { mockHorarios, mockAgendamentos, getServicoById } from '@/data/mockData';

/**
 * Calcula os slots de horário disponíveis para um barbeiro em uma data,
 * considerando seus horários de trabalho, agendamentos existentes e duração do serviço.
 */
export function useDisponibilidade(
  barbeiroId: string | null,
  data: string | null, // YYYY-MM-DD
  servicoId: string | null
) {
  const slots = useMemo(() => {
    if (!barbeiroId || !data || !servicoId) return [];

    const servico = getServicoById(servicoId);
    if (!servico) return [];

    const duracao = servico.duracao_minutos || 30;

    // Dia da semana (0=Dom, 1=Seg, ..., 6=Sab)
    const dateObj = new Date(data + 'T12:00:00');
    const diaSemana = dateObj.getDay();

    // Horários de trabalho do barbeiro neste dia
    const horariosDia = mockHorarios.filter(
      h => h.barbeiro_id === barbeiroId && h.dia_semana === diaSemana
    );

    if (horariosDia.length === 0) return [];

    // Agendamentos existentes neste dia (exceto cancelados/faltou)
    const agendamentosDia = mockAgendamentos.filter(
      a =>
        a.barbeiro_id === barbeiroId &&
        a.data === data &&
        !['cancelado', 'faltou'].includes(a.status)
    );

    const ocupados = agendamentosDia.map(a => {
      const srv = getServicoById(a.servico_id);
      const dur = srv?.duracao_minutos || 30;
      const [h, m] = a.hora.split(':').map(Number);
      const inicio = h * 60 + m;
      return { inicio, fim: inicio + dur };
    });

    const available: string[] = [];

    for (const horario of horariosDia) {
      const [hi, mi] = horario.inicio.split(':').map(Number);
      const [hf, mf] = horario.fim.split(':').map(Number);
      const inicioMin = hi * 60 + mi;
      const fimMin = hf * 60 + mf;

      // Generate slots every 30 minutes
      for (let t = inicioMin; t + duracao <= fimMin; t += 30) {
        const slotFim = t + duracao;

        // Check conflicts
        const conflito = ocupados.some(
          o => t < o.fim && slotFim > o.inicio
        );

        if (!conflito) {
          const hh = String(Math.floor(t / 60)).padStart(2, '0');
          const mm = String(t % 60).padStart(2, '0');
          available.push(`${hh}:${mm}`);
        }
      }
    }

    return available;
  }, [barbeiroId, data, servicoId]);

  return slots;
}

/**
 * Returns which days of the week a barber works (for calendar highlighting).
 */
export function useDiasTrabalho(barbeiroId: string | null) {
  return useMemo(() => {
    if (!barbeiroId) return new Set<number>();
    const dias = mockHorarios
      .filter(h => h.barbeiro_id === barbeiroId)
      .map(h => h.dia_semana);
    return new Set(dias);
  }, [barbeiroId]);
}
