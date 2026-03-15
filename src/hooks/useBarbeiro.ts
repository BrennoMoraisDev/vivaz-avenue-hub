import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/hooks/useAuth';
import type { AgendamentoStatus } from '@/types/database.types';

// Types
export interface BarbeiroProfile {
  id: string;
  nome: string | null;
  foto: string | null;
  telefone: string | null;
  especialidade: string | null;
  comissao: number | null;
  ativo: boolean;
  user_id: string | null;
}

export interface AgendamentoCompleto {
  id: string;
  data: string;
  hora: string;
  status: AgendamentoStatus;
  observacao: string | null;
  created_at: string;
  clientes: { nome: string | null; telefone: string | null } | null;
  servicos: { nome: string | null; preco: number | null; duracao_minutos: number | null } | null;
}

export interface ClienteBusca {
  id: string;
  nome: string | null;
  telefone: string | null;
}

// Hook: get barbeiro profile linked to logged-in user
export function useBarbeiroProfile() {
  const { user } = useAuth();
  const [barbeiro, setBarbeiro] = useState<BarbeiroProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    supabase
      .from('barbeiros')
      .select('*')
      .eq('user_id', user.id)
      .single()
      .then(({ data }) => {
        setBarbeiro(data as BarbeiroProfile | null);
        setLoading(false);
      });
  }, [user]);

  return { barbeiro, loading };
}

// Hook: agendamentos for a specific date
export function useAgendamentosDoDia(barbeiroId: string | undefined, data: string) {
  const [agendamentos, setAgendamentos] = useState<AgendamentoCompleto[]>([]);
  const [loading, setLoading] = useState(true);

  const fetch = useCallback(async () => {
    if (!barbeiroId) return;
    setLoading(true);
    const { data: rows } = await supabase
      .from('agendamentos')
      .select('*, clientes(nome, telefone), servicos(nome, preco, duracao_minutos)')
      .eq('barbeiro_id', barbeiroId)
      .eq('data', data)
      .not('status', 'in', '("cancelado","faltou")')
      .order('hora');
    setAgendamentos((rows as AgendamentoCompleto[]) || []);
    setLoading(false);
  }, [barbeiroId, data]);

  useEffect(() => { fetch(); }, [fetch]);

  return { agendamentos, loading, refetch: fetch };
}

// Hook: agendamentos with filters (for agenda/historico)
export function useAgendamentosFiltrados(
  barbeiroId: string | undefined,
  filters: { dataInicio?: string; dataFim?: string; status?: string }
) {
  const [agendamentos, setAgendamentos] = useState<AgendamentoCompleto[]>([]);
  const [loading, setLoading] = useState(true);

  const fetch = useCallback(async () => {
    if (!barbeiroId) return;
    setLoading(true);
    let query = supabase
      .from('agendamentos')
      .select('*, clientes(nome, telefone), servicos(nome, preco, duracao_minutos)')
      .eq('barbeiro_id', barbeiroId)
      .order('data', { ascending: false })
      .order('hora', { ascending: false });

    if (filters.dataInicio) query = query.gte('data', filters.dataInicio);
    if (filters.dataFim) query = query.lte('data', filters.dataFim);
    if (filters.status && filters.status !== 'todos') query = query.eq('status', filters.status);

    const { data: rows } = await query;
    setAgendamentos((rows as AgendamentoCompleto[]) || []);
    setLoading(false);
  }, [barbeiroId, filters.dataInicio, filters.dataFim, filters.status]);

  useEffect(() => { fetch(); }, [fetch]);
  return { agendamentos, loading, refetch: fetch };
}

// Hook: ganhos calculation
export function useGanhos(barbeiroId: string | undefined, comissao: number) {
  const [ganhos, setGanhos] = useState({ hoje: 0, semana: 0, mes: 0, atendimentosHoje: 0 });
  const [loading, setLoading] = useState(true);

  const fetch = useCallback(async () => {
    if (!barbeiroId) return;
    setLoading(true);
    const hoje = new Date().toISOString().split('T')[0];
    const inicioSemana = new Date();
    inicioSemana.setDate(inicioSemana.getDate() - inicioSemana.getDay());
    const inicioMes = new Date();
    inicioMes.setDate(1);

    const { data: rows } = await supabase
      .from('agendamentos')
      .select('data, servicos(preco)')
      .eq('barbeiro_id', barbeiroId)
      .eq('status', 'finalizado')
      .gte('data', inicioMes.toISOString().split('T')[0]);

    const rate = (comissao || 50) / 100;
    let hojeTot = 0, semanaTot = 0, mesTot = 0, atHoje = 0;

    (rows || []).forEach((r: any) => {
      const preco = r.servicos?.preco || 0;
      const val = preco * rate;
      mesTot += val;
      if (r.data >= inicioSemana.toISOString().split('T')[0]) semanaTot += val;
      if (r.data === hoje) { hojeTot += val; atHoje++; }
    });

    setGanhos({ hoje: hojeTot, semana: semanaTot, mes: mesTot, atendimentosHoje: atHoje });
    setLoading(false);
  }, [barbeiroId, comissao]);

  useEffect(() => { fetch(); }, [fetch]);
  return { ganhos, loading, refetch: fetch };
}

// Hook: client search
export function useClientesSearch() {
  const [results, setResults] = useState<ClienteBusca[]>([]);
  const [searching, setSearching] = useState(false);

  const search = useCallback(async (termo: string) => {
    if (termo.length < 2) { setResults([]); return; }
    setSearching(true);
    const { data } = await supabase
      .from('clientes')
      .select('id, nome, telefone')
      .or(`nome.ilike.%${termo}%,telefone.ilike.%${termo}%`)
      .limit(10);
    setResults((data as ClienteBusca[]) || []);
    setSearching(false);
  }, []);

  return { results, searching, search };
}

// Helper: update agendamento status
export async function updateAgendamentoStatus(id: string, status: AgendamentoStatus) {
  return supabase.from('agendamentos').update({ status } as any).eq('id', id);
}

// Helper: insert manual appointment
export async function criarAtendimentoManual(params: {
  clienteId: string;
  barbeiroId: string;
  servicoId: string;
  data: string;
  hora: string;
  observacao?: string;
}) {
  return supabase.from('agendamentos').insert({
    cliente_id: params.clienteId,
    barbeiro_id: params.barbeiroId,
    servico_id: params.servicoId,
    data: params.data,
    hora: params.hora,
    status: 'finalizado' as AgendamentoStatus,
    observacao: params.observacao || 'Atendimento manual',
  } as any);
}

// Helper: insert new client
export async function criarCliente(nome: string, telefone: string) {
  return supabase.from('clientes').insert({ nome, telefone } as any).select().single();
}
