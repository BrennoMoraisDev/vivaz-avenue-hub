import { useState, useEffect, useMemo } from 'react';
import { supabase } from '@/lib/supabase';

export function useDisponibilidade(
  barbeiroId: string | null,
  data: string | null, // YYYY-MM-DD
  servicoId: string | null
) {
  const [horariosTrabalho, setHorariosTrabalho] = useState<any[]>([]);
  const [agendamentosOcupados, setAgendamentosOcupados] = useState<any[]>([]);
  const [servico, setServico] = useState<any>(null);

  useEffect(() => {
    if (!barbeiroId || !data || !servicoId) return;

    const fetchData = async () => {
      // 1. Buscar serviço
      const { data: srv } = await supabase
        .from('servicos')
        .select('*')
        .eq('id', servicoId)
        .single();
      setServico(srv);

      // 2. Buscar horários de trabalho
      const dateObj = new Date(data + 'T12:00:00');
      const diaSemana = dateObj.getDay();
      const { data: hrs } = await supabase
        .from('horarios_trabalho')
        .select('*')
        .eq('barbeiro_id', barbeiroId)
        .eq('dia_semana', diaSemana);
      setHorariosTrabalho(hrs || []);

      // 3. Buscar agendamentos ocupados
      const { data: ags } = await supabase
        .from('agendamentos')
        .select('hora, servicos(duracao_minutos)')
        .eq('barbeiro_id', barbeiroId)
        .eq('data', data)
        .not('status', 'in', '("cancelado", "faltou")');
      setAgendamentosOcupados(ags || []);
    };

    fetchData();
  }, [barbeiroId, data, servicoId]);

  const slots = useMemo(() => {
    if (!servico || horariosTrabalho.length === 0) return [];

    const duracao = servico.duracao_minutos || 30;
    const ocupados = agendamentosOcupados.map(a => {
      const dur = a.servicos?.duracao_minutos || 30;
      const [h, m] = a.hora.split(':').map(Number);
      const inicio = h * 60 + m;
      return { inicio, fim: inicio + dur };
    });

    const available: string[] = [];

    for (const horario of horariosTrabalho) {
      const [hi, mi] = horario.inicio.split(':').map(Number);
      const [hf, mf] = horario.fim.split(':').map(Number);
      const inicioMin = hi * 60 + mi;
      const fimMin = hf * 60 + mf;

      for (let t = inicioMin; t + duracao <= fimMin; t += 30) {
        const slotFim = t + duracao;
        const conflito = ocupados.some(o => t < o.fim && slotFim > o.inicio);

        if (!conflito) {
          const hh = String(Math.floor(t / 60)).padStart(2, '0');
          const mm = String(t % 60).padStart(2, '0');
          available.push(`${hh}:${mm}`);
        }
      }
    }

    return available;
  }, [servico, horariosTrabalho, agendamentosOcupados]);

  return slots;
}

export function useDiasTrabalho(barbeiroId: string | null) {
  const [dias, setDias] = useState<Set<number>>(new Set());

  useEffect(() => {
    if (!barbeiroId) return;
    const fetch = async () => {
      const { data } = await supabase
        .from('horarios_trabalho')
        .select('dia_semana')
        .eq('barbeiro_id', barbeiroId);
      
      if (data) {
        setDias(new Set(data.map(d => d.dia_semana)));
      }
    };
    fetch();
  }, [barbeiroId]);

  return dias;
}
