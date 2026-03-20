import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/hooks/useAuth';
import type { AgendamentoStatus } from '@/types/database.types';

export interface AgendamentoCliente {
  id: string;
  data: string;
  hora: string;
  status: AgendamentoStatus;
  observacao: string | null;
  created_at: string;
  barbeiros: { nome: string | null } | null;
  servicos: { nome: string | null; preco: number | null; duracao_minutos: number | null } | null;
}

export function useAgendamentosCliente(filters?: { status?: AgendamentoStatus | 'todos' }) {
  const { profile } = useAuth();
  const [agendamentos, setAgendamentos] = useState<AgendamentoCliente[]>([]);
  const [loading, setLoading] = useState(true);

  const fetch = useCallback(async () => {
    if (!profile?.id) return;
    
    setLoading(true);
    try {
      let query = supabase
        .from('agendamentos')
        .select('*, barbeiros(nome), servicos(nome, preco, duracao_minutos)')
        .eq('cliente_id', profile.id)
        .order('data', { ascending: false })
        .order('hora', { ascending: false });

      if (filters?.status && filters.status !== 'todos') {
        query = query.eq('status', filters.status);
      }

      const { data, error } = await query;
      
      if (error) throw error;
      
      setAgendamentos((data as AgendamentoCliente[]) || []);
    } catch (error) {
      console.error('Erro ao buscar agendamentos:', error);
      setAgendamentos([]);
    } finally {
      setLoading(false);
    }
  }, [profile?.id, filters?.status]);

  useEffect(() => {
    fetch();
  }, [fetch]);

  const cancelarAgendamento = async (id: string) => {
    try {
      const { error } = await (supabase
        .from('agendamentos') as any)
        .update({ status: 'cancelado' as const })
        .eq('id', id);
      
      if (error) throw error;
      await fetch();
      return { error: null };
    } catch (error) {
      return { error };
    }
  };

  return { agendamentos, loading, refetch: fetch, cancelarAgendamento };
}
