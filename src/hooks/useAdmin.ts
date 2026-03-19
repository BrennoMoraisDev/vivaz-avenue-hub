import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import type { AgendamentoStatus } from '@/types/database.types';

// ─── Types ───────────────────────────────────────────────────────
export interface Barbeiro {
  id: string;
  nome: string | null;
  foto: string | null;
  telefone: string | null;
  especialidade: string | null;
  comissao: number | null;
  ativo: boolean;
  user_id: string | null;
  created_at: string;
}

export interface Servico {
  id: string;
  nome: string | null;
  descricao: string | null;
  preco: number | null;
  duracao_minutos: number | null;
  categoria_id: string | null;
  foto: string | null;
  ativo: boolean;
  created_at: string;
  categorias_servico?: { nome: string | null } | null;
}

export interface Categoria {
  id: string;
  nome: string | null;
  ordem: number | null;
}

export interface Cliente {
  id: string;
  nome: string | null;
  telefone: string | null;
  email: string | null;
  user_id: string | null;
  created_at: string;
}

export interface AgendamentoAdmin {
  id: string;
  data: string;
  hora: string;
  status: AgendamentoStatus;
  observacao: string | null;
  created_at: string;
  clientes: { nome: string | null; telefone: string | null } | null;
  servicos: { nome: string | null; preco: number | null; duracao_minutos: number | null } | null;
  barbeiros: { nome: string | null } | null;
}

export interface BloqueioAdmin {
  id: string;
  barbeiro_id: string;
  data: string;
  motivo: string | null;
  barbeiros?: { nome: string | null } | null;
}

export interface HorarioBarbeiro {
  id: string;
  barbeiro_id: string;
  dia_semana: number;
  inicio: string;
  fim: string;
}

// ─── Dashboard Metrics ──────────────────────────────────────────
export function useAdminMetrics() {
  const [metrics, setMetrics] = useState({
    faturamentoHoje: 0,
    faturamentoMes: 0,
    agendamentosHoje: 0,
    clientesCadastrados: 0,
    barbeirosAtivos: 0,
  });
  const [agendamentosPorDia, setAgendamentosPorDia] = useState<{ dia: string; total: number }[]>([]);
  const [servicosMaisRealizados, setServicosMaisRealizados] = useState<{ nome: string; total: number }[]>([]);
  const [proximosAgendamentos, setProximosAgendamentos] = useState<AgendamentoAdmin[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchMetrics = useCallback(async () => {
    setLoading(true);
    const hoje = new Date().toISOString().split('T')[0];
    const inicioMes = new Date();
    inicioMes.setDate(1);
    const inicioMesStr = inicioMes.toISOString().split('T')[0];

    // Parallel fetches
    try {
      const [
        { data: agHoje },
        { data: agMes },
        { count: clientesCount },
        { count: barbeirosCount },
        { data: proximos },
      ] = await Promise.all([
        supabase
          .from('agendamentos')
          .select('*, servicos(nome, preco)')
          .eq('data', hoje),
        supabase
          .from('agendamentos')
          .select('*, servicos(preco)')
          .eq('status', 'finalizado')
          .gte('data', inicioMesStr),
        supabase.from('clientes').select('*', { count: 'exact', head: true }),
        supabase.from('barbeiros').select('*', { count: 'exact', head: true }).eq('ativo', true),
        supabase
          .from('agendamentos')
          .select('*, clientes(nome, telefone), servicos(nome, preco, duracao_minutos), barbeiros(nome)')
          .gte('data', hoje)
          .in('status', ['agendado', 'confirmado'])
          .order('data')
          .order('hora')
          .limit(5),
      ]);

      const fatHoje = (agHoje || [])
        .filter((a: any) => a.status === 'finalizado')
        .reduce((s: number, a: any) => s + (a.servicos?.preco || 0), 0);
      const fatMes = (agMes || []).reduce((s: number, a: any) => s + (a.servicos?.preco || 0), 0);

      setMetrics({
        faturamentoHoje: fatHoje,
        faturamentoMes: fatMes,
        agendamentosHoje: (agHoje || []).length,
        clientesCadastrados: clientesCount || 0,
        barbeirosAtivos: barbeirosCount || 0,
      });
      setProximosAgendamentos((proximos as AgendamentoAdmin[]) || []);

      // Agendamentos por dia (últimos 7 dias)
      const nomesDia = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
      
      // Fetch last 7 days agendamentos for chart
      const seteDiasAtras = new Date();
      seteDiasAtras.setDate(seteDiasAtras.getDate() - 6);
      const { data: ag7dias } = await supabase
        .from('agendamentos')
        .select('data')
        .gte('data', seteDiasAtras.toISOString().split('T')[0]);

      const diasMap: Record<string, number> = {};
      for (let i = 6; i >= 0; i--) {
        const d = new Date();
        d.setDate(d.getDate() - i);
        diasMap[d.toISOString().split('T')[0]] = 0;
      }
      (ag7dias || []).forEach((a: any) => {
        if (diasMap[a.data] !== undefined) diasMap[a.data]++;
      });
      const diasChart = Object.entries(diasMap).map(([date, total]) => ({
        dia: nomesDia[new Date(date + 'T12:00:00').getDay()],
        total,
      }));
      setAgendamentosPorDia(diasChart);

      // Serviços mais realizados
      const { data: agServicos } = await supabase
        .from('agendamentos')
        .select('servicos(nome)')
        .eq('status', 'finalizado')
        .gte('data', inicioMesStr);

      const servMap: Record<string, number> = {};
      (agServicos || []).forEach((a: any) => {
        const nome = a.servicos?.nome || 'Desconhecido';
        servMap[nome] = (servMap[nome] || 0) + 1;
      });
      setServicosMaisRealizados(
        Object.entries(servMap)
          .map(([nome, total]) => ({ nome, total }))
          .sort((a, b) => b.total - a.total)
          .slice(0, 5)
      );
    } catch (error) {
      console.error('Erro ao buscar métricas:', error);
    } finally {
      setLoading(false);
    }


  }, []);

  useEffect(() => { fetchMetrics(); }, [fetchMetrics]);

  return { metrics, agendamentosPorDia, servicosMaisRealizados, proximosAgendamentos, loading, refetch: fetchMetrics };
}

// ─── Barbeiros CRUD ─────────────────────────────────────────────
export function useBarbeiros() {
  const [barbeiros, setBarbeiros] = useState<Barbeiro[]>([]);
  const [loading, setLoading] = useState(true);

  const fetch = useCallback(async () => {
    setLoading(true);
    const { data } = await supabase
      .from('barbeiros')
      .select('*')
      .order('nome');
    setBarbeiros((data as Barbeiro[]) || []);
    setLoading(false);
  }, []);

  useEffect(() => { fetch(); }, [fetch]);

  const criar = async (b: Partial<Barbeiro>) => {
    const { error } = await supabase.from('barbeiros').insert(b as any);
    if (!error) await fetch();
    return { error };
  };

  const atualizar = async (id: string, b: Partial<Barbeiro>) => {
    const { error } = await (supabase.from('barbeiros') as any).update(b).eq('id', id);
    if (!error) await fetch();
    return { error };
  };

  const toggleAtivo = async (id: string, ativo: boolean) => {
    return atualizar(id, { ativo } as any);
  };

  return { barbeiros, loading, refetch: fetch, criar, atualizar, toggleAtivo };
}

// ─── Horários Barbeiro ──────────────────────────────────────────
export function useHorariosBarbeiro(barbeiroId: string | undefined) {
  const [horarios, setHorarios] = useState<HorarioBarbeiro[]>([]);
  const [loading, setLoading] = useState(true);

  const fetch = useCallback(async () => {
    if (!barbeiroId) return;
    setLoading(true);
    const { data } = await supabase
      .from('horarios_barbeiro')
      .select('*')
      .eq('barbeiro_id', barbeiroId)
      .order('dia_semana')
      .order('inicio');
    setHorarios((data as HorarioBarbeiro[]) || []);
    setLoading(false);
  }, [barbeiroId]);

  useEffect(() => { fetch(); }, [fetch]);

  const salvar = async (novosHorarios: Omit<HorarioBarbeiro, 'id'>[]) => {
    if (!barbeiroId) return;
    // Delete existing, insert new
    await supabase.from('horarios_barbeiro').delete().eq('barbeiro_id', barbeiroId);
    if (novosHorarios.length > 0) {
      await supabase.from('horarios_barbeiro').insert(novosHorarios as any);
    }
    await fetch();
  };

  return { horarios, loading, refetch: fetch, salvar };
}

// ─── Serviços CRUD ──────────────────────────────────────────────
export function useServicos() {
  const [servicos, setServicos] = useState<Servico[]>([]);
  const [loading, setLoading] = useState(true);

  const fetch = useCallback(async () => {
    setLoading(true);
    const { data } = await supabase
      .from('servicos')
      .select('*, categorias_servico(nome)')
      .order('nome');
    setServicos((data as Servico[]) || []);
    setLoading(false);
  }, []);

  useEffect(() => { fetch(); }, [fetch]);

  const criar = async (s: Partial<Servico>) => {
    const { categorias_servico, ...rest } = s as any;
    const { error } = await supabase.from('servicos').insert(rest);
    if (!error) await fetch();
    return { error };
  };

  const atualizar = async (id: string, s: Partial<Servico>) => {
    const { categorias_servico, ...rest } = s as any;
    const { error } = await (supabase.from('servicos') as any).update(rest).eq('id', id);
    if (!error) await fetch();
    return { error };
  };

  const excluir = async (id: string) => {
    // Check if has agendamentos
    const { count } = await supabase
      .from('agendamentos')
      .select('*', { count: 'exact', head: true })
      .eq('servico_id', id);
    if (count && count > 0) {
      return { error: { message: 'Serviço possui agendamentos vinculados. Desative em vez de excluir.' } };
    }
    const { error } = await supabase.from('servicos').delete().eq('id', id);
    if (!error) await fetch();
    return { error };
  };

  return { servicos, loading, refetch: fetch, criar, atualizar, excluir };
}

// ─── Categorias CRUD ────────────────────────────────────────────
export function useCategorias() {
  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [loading, setLoading] = useState(true);

  const fetch = useCallback(async () => {
    setLoading(true);
    const { data } = await supabase
      .from('categorias_servico')
      .select('*')
      .order('ordem');
    setCategorias((data as Categoria[]) || []);
    setLoading(false);
  }, []);

  useEffect(() => { fetch(); }, [fetch]);

  const criar = async (c: Partial<Categoria>) => {
    const { error } = await supabase.from('categorias_servico').insert(c as any);
    if (!error) await fetch();
    return { error };
  };

  const atualizar = async (id: string, c: Partial<Categoria>) => {
    const { error } = await (supabase.from('categorias_servico') as any).update(c).eq('id', id);
    if (!error) await fetch();
    return { error };
  };

  const excluir = async (id: string) => {
    const { count } = await supabase
      .from('servicos')
      .select('*', { count: 'exact', head: true })
      .eq('categoria_id', id);
    if (count && count > 0) {
      return { error: { message: 'Categoria possui serviços vinculados.' } };
    }
    const { error } = await supabase.from('categorias_servico').delete().eq('id', id);
    if (!error) await fetch();
    return { error };
  };

  return { categorias, loading, refetch: fetch, criar, atualizar, excluir };
}

// ─── Clientes ───────────────────────────────────────────────────
export function useAdminClientes() {
  const [clientes, setClientes] = useState<(Cliente & { totalAgendamentos: number; ultimoAgendamento: string | null })[]>([]);
  const [loading, setLoading] = useState(true);

  const fetch = useCallback(async () => {
    setLoading(true);
    const { data: clientesData } = await supabase.from('perfis').select('*').eq('role', 'cliente').order('nome');
    
    // Get agendamentos counts
    const enriched = await Promise.all(
      (clientesData || []).map(async (c: any) => {
        const { count } = await supabase
          .from('agendamentos')
          .select('*', { count: 'exact', head: true })
          .eq('cliente_id', c.id);
        const { data: ultimo } = await supabase
          .from('agendamentos')
          .select('data')
          .eq('cliente_id', c.id)
          .order('data', { ascending: false })
          .limit(1);
        return {
          ...c,
          totalAgendamentos: count || 0,
          ultimoAgendamento: (ultimo as any)?.[0]?.data || null,
        };
      })
    );

    setClientes(enriched);
    setLoading(false);
  }, []);

  useEffect(() => { fetch(); }, [fetch]);

  const atualizar = async (id: string, c: Partial<Cliente>) => {
    const { error } = await (supabase.from('perfis') as any).update(c).eq('id', id);
    if (!error) await fetch();
    return { error };
  };

  return { clientes, loading, refetch: fetch, atualizar };
}

// ─── Agenda Admin ───────────────────────────────────────────────
export function useAdminAgenda(filters: {
  barbeiroId?: string;
  dataInicio?: string;
  dataFim?: string;
  status?: string;
}) {
  const [agendamentos, setAgendamentos] = useState<AgendamentoAdmin[]>([]);
  const [loading, setLoading] = useState(true);

  const fetch = useCallback(async () => {
    setLoading(true);
    let query = supabase
      .from('agendamentos')
      .select('*, clientes(nome, telefone), servicos(nome, preco, duracao_minutos), barbeiros(nome)')
      .order('data', { ascending: false })
      .order('hora', { ascending: false });

    if (filters.barbeiroId) query = query.eq('barbeiro_id', filters.barbeiroId);
    if (filters.dataInicio) query = query.gte('data', filters.dataInicio);
    if (filters.dataFim) query = query.lte('data', filters.dataFim);
    if (filters.status && filters.status !== 'todos') query = query.eq('status', filters.status);

    const { data } = await query;
    setAgendamentos((data as AgendamentoAdmin[]) || []);
    setLoading(false);
  }, [filters.barbeiroId, filters.dataInicio, filters.dataFim, filters.status]);

  useEffect(() => { fetch(); }, [fetch]);

  const atualizarStatus = async (id: string, status: AgendamentoStatus) => {
    const { error } = await (supabase.from('agendamentos') as any).update({ status }).eq('id', id);
    if (!error) await fetch();
    return { error };
  };

  return { agendamentos, loading, refetch: fetch, atualizarStatus };
}

// ─── Bloqueios ──────────────────────────────────────────────────
export function useAdminBloqueios() {
  const [bloqueios, setBloqueios] = useState<BloqueioAdmin[]>([]);
  const [loading, setLoading] = useState(true);

  const fetch = useCallback(async () => {
    setLoading(true);
    const { data } = await supabase
      .from('bloqueios_barbeiro')
      .select('*, barbeiros(nome)')
      .order('data', { ascending: false });
    setBloqueios((data as BloqueioAdmin[]) || []);
    setLoading(false);
  }, []);

  useEffect(() => { fetch(); }, [fetch]);

  const criar = async (b: { barbeiro_id: string; data: string; motivo?: string }) => {
    const { error } = await supabase.from('bloqueios_barbeiro').insert(b as any);
    if (!error) await fetch();
    return { error };
  };

  const excluir = async (id: string) => {
    const { error } = await supabase.from('bloqueios_barbeiro').delete().eq('id', id);
    if (!error) await fetch();
    return { error };
  };

  return { bloqueios, loading, refetch: fetch, criar, excluir };
}
