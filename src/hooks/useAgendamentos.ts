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

/**
 * Resolve o cliente_id correto para o usuário autenticado.
 * A tabela `agendamentos` referencia `clientes.id`.
 * A tabela `clientes` pode ter `user_id = profile.id` OU `id = profile.id` (upsert legado).
 * Tentamos ambas as estratégias para máxima compatibilidade.
 */
async function resolveClienteId(profileId: string): Promise<string | null> {
  // Estratégia 1: clientes.user_id = profile.id
  const { data: byUserId } = await supabase
    .from('clientes')
    .select('id')
    .eq('user_id', profileId)
    .maybeSingle();

  if (byUserId?.id) return byUserId.id;

  // Estratégia 2: clientes.id = profile.id (upsert legado do ClientePerfil)
  const { data: byId } = await supabase
    .from('clientes')
    .select('id')
    .eq('id', profileId)
    .maybeSingle();

  if (byId?.id) return byId.id;

  return null;
}

export function useAgendamentosCliente(filters?: { status?: AgendamentoStatus | 'todos' }) {
  const { profile } = useAuth();
  const [agendamentos, setAgendamentos] = useState<AgendamentoCliente[]>([]);
  const [loading, setLoading] = useState(true);
  const [clienteId, setClienteId] = useState<string | null>(null);

  // Resolve o cliente_id uma vez quando o profile estiver disponível
  useEffect(() => {
    if (!profile?.id) return;
    resolveClienteId(profile.id).then(setClienteId);
  }, [profile?.id]);

  const fetch = useCallback(async () => {
    if (!clienteId) return;

    setLoading(true);
    try {
      let query = supabase
        .from('agendamentos')
        .select('*, barbeiros(nome), servicos(nome, preco, duracao_minutos)')
        .eq('cliente_id', clienteId)
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
  }, [clienteId, filters?.status]);

  useEffect(() => {
    if (clienteId) {
      fetch();
    } else if (profile?.id && clienteId === null) {
      // clienteId ainda não resolvido, aguardar
      setLoading(true);
    }
  }, [fetch, clienteId, profile?.id]);

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
